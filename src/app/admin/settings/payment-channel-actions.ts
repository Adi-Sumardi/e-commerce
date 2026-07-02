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
}

function parsePaymentChannelForm(formData: FormData) {
  const type = formData.get("type") as "BANK_TRANSFER" | "QRIS_STATIC";
  const label = (formData.get("label") as string)?.trim();
  if (!label || !type) {
    throw new Error("Label dan tipe metode pembayaran wajib diisi.");
  }

  if (type === "BANK_TRANSFER") {
    const bankName = (formData.get("bankName") as string)?.trim();
    const accountNumber = (formData.get("accountNumber") as string)?.trim();
    const accountHolder = (formData.get("accountHolder") as string)?.trim();
    if (!bankName || !accountNumber || !accountHolder) {
      throw new Error("Nama bank, nomor rekening, dan atas nama wajib diisi untuk transfer bank.");
    }
    return {
      type,
      label,
      bankName,
      accountNumber,
      accountHolder,
      qrisImageUrl: null,
      instructions: (formData.get("instructions") as string)?.trim() || null,
      sortOrder: parseInt(formData.get("sortOrder") as string, 10) || 0,
      isActive: formData.get("isActive") === "on",
    };
  }

  const qrisImageUrl = (formData.get("qrisImageUrl") as string)?.trim();
  if (!qrisImageUrl) {
    throw new Error("URL gambar QRIS wajib diisi.");
  }
  return {
    type,
    label,
    bankName: null,
    accountNumber: null,
    accountHolder: null,
    qrisImageUrl,
    instructions: (formData.get("instructions") as string)?.trim() || null,
    sortOrder: parseInt(formData.get("sortOrder") as string, 10) || 0,
    isActive: formData.get("isActive") === "on",
  };
}

export async function createPaymentChannelAction(formData: FormData) {
  await requireSuperAdmin();
  const data = parsePaymentChannelForm(formData);

  await db.paymentChannel.create({ data });
  revalidatePath("/admin/settings");
}

export async function updatePaymentChannelAction(channelId: string, formData: FormData) {
  await requireSuperAdmin();
  const data = parsePaymentChannelForm(formData);

  await db.paymentChannel.update({ where: { id: channelId }, data });
  revalidatePath("/admin/settings");
}

export async function deletePaymentChannelAction(channelId: string) {
  await requireSuperAdmin();

  const paymentCount = await db.payment.count({ where: { paymentChannelId: channelId } });
  if (paymentCount > 0) {
    throw new Error("Rekening/QRIS ini sudah pernah dipakai transaksi, nonaktifkan saja daripada dihapus.");
  }

  await db.paymentChannel.delete({ where: { id: channelId } });
  revalidatePath("/admin/settings");
}
