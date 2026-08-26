"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";

export async function loginWithCredentials(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    // redirect: false supaya kita bisa tentukan sendiri tujuan redirect
    // berdasarkan role user (lihat di bawah), bukan selalu balik ke "/".
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau password salah." };
    }
    throw error;
  }

  // Kalau user datang dari halaman tertentu yang diblokir middleware
  // (mis. /admin/products), balik ke situ. Kalau tidak, arahkan
  // berdasarkan role: admin/staff -> dashboard masing-masing, customer -> home.
  if (callbackUrl !== "/") {
    redirect(appendQueryParam(callbackUrl, "login", "success"));
  }

  const user = await db.user.findUnique({ where: { email }, select: { role: true } });
  if (user?.role === "STAFF_GUDANG") {
    redirect("/admin/warehouses/dashboard?login=success");
  }
  if (user?.role === "SUPER_ADMIN" || user?.role === "CS") {
    redirect("/admin/dashboard?login=success");
  }
  redirect("/?login=success");
}

export async function loginWithGoogle(formData: FormData) {
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");
  const redirectTo =
    callbackUrl !== "/" ? appendQueryParam(callbackUrl, "login", "success") : "/?login=success";
  await signIn("google", { redirectTo });
}

function appendQueryParam(url: string, key: string, value: string) {
  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${path}?${params.toString()}`;
}
