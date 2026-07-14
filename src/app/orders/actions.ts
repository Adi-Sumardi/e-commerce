"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendWhatsappMessage, formatWhatsappOrderItems, buildWhatsappMessage } from "@/lib/whatsapp";
import { formatIDR } from "@/app/_data";
import { SITE_URL } from "@/lib/site";

export async function submitPaymentProofAction(orderId: string, proofUrl: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return { success: false, error: "Harap masuk terlebih dahulu." };
  }

  const trimmedUrl = proofUrl.trim();
  if (!trimmedUrl) {
    return { success: false, error: "URL bukti transfer wajib diisi." };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      user: { select: { name: true } },
      items: { select: { productNameSnapshot: true, quantity: true } },
    },
  });

  if (!order || order.userId !== session.user.id) {
    return { success: false, error: "Order tidak ditemukan." };
  }

  const payment = order.payments[0];
  if (!payment || payment.method !== "MANUAL_TRANSFER" || payment.status !== "PENDING") {
    return { success: false, error: "Order ini tidak sedang menunggu konfirmasi transfer manual." };
  }

  await db.payment.update({
    where: { id: payment.id },
    data: { proofUrl: trimmedUrl },
  });

  // Push notifikasi ke semua Super Admin untuk konfirmasi pembayaran manual.
  try {
    const admins = await db.user.findMany({
      where: { role: "SUPER_ADMIN", isActive: true },
      select: { id: true },
    });

    await db.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        orderId: order.id,
        type: "PAYMENT_PROOF_SUBMITTED" as const,
        title: "Konfirmasi Pembayaran Diperlukan",
        message: `Bukti transfer untuk order #${order.orderNumber} baru saja dikirim customer. Segera cek & konfirmasi.`,
      })),
    });
  } catch (err) {
    console.warn("Gagal membuat notifikasi konfirmasi pembayaran:", err);
  }

  // Notifikasi WhatsApp ke admin — perlu segera dicek & diapprove.
  if (process.env.ADMIN_WHATSAPP_NUMBER) {
    try {
      await sendWhatsappMessage(
        process.env.ADMIN_WHATSAPP_NUMBER,
        buildWhatsappMessage([
          "🔔 *Pembayaran Perlu Diapprove*",
          "",
          `Order: #${order.orderNumber}`,
          `Customer: ${order.user.name}`,
          `Total: ${formatIDR(Number(order.total))}`,
          "",
          "Item:",
          formatWhatsappOrderItems(order.items),
          "",
          `Cek & konfirmasi: ${SITE_URL}/admin/orders`,
        ])
      );
    } catch (err) {
      console.warn("Gagal mengirim notifikasi WhatsApp ke admin:", err);
    }
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/orders");

  return { success: true };
}
