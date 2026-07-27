"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return { error: "Harap masuk terlebih dahulu." };
  }

  if (data.newPassword.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return { error: "Akun tidak ditemukan." };
  }

  if (user.passwordHash) {
    if (!data.currentPassword) {
      return { error: "Harap isi password saat ini." };
    }
    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) {
      return { error: "Password saat ini salah." };
    }
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  return { success: true };
}
