import Image from "next/image";
import Link from "next/link";
import {
  Award,
  ChefHat,
  CreditCard,
  Gamepad2,
  Laptop,
  Shirt,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Truck,
  ArrowRight,
  Zap,
  ShieldCheck,
  Package,
} from "lucide-react";
import { SiteHeader, BottomNavBar } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { formatIDR } from "./_data";
import { CatalogService } from "@/server/services/catalog-service";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  laptop: Laptop,
  shirt: Shirt,
  chair: ChefHat,
  sparkles: Sparkles,
  gamepad: Gamepad2,
  "shopping-basket": ShoppingBasket,
} as const;

const COURIERS = ["JNE", "J&T", "GoSend", "SiCepat", "GrabExpress"];
const PAYMENT_METHODS = ["BCA", "BNI", "Mandiri", "GOPAY", "OVO", "DANA"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const session = await auth();
  const homeCategories = await CatalogService.getHomeCategories();
  const bestSellerProducts = await CatalogService.getBestSellers(category);
  const banners = await CatalogService.getActiveBanners();
  const [mainBanner, ...sideBanners] = banners;

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 pb-16 md:pb-8">
        {/* Hero Section - Premium Multi-Banner (dinamis dari /admin/banners) */}
        {mainBanner && (
        <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Main Banner */}
            <div className="group relative col-span-1 overflow-hidden rounded-2xl lg:col-span-2" style={{ aspectRatio: "2.2/1" }}>
              {mainBanner.videoUrl ? (
                <video
                  src={mainBanner.videoUrl}
                  poster={mainBanner.imageUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <Image
                  src={mainBanner.imageUrl}
                  alt={mainBanner.title}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-r from-foreground/90 via-foreground/50 to-transparent" />
              <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 text-white md:px-12">
                {mainBanner.badgeText && (
                  <Badge className="mb-3 w-fit bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider shadow-md">
                    <Zap className="size-3 mr-1" />
                    {mainBanner.badgeText}
                  </Badge>
                )}
                <h1 className="mb-2 max-w-sm text-2xl leading-tight font-extrabold md:text-4xl tracking-tight">
                  {mainBanner.title}
                </h1>
                {mainBanner.subtitle && (
                  <p className="mb-6 max-w-sm text-xs opacity-85 md:text-sm leading-relaxed">
                    {mainBanner.subtitle}
                  </p>
                )}
                {mainBanner.ctaLabel && (
                  <Link href={mainBanner.ctaLink ?? "/products"}>
                    <Button
                      size="lg"
                      className="w-fit bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/90 active:scale-95 gap-2 cursor-pointer font-bold"
                    >
                      {mainBanner.ctaLabel}
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Side Banners */}
            {sideBanners.length > 0 && (
              <div className="hidden gap-4 lg:grid lg:grid-rows-2">
                {sideBanners.slice(0, 2).map((banner) => (
                  <div key={banner.id} className="group relative overflow-hidden rounded-2xl">
                    {banner.videoUrl ? (
                      <video
                        src={banner.videoUrl}
                        poster={banner.imageUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        unoptimized
                        sizes="33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-foreground/80 to-transparent" />
                    <Link
                      href={banner.ctaLink ?? "/products"}
                      className="absolute inset-0 z-10 flex flex-col justify-end p-5 text-white"
                    >
                      {banner.badgeText && (
                        <Badge className="mb-2 w-fit bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase">
                          {banner.badgeText}
                        </Badge>
                      )}
                      <p className="text-sm font-bold leading-snug">{banner.title}</p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        )}

        {/* Trust Badges */}
        <section className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Truck, title: "Gratis Ongkir", desc: "Semua pesanan ke seluruh Indonesia" },
              { icon: ShieldCheck, title: "Garansi Resmi", desc: "100% produk original bergaransi" },
              { icon: Package, title: "Pre-Order DP 30%", desc: "Booking produk eksklusif segera" },
              { icon: CreditCard, title: "Bayar Mudah", desc: "VA, E-Wallet, QRIS, COD tersedia" },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <badge.icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{badge.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Kategori Pilihan</h2>
              <p className="text-sm text-muted-foreground">
                Telusuri berbagai kebutuhan harian Anda
              </p>
            </div>
            <Link href="/products" className="text-sm font-bold text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {homeCategories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon];
              const isActive = category === cat.slug;
              return (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="group">
                  <div
                    className={`flex aspect-square flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all hover:shadow-md ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-muted hover:bg-accent"
                    }`}
                  >
                    <div
                      className={`mb-4 flex size-16 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-110 ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-card"
                      }`}
                    >
                      <Icon className={`size-8 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                    </div>
                    <span className={`text-sm font-semibold ${isActive ? "text-primary" : ""}`}>
                      {cat.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Best Sellers / Filtered Products */}
        <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Award className="size-8 text-secondary" />
            <h2 className="text-2xl font-semibold text-foreground">
              {category ? `Produk ${homeCategories.find(c => c.slug === category)?.name ?? ""}` : "Produk Terlaris"}
            </h2>
            {category && (
              <Link href="/" className="ml-auto text-xs font-bold text-primary hover:underline">
                Reset Filter
              </Link>
            )}
          </div>

          {bestSellerProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBasket className="size-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">Belum ada produk di kategori ini</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Coba kategori lainnya atau lihat semua produk</p>
              <Link href="/products">
                <Button variant="outline" className="mt-4 cursor-pointer">Lihat Semua Produk</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {bestSellerProducts.map((product) => (
                <article
                  key={product.slug}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg"
                >
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      {product.discount && (
                        <Badge className="absolute left-3 top-3 bg-destructive text-[10px] font-bold text-white">
                          -{product.discount}
                        </Badge>
                      )}
                      {product.isPreorder && (
                        <Badge className="absolute right-3 top-3 bg-preorder text-preorder-foreground text-[10px] font-bold">
                          PRE-ORDER
                        </Badge>
                      )}
                      <WishlistButton
                        productId={product.id}
                        initialWishlisted={wishlistedIds.has(product.id)}
                        className={cn(
                          "absolute right-3 bottom-3 rounded-full bg-card/70 p-1.5 shadow-md backdrop-blur transition-opacity",
                          wishlistedIds.has(product.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold text-primary">
                        {product.storeName}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <StarRating rating={product.rating} size="sm" />
                        <span>
                          {product.rating > 0 && `${product.rating} · `}
                          {product.reviewCount}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col">
                        <span className="text-lg font-bold text-destructive">
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
                      <Button className="w-full gap-2 active:scale-95 cursor-pointer">
                        <ShoppingCart className="size-4" />
                        Lihat Detail
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Partners */}
        <section className="mt-8 bg-muted py-8">
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Truck className="size-5 text-primary" />
                  Kurir Terpercaya
                </h4>
                <div className="flex flex-wrap gap-4 opacity-70 grayscale transition-all hover:grayscale-0">
                  {COURIERS.map((courier) => (
                    <div
                      key={courier}
                      className="flex h-8 w-16 items-center justify-center rounded bg-muted text-[10px] font-bold"
                    >
                      {courier}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <CreditCard className="size-5 text-primary" />
                  Metode Pembayaran
                </h4>
                <div className="flex flex-wrap gap-4 opacity-70 grayscale transition-all hover:grayscale-0">
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method}
                      className="flex h-8 w-12 items-center justify-center rounded bg-muted text-[10px] font-bold"
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <BottomNavBar />
    </div>
  );
}
