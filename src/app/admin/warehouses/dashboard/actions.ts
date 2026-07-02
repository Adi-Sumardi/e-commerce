"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== OrderStatus.PROCESSING) {
    throw new Error("Order must be in PROCESSING status to be shipped.");
  }

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
        warehouseId: order.warehouseId ?? "",
        courierCode: order.courierCode ?? "jne",
        courierService: order.courierService ?? "reg",
        waybillNumber: `TRACK-${order.orderNumber}`,
        status: "CONFIRMED",
      },
    }),
  ]);

  revalidatePath("/admin/warehouses/dashboard");
  return { success: true };
}
