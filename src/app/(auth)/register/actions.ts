"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";

export async function registerCustomer(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "Lengkapi nama, email, dan password minimal 8 karakter." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar. Silakan masuk." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: { name, email, passwordHash, role: "CUSTOMER" },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Akun berhasil dibuat, tapi gagal masuk otomatis. Silakan login." };
    }
    throw error;
  }
}
