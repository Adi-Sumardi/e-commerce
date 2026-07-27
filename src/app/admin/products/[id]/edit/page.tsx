import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ProductForm } from "../../product-form";
import { updateProductAction } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const [categories, product] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sku: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Link
            href="/admin/products"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke Manajemen Produk
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit Produk</h1>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>

        <ProductForm
          categories={categories}
          action={updateProductAction.bind(null, product.id)}
          submitLabel="Simpan Perubahan"
          initialValues={{
            name: product.name,
            categoryId: product.categoryId,
            description: product.description,
            basePrice: Number(product.basePrice),
            compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            discountStartDate: product.discountStartDate
              ? product.discountStartDate.toISOString().slice(0, 10)
              : null,
            discountEndDate: product.discountEndDate
              ? product.discountEndDate.toISOString().slice(0, 10)
              : null,
            weightGrams: Number(product.weightGrams),
            lengthCm: Number(product.lengthCm),
            widthCm: Number(product.widthCm),
            heightCm: Number(product.heightCm),
            status: product.status,
            isPreorder: product.isPreorder,
            preorderPaymentType: product.preorderPaymentType,
            preorderDpPercentage: product.preorderDpPercentage
              ? Number(product.preorderDpPercentage)
              : null,
            preorderEstimatedDate: product.preorderEstimatedDate
              ? product.preorderEstimatedDate.toISOString().slice(0, 10)
              : null,
            images: product.images.map((img) => img.url),
            variants: product.variants.map((v) => ({
              sku: v.sku,
              name: v.name,
              type: v.type,
              colorHex: v.colorHex,
              price: Number(v.price),
              stock: v.stock,
            })),
            specs: product.specs.map((s) => ({ label: s.label, value: s.value })),
          }}
        />
      </div>
    </>
  );
}
