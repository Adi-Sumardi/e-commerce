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

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createCategoryAction(formData: FormData) {
  await requireSuperAdmin();

  const name = (formData.get("name") as string)?.trim();
  const parentId = (formData.get("parentId") as string) || null;
  if (!name) throw new Error("Nama kategori wajib diisi.");

  const slug = slugify(name);

  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("Sudah ada kategori dengan nama/slug yang sama.");
  }

  await db.category.create({
    data: { name, slug, parentId },
  });

  revalidatePath("/admin/categories");
}

export async function updateCategoryAction(categoryId: string, formData: FormData) {
  await requireSuperAdmin();

  const name = (formData.get("name") as string)?.trim();
  const parentId = (formData.get("parentId") as string) || null;
  if (!name) throw new Error("Nama kategori wajib diisi.");

  const slug = slugify(name);
  const existing = await db.category.findUnique({ where: { slug } });
  if (existing && existing.id !== categoryId) {
    throw new Error("Sudah ada kategori lain dengan nama/slug yang sama.");
  }

  await db.category.update({
    where: { id: categoryId },
    data: {
      name,
      slug,
      parentId: parentId === categoryId ? null : parentId,
    },
  });

  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(categoryId: string) {
  await requireSuperAdmin();

  const productCount = await db.product.count({ where: { categoryId } });
  if (productCount > 0) {
    throw new Error("Kategori masih dipakai produk, tidak bisa dihapus.");
  }

  await db.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
}
