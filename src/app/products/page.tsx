import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  ChevronRight,
  Gamepad2,
  Grid2x2,
  Laptop,
  LayoutGrid,
  List,
  ChefHat,
  ShoppingBasket,
  ShoppingCart,
  Shirt,
  Sparkles,
  Star,
  SlidersHorizontal,
  Tag,
  Search,
} from "lucide-react";
import { SiteHeader, BottomNavBar } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CatalogService } from "@/server/services/catalog-service";
import { formatIDR } from "../_data";
import { SidebarFilters } from "./sidebar-filters";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { label: "Terlaris", value: "best-seller" },
  { label: "Terbaru", value: "newest" },
  { label: "Harga: Terendah", value: "price-asc" },
  { label: "Harga: Tertinggi", value: "price-desc" },
  { label: "Rating Tertinggi", value: "rating" },
];

export const metadata: Metadata = {
  title: "Semua Produk",
  description:
    "Jelajahi katalog produk Pratama Jaya: elektronik, fashion, rumah tangga, kecantikan, hobi & gaming, hingga sembako dengan harga terbaik.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    priceRange?: string;
    rating?: string;
  }>;
}) {
  const { category, sort, search, priceRange, rating } = await searchParams;
  const categories = await CatalogService.getHomeCategories();
  const session = await auth();
  const wishlistedIds = session?.user?.id
    ? new Set(
        (
          await db.wishlist.findMany({
            where: { userId: session.user.id },
            select: { productId: true },
          })
        ).map((w) => w.productId)
      )
    : new Set<string>();

  // Parse price range
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (priceRange) {
    const parts = priceRange.split("-");
    if (parts[0]) minPrice = Number(parts[0]);
    if (parts[1]) maxPrice = Number(parts[1]);
  }

  // Parse rating
  const ratingNum = rating ? Number(rating) : undefined;

  const products = await CatalogService.getBestSellers({
    categorySlug: category,
    search,
    minPrice,
    maxPrice,
    rating: ratingNum,
    sort,
  });

  const categoryNavItems = [{ label: "Semua Produk", slug: "" }, ...categories.map((c) => ({ label: c.name, slug: c.slug }))];
  const activeCategory = categories.find((c) => c.slug === category);
  
  let pageTitle = activeCategory?.name ?? "Semua Produk";
  if (search) {
    pageTitle = `Hasil Pencarian: "${search}"`;
  }
  
  const productCount = products.length;

  const getSortUrl = (sortValue: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (priceRange) params.set("priceRange", priceRange);
    if (rating) params.set("rating", rating);
    params.set("sort", sortValue);
    return `/products?${params.toString()}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-7xl px-4 py-3 lg:px-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href="/products" className="hover:text-primary transition-colors">
            Produk
          </Link>
          {activeCategory && (
            <>
              <ChevronRight className="size-3.5" />
              <span className="font-medium text-foreground">{activeCategory.name}</span>
            </>
          )}
          {search && (
            <>
              <ChevronRight className="size-3.5" />
              <span className="font-medium text-foreground">Pencarian</span>
            </>
          )}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 lg:px-8">
        <div className="flex gap-8">
          {/* ─── Sidebar ─── */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Kategori */}
              <div>
                <h2 className="mb-4 text-base font-bold text-foreground">Kategori</h2>
                <ul className="space-y-1">
                  {categoryNavItems.map((item) => {
                    const isActive = (item.slug === "" && !category) || item.slug === category;
                    return (
                      <li key={item.slug}>
                        <Link
                          href={item.slug ? `/products?category=${item.slug}` : "/products"}
                          className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all ${
                            isActive
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <span>{item.label}</span>
                          {isActive && (
                            <span className="size-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <hr className="border-border" />

              {/* Sidebar Client Filter Component */}
              <SidebarFilters />
            </div>
          </aside>

          {/* ─── Main Content ─── */}
          <div className="flex-1 min-w-0">
            {/* Page header */}
            <div className="mb-6 mt-2">
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">{pageTitle}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {productCount > 0
                  ? `${productCount} produk ditemukan`
                  : "Belum ada produk di kategori ini"}
              </p>
            </div>

            {/* Search */}
            <form action="/products" method="GET" className="relative mb-6">
              {category && <input type="hidden" name="category" value={category} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              {priceRange && <input type="hidden" name="priceRange" value={priceRange} />}
              {rating && <input type="hidden" name="rating" value={rating} />}
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="search"
                defaultValue={search ?? ""}
                placeholder="Cari nama atau deskripsi produk..."
                className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
              />
            </form>

            {/* Sort + View Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
                {SORT_OPTIONS.map((opt) => {
                  const isActive = (opt.value === "best-seller" && !sort) || sort === opt.value;
                  return (
                    <Link
                      key={opt.value}
                      href={getSortUrl(opt.value)}
                      className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground font-semibold"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-24 text-center">
                <ShoppingBasket className="mb-4 size-14 text-muted-foreground/30" />
                <p className="text-lg font-semibold text-muted-foreground">Belum ada produk</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Coba hapus filter atau cari dengan kata kunci lain.
                </p>
                <Link href="/products">
                  <Button variant="outline" className="mt-6">
                    Lihat Semua Produk
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <article
                    key={product.slug}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        {product.discount && (
                          <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground text-[10px] font-bold uppercase">
                            -{product.discount}
                          </Badge>
                        )}
                        {product.isPreorder && (
                          <Badge className="absolute right-3 top-3 bg-violet-600 text-white text-[10px] font-bold uppercase">
                            PRE-ORDER
                          </Badge>
                        )}
                        <WishlistButton
                          productId={product.id}
                          initialWishlisted={wishlistedIds.has(product.id)}
                          className={cn(
                            "absolute right-3 bottom-3 rounded-full bg-card/80 p-2 shadow backdrop-blur transition-all hover:bg-destructive/10",
                            wishlistedIds.has(product.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                          {product.storeName}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                          {product.name}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="size-3.5 fill-secondary text-secondary" />
                          <span>
                            {product.rating} · {product.reviewCount}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="block text-base font-bold text-destructive">
                            {formatIDR(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] text-muted-foreground line-through">
                              {formatIDR(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <Link href={`/products/${product.slug}`}>
                        <Button className="w-full gap-2 cursor-pointer text-sm active:scale-95">
                          <ShoppingCart className="size-4" />
                          Lihat Detail
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
      <BottomNavBar />
    </div>
  );
}
