"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
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
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${order.id}`);
  revalidatePath(`/track/${order.id}`);
}
