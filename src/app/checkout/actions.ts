"use server";

import { auth } from "@/lib/auth";
import { CheckoutService } from "@/server/services/checkout-service";
import { AddressRepository } from "@/server/repositories/address-repository";
import { sendWhatsappMessage, formatWhatsappOrderItems, buildWhatsappMessage } from "@/lib/whatsapp";
import { formatIDR } from "@/app/_data";
import { SITE_URL } from "@/lib/site";
import { db } from "@/lib/db";

export async function getCheckoutDataAction(items: { productVariantId: string; quantity: number }[]) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await CheckoutService.getCheckoutData(session.user.id, items);
  
  // Since Address model may contain Date objects, let's serialize them to plain JSON
  return JSON.parse(JSON.stringify(result));
}

export async function applyVoucherAction(code: string, subtotal: number) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized");
  }

  const cleanCode = code.trim().toUpperCase();
  const voucher = await db.voucher.findUnique({
    where: { code: cleanCode },
  });

  if (!voucher) {
    return { success: false, message: "Kode voucher tidak ditemukan." };
  }

  const now = new Date();
  if (voucher.startDate > now || voucher.endDate < now) {
    return { success: false, message: "Voucher ini sedang tidak aktif atau sudah kedaluwarsa." };
  }

  if (voucher.quota <= 0) {
    return { success: false, message: "Kuota pemakaian voucher ini sudah habis." };
  }

  if (subtotal < Number(voucher.minPurchase)) {
    return {
      success: false,
      message: `Minimal belanja untuk voucher ini adalah Rp ${Number(voucher.minPurchase).toLocaleString("id-ID")}`,
    };
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (voucher.type === "PERCENTAGE") {
    discountAmount = Math.round(subtotal * (Number(voucher.value) / 100));
  } else {
    discountAmount = Number(voucher.value);
  }

  // Cap discount if necessary, but here we can just use the calculated value
  discountAmount = Math.min(discountAmount, subtotal);

  return {
    success: true,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: Number(voucher.value),
      discountAmount,
    },
  };
}

export async function placeOrderAction(params: {
  addressId: string;
  courierId: string;
  courierName: string;
  courierPrice: number;
  paymentMethod: "va" | "qris" | "gopay" | "manual_transfer";
  paymentChannelId?: string | null;
  preorderScheme: "full" | "dp";
  items: { productVariantId: string; quantity: number }[];
  voucherId?: string | null;
  discount?: number;
}) {
  const session = await auth();
  if (!session || !session.user?.id || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const result = await CheckoutService.placeOrder({
    userId: session.user.id,
    addressId: params.addressId,
    courierId: params.courierId,
    courierName: params.courierName,
    courierPrice: params.courierPrice,
    paymentMethod: params.paymentMethod,
    paymentChannelId: params.paymentChannelId,
    preorderScheme: params.preorderScheme,
    items: params.items,
    email: session.user.email,
    voucherId: params.voucherId,
    discount: params.discount,
  });

  return result;
}

export async function getAddressesAction() {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await AddressRepository.findByUserId(session.user.id);
  return JSON.parse(JSON.stringify(result));
}

export async function addAddressAction(data: {
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
  biteshipAreaId: string;
}) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized");
  }
  if (!data.biteshipAreaId) {
    throw new Error("Area tujuan Biteship wajib dipilih dari hasil pencarian.");
  }

  // If this is the first address, make it default
  const existing = await db.address.findFirst({
    where: { userId: session.user.id },
  });

  const address = await db.address.create({
    data: {
      userId: session.user.id,
      label: data.label,
      recipientName: data.recipientName,
      phone: data.phone,
      province: data.province,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      fullAddress: data.fullAddress,
      biteshipAreaId: data.biteshipAreaId,
      isDefault: !existing,
    },
  });
  return JSON.parse(JSON.stringify(address));
}

export async function simulateMockPaymentAction(paymentId: string) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === "PAID") {
    return { success: true, orderId: payment.orderId };
  }

  await db.$transaction([
    db.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    }),
    db.order.update({
      where: { id: payment.orderId },
      data: {
        status: "PAID",
      },
    }),
    db.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        status: "PAID",
        note: "Pembayaran sukses diterima (simulasi mock).",
      },
    }),
  ]);

  // Create real-time notification record in DB
  try {
    const order = await db.order.findUnique({
      where: { id: payment.orderId },
      select: {
        warehouseId: true,
        orderNumber: true,
        userId: true,
        total: true,
        warehouse: { select: { phone: true } },
        user: { select: { name: true } },
        items: { select: { productNameSnapshot: true, quantity: true } },
      },
    });

    if (order && order.warehouseId) {
      await db.notification.create({
        data: {
          userId: order.userId,
          orderId: payment.orderId,
          warehouseId: order.warehouseId,
          type: "NEW_ORDER",
          title: "Order Baru Masuk",
          message: `Order #${order.orderNumber} telah dibayar dan siap diproses di gudang.`,
        },
      });

      if (order.warehouse?.phone) {
        await sendWhatsappMessage(
          order.warehouse.phone,
          buildWhatsappMessage([
            "📦 *Order Siap Dikirim*",
            "",
            `Order: #${order.orderNumber}`,
            `Customer: ${order.user.name}`,
            `Total: ${formatIDR(Number(order.total))}`,
            "",
            "Item:",
            formatWhatsappOrderItems(order.items),
            "",
            `Proses & kirim: ${SITE_URL}/admin/warehouses/dashboard`,
          ])
        );
      }
    }
  } catch (err) {
    console.warn("Failed to create dashboard notification:", err);
  }

  return { success: true, orderId: payment.orderId };
}
