import { NextRequest, NextResponse } from "next/server";
import { verifyBiteshipWebhookSecret } from "@/lib/biteship";
import { db } from "@/lib/db";

// Referensi: docs/SRS.md FR-5.3 — webhook wajib idempotent & terverifikasi.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-biteship-webhook-secret");
  if (!verifyBiteshipWebhookSecret(secret)) {
    return NextResponse.json({ message: "Invalid webhook secret" }, { status: 401 });
  }

  const payload = await req.json();

  const shipment = await db.shipment.findUnique({
    where: { biteshipOrderId: payload.order_id },
  });
  if (!shipment) {
    return NextResponse.json({ message: "Shipment not found" }, { status: 404 });
  }

  await db.shipmentTracking.create({
    data: {
      shipmentId: shipment.id,
      status: payload.status,
      description: payload.note ?? null,
      eventTime: new Date(payload.updated_at ?? Date.now()),
    },
  });

  // TODO: update Shipment.status & Order.status sesuai payload.status
  // (lihat alur di docs/SRS.md §6.2).

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
