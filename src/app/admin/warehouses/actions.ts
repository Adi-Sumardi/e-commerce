"use server";

import bcrypt from "bcryptjs";
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

function parseWarehouseForm(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const phone = (formData.get("phone") as string)?.trim();
  const province = (formData.get("province") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const district = (formData.get("district") as string)?.trim();
  const postalCode = (formData.get("postalCode") as string)?.trim();
  const fullAddress = (formData.get("fullAddress") as string)?.trim();
  const biteshipAreaId = (formData.get("biteshipAreaId") as string)?.trim() || null;
  const isActive = formData.get("isActive") === "on";

  if (!name || !code || !phone || !province || !city || !district || !postalCode || !fullAddress) {
    throw new Error("Semua field data gudang wajib diisi.");
  }

  return { name, code, phone, province, city, district, postalCode, fullAddress, biteshipAreaId, isActive };
}

export async function createWarehouseAction(formData: FormData) {
  await requireSuperAdmin();
  const data = parseWarehouseForm(formData);

  const existing = await db.warehouse.findUnique({ where: { code: data.code } });
  if (existing) throw new Error("Kode gudang sudah dipakai, gunakan kode lain.");

  await db.warehouse.create({ data });
  revalidatePath("/admin/warehouses");
}

export async function updateWarehouseAction(warehouseId: string, formData: FormData) {
  await requireSuperAdmin();
  const data = parseWarehouseForm(formData);

  const existing = await db.warehouse.findUnique({ where: { code: data.code } });
  if (existing && existing.id !== warehouseId) {
    throw new Error("Kode gudang sudah dipakai gudang lain.");
  }

  await db.warehouse.update({ where: { id: warehouseId }, data });
  revalidatePath("/admin/warehouses");
}

export async function deleteWarehouseAction(warehouseId: string) {
  await requireSuperAdmin();

  const [orderCount, staffCount] = await Promise.all([
    db.order.count({ where: { warehouseId } }),
    db.warehouseStaff.count({ where: { warehouseId } }),
  ]);
  if (orderCount > 0) {
    return { error: "Gudang ini sudah punya riwayat order, tidak bisa dihapus (nonaktifkan saja)." };
  }
  if (staffCount > 0) {
    return { error: "Masih ada staff yang ditugaskan ke gudang ini — pindahkan/hapus staff dulu." };
  }

  await db.warehouse.delete({ where: { id: warehouseId } });
  revalidatePath("/admin/warehouses");
}

export async function createWarehouseStaffAction(formData: FormData) {
  await requireSuperAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const warehouseId = formData.get("warehouseId") as string;

  if (!name || !email || !password || password.length < 8 || !warehouseId) {
    throw new Error("Lengkapi nama, email, password (min. 8 karakter), dan pilih gudang.");
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email sudah terdaftar sebagai akun lain.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: { name, email, passwordHash, role: "STAFF_GUDANG" },
  });

  await db.warehouseStaff.create({
    data: { userId: user.id, warehouseId },
  });

  revalidatePath("/admin/warehouses");
}

export async function removeWarehouseStaffAction(warehouseStaffId: string) {
  await requireSuperAdmin();

  await db.warehouseStaff.delete({ where: { id: warehouseStaffId } });
  revalidatePath("/admin/warehouses");
}

export async function deactivateStaffUserAction(userId: string) {
  await requireSuperAdmin();

  await db.user.update({ where: { id: userId }, data: { isActive: false } });
  revalidatePath("/admin/warehouses");
}
