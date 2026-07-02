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

function parseBannerForm(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  if (!title || !imageUrl) {
    throw new Error("Judul dan URL gambar wajib diisi.");
  }

  return {
    badgeText: (formData.get("badgeText") as string)?.trim() || null,
    title,
    subtitle: (formData.get("subtitle") as string)?.trim() || null,
    imageUrl,
    ctaLabel: (formData.get("ctaLabel") as string)?.trim() || null,
    ctaLink: (formData.get("ctaLink") as string)?.trim() || null,
    sortOrder: parseInt(formData.get("sortOrder") as string, 10) || 0,
    isActive: formData.get("isActive") === "on",
  };
}

export async function createBannerAction(formData: FormData) {
  await requireSuperAdmin();
  const data = parseBannerForm(formData);

  await db.banner.create({ data });

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function updateBannerAction(bannerId: string, formData: FormData) {
  await requireSuperAdmin();
  const data = parseBannerForm(formData);

  await db.banner.update({ where: { id: bannerId }, data });

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBannerAction(bannerId: string) {
  await requireSuperAdmin();

  await db.banner.delete({ where: { id: bannerId } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
