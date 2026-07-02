"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    throw new Error("Tidak diizinkan.");
  }
}

export async function getStoreSettingsAction() {
  return db.storeSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      description: "Toko online terpercaya untuk kebutuhan Anda. Kualitas terjamin, pengiriman cepat.",
    },
    update: {},
  });
}

export async function updateStoreSettingsAction(formData: FormData) {
  await requireSuperAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();

  if (!name || !email || !description || !phone || !whatsapp) {
    throw new Error("Semua field informasi toko wajib diisi.");
  }

  await db.storeSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", name, email, description, phone, whatsapp },
    update: { name, email, description, phone, whatsapp },
  });

  revalidatePath("/admin/settings");
}
