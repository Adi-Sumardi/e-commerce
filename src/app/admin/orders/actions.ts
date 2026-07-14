"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendWhatsappMessage, formatWhatsappOrderItems, buildWhatsappMessage } from "@/lib/whatsapp";
import { formatIDR } from "@/app/_data";
import { SITE_URL } from "@/lib/site";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }
  return session;
}

export async function confirmManualPaymentAction(orderId: string) {
  await requireSuperAdmin();

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      warehouse: { select: { phone: true } },
      user: { select: { name: true } },
      items: { select: { productNameSnapshot: true, quantity: true } },
    },
  });

  if (!order) {
    throw new Error("Order tidak ditemukan.");
  }

  const payment = order.payments[0];
  if (!payment || payment.method !== "MANUAL_TRANSFER" || payment.status !== "PENDING") {
    throw new Error("Order ini tidak menunggu konfirmasi transfer manual.");
  }

  await db.$transaction([
    db.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: new Date() },
    }),
    db.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    }),
    db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "PAID",
        note: "Pembayaran transfer manual dikonfirmasi oleh admin.",
      },
    }),
    // Notifikasi konfirmasi-pembayaran terkait order ini sudah selesai ditindaklanjuti.
    db.notification.updateMany({
      where: { orderId: order.id, type: "PAYMENT_PROOF_SUBMITTED" },
      data: { isRead: true },
    }),
  ]);

  // Beri tahu dashboard gudang bahwa order ini siap diproses (kalau ada gudang tujuan).
  if (order.warehouseId) {
    try {
      await db.notification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          warehouseId: order.warehouseId,
          type: "NEW_ORDER",
          title: "Order Siap Diproses",
          message: `Order #${order.orderNumber} sudah dikonfirmasi lunas dan siap diproses/dikirim.`,
        },
      });
    } catch (err) {
      console.warn("Gagal membuat notifikasi gudang:", err);
    }

    if (order.warehouse?.phone) {
      try {
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
      } catch (err) {
        console.warn("Gagal mengirim notifikasi WhatsApp ke gudang:", err);
      }
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${order.id}`);
  revalidatePath(`/track/${order.id}`);
}
