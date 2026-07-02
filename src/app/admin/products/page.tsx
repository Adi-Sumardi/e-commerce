import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatIDRLocal(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string };
}) {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const search = searchParams.search ?? "";
  const categoryFilter = searchParams.category ?? "";

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  const products = await db.product.findMany({
    where: {
      ...(search
        ? {
            name: { contains: search },
          }
        : {}),
      ...(categoryFilter ? { categoryId: categoryFilter } : {}),
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

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

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <form method="get" className="flex flex-1 items-center gap-2 min-w-52">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Cari nama produk..."
                className="pl-9"
              />
            </div>
            <select
              name="category"
              defaultValue={categoryFilter}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline" className="gap-2 cursor-pointer">
              <Filter className="size-4" />
              Filter
            </Button>
          </form>
        </div>

        {/* Product Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga Dasar</TableHead>
                <TableHead className="text-center">Varian</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center text-muted-foreground">
                    <Package className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="font-medium">Belum ada produk</p>
                    <p className="text-sm">Mulai tambahkan produk baru ke katalog Anda</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, idx) => {
                  const image = product.images[0]?.url ?? "https://placehold.co/56x56/e2e8f0/64748b/png?text=P";
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{product.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.category?.name ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-primary">
                        {formatIDRLocal(Number(product.basePrice))}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="text-xs">{product.variants.length} varian</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={product.status === "PUBLISHED" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {product.status === "PUBLISHED" ? "Aktif" : product.status === "DRAFT" ? "Draft" : "Arsip"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8 cursor-pointer")}
                          >
                            <Eye className="size-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8 cursor-pointer")}
                          >
                            <Edit className="size-4 text-blue-500" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
