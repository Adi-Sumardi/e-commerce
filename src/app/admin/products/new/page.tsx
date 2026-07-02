import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export default async function NewProductPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

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
          <h1 className="text-2xl font-bold tracking-tight">Tambah Produk Baru</h1>
        </div>

        <ProductForm
          categories={categories}
          action={createProductAction}
          submitLabel="Simpan Produk"
        />
      </div>
    </>
  );
}
