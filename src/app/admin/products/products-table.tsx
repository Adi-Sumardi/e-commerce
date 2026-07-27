"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Search, Eye, Edit } from "lucide-react";
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
import { ProductDeleteButton } from "./product-delete-button";

function formatIDRLocal(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  status: string;
  categoryId: string;
  categoryName: string;
  variantCount: number;
  image: string;
}

export function ProductsTable({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !query || p.name.toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center text-muted-foreground">
                  <Package className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                  <p className="font-medium">
                    {products.length === 0 ? "Belum ada produk" : "Tidak ada produk yang cocok"}
                  </p>
                  <p className="text-sm">
                    {products.length === 0
                      ? "Mulai tambahkan produk baru ke katalog Anda"
                      : "Coba kata kunci atau kategori lain"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product, idx) => (
                <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          sizes="44px"
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {product.categoryName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold text-primary">
                    {formatIDRLocal(product.basePrice)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="text-xs">{product.variantCount} varian</Badge>
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
                      <ProductDeleteButton productId={product.id} productName={product.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
