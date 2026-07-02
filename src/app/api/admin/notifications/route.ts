import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const warehouseId = searchParams.get("warehouseId");

  // Kalau warehouseId diisi: notifikasi antrean order per gudang (dashboard staff gudang).
  // Kalau tidak: notifikasi personal untuk user yang login (mis. Super Admin — konfirmasi pembayaran).
  const notifications = await db.notification.findMany({
    where: warehouseId
      ? { warehouseId, isRead: false }
      : { userId: session.user.id, isRead: false },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { notificationIds } = await req.json();

    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      await db.notification.updateMany({
        where: {
          id: {
            in: notificationIds,
          },
        },
        data: {
          isRead: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
