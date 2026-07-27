import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductsTable } from "./products-table";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const productRows = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.basePrice),
    status: product.status,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? "—",
    variantCount: product.variants.length,
    image: product.images[0]?.url ?? "https://placehold.co/56x56/e2e8f0/64748b/png?text=P",
  }));

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Produk</h1>
            <p className="text-sm text-muted-foreground">
              Kelola katalog produk Pratama Jaya — {products.length} produk terdaftar
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className={cn(buttonVariants({ variant: "default" }), "gap-2 cursor-pointer")}
          >
            <Plus className="size-4" />
            Tambah Produk
          </Link>
        </div>

        <ProductsTable products={productRows} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </>
  );
}
