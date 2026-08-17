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

const COURIERS = ["JNE", "J&T", "GoSend", "SiCepat", "GrabExpress"];
const PAYMENT_METHODS = ["BCA", "BNI", "Mandiri", "GOPAY", "OVO", "DANA"];

const DEFAULT_PROOF_CARDS = [
  {
    title: "Stok Gudang Siap Kirim",
    desc: "Persediaan produk kompor, blender, mixer & perabotan rumah tangga selalu terjaga.",
    tag: "Gudang Utama",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Packing Bubble Wrap Double",
    desc: "Setiap pesanan dibungkus tebal dan rapi untuk memastikan barang tiba tanpa cacat.",
    tag: "Standar QC",
    img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Pengiriman Kurir Setiap Hari",
    desc: "Kerjasama resmi dengan JNE, J&T, SiCepat, GoSend, dan GrabExpress.",
    tag: "Resi Cepat",
    img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=800&auto=format&fit=crop",
  },
];

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

  // Banner dengan badge PROOF: dijadikan kartu foto Bukti Pengiriman/Stok di Homepage
  const proofBanners = banners.filter((b) => b.badgeText?.startsWith("PROOF:"));
  const heroBanners = banners.filter((b) => !b.badgeText?.startsWith("PROOF:"));
  const [mainBanner, ...sideBanners] = heroBanners.length > 0 ? heroBanners : banners;

  const socialProofCards =
    proofBanners.length > 0
      ? proofBanners.map((b) => ({
          title: b.title,
          desc: b.subtitle ?? "",
          tag: b.badgeText?.replace(/^PROOF:\s*/i, "") ?? "Bukti Pengiriman",
          img: b.imageUrl,
        }))
      : DEFAULT_PROOF_CARDS;

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
        {/* Hero Section - Premium Multi-Banner */}
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
              { icon: Truck, title: "Gratis Ongkir Jabodetabek", desc: "Luar Jabodetabek Potong Ongkir Rp30.000" },
              { icon: ShieldCheck, title: "Garansi Resmi", desc: "100% produk original bergaransi" },
              { icon: Package, title: "Pre-Order DP 30%", desc: "Booking produk eksklusif segera" },
              { icon: CreditCard, title: "Bayar Mudah", desc: "VA, E-Wallet, QRIS, Transfer tersedia" },
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

        {/* Section: Kenapa Belanja di Pratama Jaya? */}
        <section className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
          <div className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-background to-secondary/10 p-8 shadow-sm">
            <div className="mb-8 text-center">
              <Badge className="mb-2 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider">
                Keunggulan Toko
              </Badge>
              <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">
                Kenapa Belanja di Pratama Jaya?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Komitmen kami memberikan pengalaman belanja perabotan rumah tangga &amp; kebutuhan dapur terbaik
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "100% Produk Original",
                  desc: "Jaminan barang asli dari produsen resmi bergaransi.",
                  icon: ShieldCheck,
                },
                {
                  title: "Subsidi & Gratis Ongkir",
                  desc: "Gratis ongkir Jabodetabek & potongan Rp30.000 untuk Luar Jabodetabek.",
                  icon: Truck,
                },
                {
                  title: "Layanan Order WhatsApp",
                  desc: "Bisa langsung konsultasi & order praktis via WhatsApp CS.",
                  icon: Zap,
                },
                {
                  title: "Packing Rapi & Safe Shipping",
                  desc: "Setiap barang dibungkus aman dilapisi bubble wrap tebal.",
                  icon: Package,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card/80 p-6 text-center shadow-xs backdrop-blur-xs transition-all hover:scale-102 hover:shadow-md"
                >
                  <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                    <item.icon className="size-7" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Best Sellers / Filtered Products */}
        <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Award className="size-8 text-secondary" />
            <h2 className="text-2xl font-semibold text-foreground">
              {category ? `Produk ${homeCategories.find((c) => c.slug === category)?.name ?? ""}` : "Produk Terlaris"}
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

        {/* Social Proof Section (Bisa dikelola Admin dari Menu Banner dengan badge PROOF: Nama Tag) */}
        <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 border-t border-border/40">
          <div className="mb-8 text-center">
            <Badge className="mb-2 bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider">
              Bukti Pengiriman &amp; Kepuasan Pelanggan
            </Badge>
            <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">
              Stok Ready, Packing Aman &amp; Testimoni Pelanggan
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ribuan paket produk perabotan rumah tangga &amp; Omicko telah dikirim secara aman ke seluruh Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
            {socialProofCards.map((card, i) => (
              <div key={i} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:shadow-md">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <Image
                    src={card.img}
                    alt={card.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className="absolute left-3 top-3 bg-foreground/80 text-background backdrop-blur-xs text-[10px] font-bold">
                    {card.tag}
                  </Badge>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-foreground">{card.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                name: "Bunda Rina (Jakarta Selatan)",
                rating: 5,
                comment: "Pesan kompor Omicko jam 10 pagi, sore barang sudah sampai via GoSend! Packing rapi aman bubble wrap tebal. Mantap Pratama Jaya!",
              },
              {
                name: "Pak Hendra (Bandung)",
                rating: 5,
                comment: "Dapat potongan ongkir Rp30.000 buat kirim ke Bandung. Barang original dan sesuai pesanan. Pelayanan via WA sangat ramah dan responsif.",
              },
              {
                name: "Ibu Maya (Surabaya)",
                rating: 5,
                comment: "Pre-order berjalan lancar, DP 30% dulu baru pelunasan saat barang dikirim. Toko sangat amanah dan profesional!",
              },
            ].map((t, idx) => (
              <div key={idx} className="flex flex-col justify-between rounded-2xl border border-border bg-muted/40 p-5 shadow-2xs">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <StarRating rating={t.rating} size="sm" />
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">Verified Purchase</Badge>
                  </div>
                  <p className="text-xs text-foreground italic leading-relaxed">&ldquo;{t.comment}&rdquo;</p>
                </div>
                <p className="mt-4 text-xs font-bold text-primary">{t.name}</p>
              </div>
            ))}
          </div>
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
