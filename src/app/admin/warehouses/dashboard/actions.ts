"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createBiteshipOrder } from "@/lib/biteship";

export async function processOrderAction(orderId: string) {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "STAFF_GUDANG" && (session.user as any).role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized access. Staff role required.");
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== OrderStatus.PAID) {
    throw new Error("Order must be in PAID status to be processed.");
  }

  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PROCESSING },
    }),
    db.orderStatusHistory.create({
      data: {
        orderId,
        status: OrderStatus.PROCESSING,
        note: "Pesanan sedang dipersiapkan oleh petugas gudang.",
      },
    }),
  ]);

  revalidatePath("/admin/warehouses/dashboard");
  return { success: true };
}

export async function shipOrderAction(orderId: string) {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "STAFF_GUDANG" && (session.user as any).role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized access. Staff role required.");
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      address: true,
      warehouse: true,
      items: { include: { productVariant: { include: { product: true } } } },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== OrderStatus.PROCESSING) {
    throw new Error("Order must be in PROCESSING status to be shipped.");
  }
  if (!order.warehouse?.biteshipAreaId) {
    throw new Error("Gudang asal order ini belum punya Biteship Area ID. Lengkapi dulu di menu Data Gudang.");
  }
  if (!order.address.biteshipAreaId) {
    throw new Error("Alamat tujuan order ini belum punya Biteship Area ID (order lama sebelum area search dibenahi).");
  }
  if (!order.courierCode || !order.courierService) {
    throw new Error("Order ini tidak punya data kurir yang valid.");
  }

  const biteshipItems = order.items.map((item) => ({
    name: item.productNameSnapshot,
    description: item.productNameSnapshot,
    value: Number(item.priceSnapshot),
    quantity: item.quantity,
    weight: Number(item.productVariant.product.weightGrams) || 200,
  }));

  const biteshipOrder = await createBiteshipOrder({
    origin_contact_name: order.warehouse.name,
    origin_contact_phone: order.warehouse.phone,
    origin_address: order.warehouse.fullAddress,
    origin_area_id: order.warehouse.biteshipAreaId,
    destination_contact_name: order.address.recipientName,
    destination_contact_phone: order.address.phone,
    destination_address: order.address.fullAddress,
    destination_area_id: order.address.biteshipAreaId,
    courier_company: order.courierCode,
    courier_type: order.courierService,
    delivery_type: "now",
    order_note: `Pesanan ${order.orderNumber} - Pratama Jaya`,
    items: biteshipItems,
  }) as { id?: string; courier?: { waybill_id?: string; tracking_id?: string; link?: string } };

  const waybillNumber = biteshipOrder.courier?.waybill_id ?? null;
  const trackingUrl = waybillNumber
    ? `https://track.biteship.com/${waybillNumber}`
    : biteshipOrder.courier?.link ?? null;

  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPED },
    }),
    db.orderStatusHistory.create({
      data: {
        orderId,
        status: OrderStatus.SHIPPED,
        note: "Pesanan telah diserahkan ke kurir untuk pengiriman.",
      },
    }),
    db.shipment.create({
      data: {
        orderId,
        warehouseId: order.warehouseId!,
        biteshipOrderId: biteshipOrder.id ?? null,
        courierCode: order.courierCode,
        courierService: order.courierService,
        waybillNumber,
        trackingUrl,
        status: "CONFIRMED",
      },
    }),
  ]);

  revalidatePath("/admin/warehouses/dashboard");
  return { success: true };
}
