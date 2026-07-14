import { NextRequest, NextResponse } from "next/server";
import { verifyXenditCallbackToken } from "@/lib/xendit";
import { sendWhatsappMessage } from "@/lib/whatsapp";
import { db } from "@/lib/db";

// Referensi: docs/SRS.md FR-4.2, FR-4.3 — webhook wajib idempotent & terverifikasi.
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-callback-token");
  if (!verifyXenditCallbackToken(token)) {
    return NextResponse.json({ message: "Invalid callback token" }, { status: 401 });
  }

  const payload = await req.json();

  const payment = await db.payment.findUnique({ where: { xenditId: payload.id } });
  if (!payment) {
    return NextResponse.json({ message: "Payment not found" }, { status: 404 });
  }

  // Idempotency guard: skip jika sudah diproses sebelumnya.
  if (payment.status === "PAID") {
    return NextResponse.json({ message: "Already processed" }, { status: 200 });
  }

  await db.paymentLog.create({
    data: {
      paymentId: payment.id,
      eventType: payload.status ?? "unknown",
      rawPayload: payload,
    },
  });

  const isPaidPayload = payload.status === "PAID" || payload.status === "SETTLED" || payload.status === "COMPLETED";

  if (isPaidPayload) {
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
          note: "Pembayaran sukses diterima via Xendit webhook callback.",
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
          warehouse: { select: { phone: true } },
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
            message: `Order #${order.orderNumber} telah sukses dibayar via Xendit.`,
          },
        });

        if (order.warehouse?.phone) {
          await sendWhatsappMessage(
            order.warehouse.phone,
            `Order siap dikirim\nOrder #${order.orderNumber} sudah sukses dibayar via Xendit. Segera proses & kirim barangnya.`
          );
        }
      }
    } catch (err) {
      console.warn("Failed to create webhook dashboard notification:", err);
    }
  }

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
