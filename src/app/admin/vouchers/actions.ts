"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function createVoucherAction(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const code = (formData.get("code") as string).trim().toUpperCase();
  const type = formData.get("type") as "PERCENTAGE" | "FIXED";
  const value = parseFloat(formData.get("value") as string);
  const minPurchase = parseFloat(formData.get("minPurchase") as string) || 0;
  const quota = parseInt(formData.get("quota") as string, 10);
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);

  if (!code || !type || isNaN(value) || isNaN(quota)) {
    throw new Error("Data tidak valid");
  }

  await db.voucher.create({
    data: {
      code,
      type,
      value,
      minPurchase,
      quota,
      startDate,
      endDate,
    },
  });

  revalidatePath("/admin/vouchers");
}

export async function deleteVoucherAction(voucherId: string) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  await db.voucher.delete({ where: { id: voucherId } });
  revalidatePath("/admin/vouchers");
}
