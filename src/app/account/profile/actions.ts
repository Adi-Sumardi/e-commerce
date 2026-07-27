"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Email sengaja tidak bisa diedit di sini — dipakai sebagai identitas login
// NextAuth (session JWT tidak otomatis refresh begitu email di DB berubah).
export async function updateProfileAction(data: { name: string }) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return { error: "Harap masuk terlebih dahulu." };
  }

  const name = data.name.trim();
  if (!name) {
    return { error: "Nama wajib diisi." };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");

  return { success: true };
}
