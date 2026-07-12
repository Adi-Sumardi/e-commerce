"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProductStatus, PreorderPaymentType, Prisma } from "@prisma/client";

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

interface ParsedProductForm {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  basePrice: number;
  compareAtPrice: number | null;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  status: ProductStatus;
  isPreorder: boolean;
  preorderPaymentType: PreorderPaymentType | null;
  preorderDpPercentage: number | null;
  preorderEstimatedDate: Date | null;
  images: string[];
  variants: { sku: string; name: string; price: number; stock: number }[];
  specs: { label: string; value: string }[];
}

function parseProductForm(formData: FormData): ParsedProductForm {
  const name = (formData.get("name") as string)?.trim();
  const categoryId = formData.get("categoryId") as string;
  const description = (formData.get("description") as string)?.trim() ?? "";
  const basePrice = parseFloat(formData.get("basePrice") as string);
  const compareAtPriceRaw = formData.get("compareAtPrice") as string;
  const compareAtPrice = compareAtPriceRaw ? parseFloat(compareAtPriceRaw) : null;
  const weightGrams = parseFloat(formData.get("weightGrams") as string) || 0;
  const lengthCm = parseFloat(formData.get("lengthCm") as string) || 0;
  const widthCm = parseFloat(formData.get("widthCm") as string) || 0;
  const heightCm = parseFloat(formData.get("heightCm") as string) || 0;
  const status = formData.get("status") as ProductStatus;
  const isPreorder = formData.get("isPreorder") === "on";
  const preorderPaymentType = isPreorder
    ? ((formData.get("preorderPaymentType") as string) as PreorderPaymentType) || null
    : null;
  const preorderDpPercentageRaw = formData.get("preorderDpPercentage") as string;
  const preorderDpPercentage =
    isPreorder && preorderPaymentType === "DOWN_PAYMENT" && preorderDpPercentageRaw
      ? parseFloat(preorderDpPercentageRaw)
      : null;
  const preorderEstimatedDateRaw = formData.get("preorderEstimatedDate") as string;
  const preorderEstimatedDate =
    isPreorder && preorderEstimatedDateRaw ? new Date(preorderEstimatedDateRaw) : null;

  const images = (formData.get("images") as string)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const skus = formData.getAll("variant_sku") as string[];
  const names = formData.getAll("variant_name") as string[];
  const prices = formData.getAll("variant_price") as string[];
  const stocks = formData.getAll("variant_stock") as string[];

  const variants = skus
    .map((sku, i) => ({
      sku: sku?.trim(),
      name: names[i]?.trim(),
      price: parseFloat(prices[i]),
      stock: parseInt(stocks[i], 10) || 0,
    }))
    .filter((v) => v.sku && v.name && !isNaN(v.price));

  const specLabels = formData.getAll("spec_label") as string[];
  const specValues = formData.getAll("spec_value") as string[];
  const specs = specLabels
    .map((label, i) => ({ label: label?.trim(), value: specValues[i]?.trim() }))
    .filter((s) => s.label && s.value);

  if (!name || !categoryId || isNaN(basePrice)) {
    throw new Error("Nama, kategori, dan harga dasar wajib diisi dengan benar.");
  }
  if (variants.length === 0) {
    throw new Error("Minimal harus ada 1 varian produk (SKU, nama, harga, stok).");
  }

  return {
    name,
    slug: slugify(name),
    categoryId,
    description,
    basePrice,
    compareAtPrice,
    weightGrams,
    lengthCm,
    widthCm,
    heightCm,
    status,
    isPreorder,
    preorderPaymentType,
    preorderDpPercentage,
    preorderEstimatedDate,
    images,
    variants,
    specs,
  };
}

export async function createProductAction(formData: FormData) {
  await requireSuperAdmin();
  const parsed = parseProductForm(formData);

  const existing = await db.product.findUnique({ where: { slug: parsed.slug } });
  if (existing) {
    throw new Error("Sudah ada produk dengan nama/slug yang sama.");
  }

  const product = await db.product.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      categoryId: parsed.categoryId,
      description: parsed.description,
      basePrice: parsed.basePrice,
      compareAtPrice: parsed.compareAtPrice,
      weightGrams: parsed.weightGrams,
      lengthCm: parsed.lengthCm,
      widthCm: parsed.widthCm,
      heightCm: parsed.heightCm,
      status: parsed.status,
      isPreorder: parsed.isPreorder,
      preorderPaymentType: parsed.preorderPaymentType,
      preorderDpPercentage: parsed.preorderDpPercentage,
      preorderEstimatedDate: parsed.preorderEstimatedDate,
      images: {
        create: parsed.images.map((url, i) => ({ url, sortOrder: i })),
      },
      variants: {
        create: parsed.variants,
      },
      specs: {
        create: parsed.specs.map((s, i) => ({ ...s, sortOrder: i })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { id: product.id };
}

export async function updateProductAction(productId: string, formData: FormData) {
  await requireSuperAdmin();
  const parsed = parseProductForm(formData);

  const existing = await db.product.findUnique({ where: { slug: parsed.slug } });
  if (existing && existing.id !== productId) {
    throw new Error("Sudah ada produk lain dengan nama/slug yang sama.");
  }

  await db.$transaction([
    db.productImage.deleteMany({ where: { productId } }),
    db.productSpec.deleteMany({ where: { productId } }),
    db.product.update({
      where: { id: productId },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        categoryId: parsed.categoryId,
        description: parsed.description,
        basePrice: parsed.basePrice,
        compareAtPrice: parsed.compareAtPrice,
        weightGrams: parsed.weightGrams,
        lengthCm: parsed.lengthCm,
        widthCm: parsed.widthCm,
        heightCm: parsed.heightCm,
        status: parsed.status,
        isPreorder: parsed.isPreorder,
        preorderPaymentType: parsed.preorderPaymentType,
        preorderDpPercentage: parsed.preorderDpPercentage,
        preorderEstimatedDate: parsed.preorderEstimatedDate,
        images: {
          create: parsed.images.map((url, i) => ({ url, sortOrder: i })),
        },
        specs: {
          create: parsed.specs.map((s, i) => ({ ...s, sortOrder: i })),
        },
      },
    }),
  ]);

  // Upsert varian: update yang sudah ada (by SKU), buat baru kalau belum ada.
  // Varian lama yang SKU-nya tidak lagi dikirim dari form akan dihapus jika tidak direferensikan order.
  const existingVariants = await db.productVariant.findMany({ where: { productId } });
  const incomingSkus = new Set(parsed.variants.map((v) => v.sku));

  for (const variant of parsed.variants) {
    await db.productVariant.upsert({
      where: { sku: variant.sku },
      update: { name: variant.name, price: variant.price, stock: variant.stock, productId },
      create: { productId, sku: variant.sku, name: variant.name, price: variant.price, stock: variant.stock },
    });
  }

  for (const variant of existingVariants) {
    if (!incomingSkus.has(variant.sku)) {
      const orderItemCount = await db.orderItem.count({ where: { productVariantId: variant.id } });
      if (orderItemCount === 0) {
        await db.productVariant.delete({ where: { id: variant.id } });
      }
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.slug}`);
  revalidatePath("/");
}

export async function deleteProductAction(productId: string) {
  await requireSuperAdmin();

  const orderItemCount = await db.orderItem.count({
    where: { productVariant: { productId } },
  });
  if (orderItemCount > 0) {
    return { requiresForceConfirm: true as const, orderCount: orderItemCount };
  }

  try {
    await db.product.delete({ where: { id: productId } });
  } catch (error) {
    // P2025 = record sudah tidak ada (mis. klik hapus dobel yang lolos race
    // client) — anggap berhasil, jangan lempar error generik ke user.
    const alreadyDeleted =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
    if (!alreadyDeleted) throw error;
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}

// Dipakai kalau admin secara eksplisit konfirmasi mau hapus produk BESERTA
// riwayat penjualannya (order item terkait) — hanya dipanggil setelah user
// menyetujui peringatan kedua di ProductDeleteButton, bukan default behavior.
export async function forceDeleteProductAction(productId: string) {
  await requireSuperAdmin();

  await db.$transaction([
    db.orderItem.deleteMany({ where: { productVariant: { productId } } }),
    db.product.delete({ where: { id: productId } }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath("/admin/orders");
  revalidatePath("/");
}
