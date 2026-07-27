import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { CatalogService } from "@/server/services/catalog-service";
import { SiteHeader, BottomNavBar } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { formatIDR } from "@/app/_data";

export default async function WishlistPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const products = await CatalogService.getWishlistProducts(session.user.id);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 lg:px-8">
        <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-foreground">
          <Heart className="size-6 fill-destructive text-destructive" />
          Wishlist Saya
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {products.length > 0 ? `${products.length} produk disimpan` : "Belum ada produk disimpan"}
        </p>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-24 text-center">
            <Heart className="mb-4 size-14 text-muted-foreground/30" />
            <p className="text-lg font-semibold text-muted-foreground">Wishlist kamu masih kosong</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Tap ikon hati di produk yang kamu suka supaya gampang ditemukan lagi.
            </p>
            <Link href="/products">
              <Button variant="outline" className="mt-6 cursor-pointer">
                Jelajahi Produk
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
                      initialWishlisted
                      className="absolute right-3 bottom-3 rounded-full bg-card/80 p-2 opacity-100 shadow backdrop-blur transition-all hover:bg-destructive/10"
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
      </main>

      <SiteFooter />
      <BottomNavBar />
    </div>
  );
}
