import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import {
  BatteryCharging,
  Bluetooth,
  CalendarClock,
  Gift,
  ShieldCheck,
  Ticket,
  Wallet,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { ReviewForm } from "@/components/storefront/review-form";
import { StarRating } from "@/components/shared/star-rating";
import { notFound } from "next/navigation";
import { CatalogService } from "@/server/services/catalog-service";
import { auth } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { formatIDR } from "../../_data";

const SPEC_ICONS = {
  battery: BatteryCharging,
  bluetooth: Bluetooth,
} as const;

// Dipakai oleh generateMetadata DAN page — cache() memastikan query DB cuma sekali.
const getProductDetail = cache((slug: string) => CatalogService.getProductDetail(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) {
    return { title: "Produk tidak ditemukan" };
  }

  const description = product.description.replace(/\s+/g, " ").slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      images: product.images.slice(0, 1).map((img) => ({ url: img.url, alt: img.alt })),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, session] = await Promise.all([
    getProductDetail(slug),
    auth(),
  ]);

  if (!product) {
    notFound();
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    sku: product.colors[0]?.sku,
    brand: { "@type": "Brand", name: product.storeName },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "IDR",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Electronics</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Audio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <section>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary">Official Store</Badge>
                <span className="text-sm text-muted-foreground">{product.storeName}</span>
                {product.isPreorder && (
                  <Badge className="bg-preorder text-preorder-foreground">Pre-Order</Badge>
                )}
              </div>
              <h2 className="mb-2 text-3xl font-bold">{product.name}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={product.rating} size="md" />
                  {product.reviews.length > 0 && (
                    <span className="text-base font-bold">{product.rating}</span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-sm text-muted-foreground">{product.soldLabel}</span>
              </div>
            </section>

            <section className="rounded-xl bg-muted p-4">
              <div className="mb-1 text-2xl font-bold text-foreground">
                {formatIDR(product.price)}
              </div>
              {product.discountLabel && product.originalPrice && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-destructive/10 font-bold text-destructive">
                    {product.discountLabel}
                  </Badge>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatIDR(product.originalPrice)}
                  </span>
                </div>
              )}
            </section>

            {product.isPreorder && (
              <section className="flex flex-col gap-3 rounded-xl border border-preorder/30 bg-preorder/5 p-4">
                <div className="flex items-center gap-2 text-preorder">
                  <CalendarClock className="size-5" />
                  <p className="text-sm font-bold">
                    Pre-Order — estimasi kirim{" "}
                    {product.preorderEstimatedDate
                      ? new Date(product.preorderEstimatedDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "akan diinfokan"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="size-4 shrink-0 text-preorder" />
                  {product.preorderPaymentType === "DOWN_PAYMENT" ? (
                    <span>
                      Bisa bayar DP <strong className="text-foreground">{product.preorderDpPercentage}%</strong> dulu,
                      pelunasan saat barang siap dikirim.
                    </span>
                  ) : (
                    <span>Pembayaran dilakukan penuh di muka.</span>
                  )}
                </div>
              </section>
            )}

            <ProductPurchasePanel product={product} />
          </div>
        </div>

        {/* Detail Tabs & Reviews */}
        <section className="mt-16">
          <Tabs defaultValue="description">
            <TabsList variant="line" className="mb-6 w-full justify-start gap-8 border-b border-border">
              <TabsTrigger value="description" className="pb-4 font-bold">
                Deskripsi
              </TabsTrigger>
              <TabsTrigger value="specs" className="pb-4 font-medium">
                Spesifikasi
              </TabsTrigger>
              <TabsTrigger value="reviews" className="pb-4 font-medium">
                Review ({product.reviewCount})
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TabsContent value="description" className="space-y-6">
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                  <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
                    {product.specs.map((spec) => {
                      const Icon = SPEC_ICONS[spec.icon];
                      return (
                        <li
                          key={spec.title}
                          className="flex items-start gap-3 rounded-xl bg-muted p-4"
                        >
                          <Icon className="size-5 text-primary" />
                          <div>
                            <p className="font-bold text-foreground">{spec.title}</p>
                            <p className="text-sm text-muted-foreground">{spec.detail}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </TabsContent>

                <TabsContent value="specs">
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {product.specs.map((spec) => {
                      const Icon = SPEC_ICONS[spec.icon];
                      return (
                        <li
                          key={spec.title}
                          className="flex items-start gap-3 rounded-xl bg-muted p-4"
                        >
                          <Icon className="size-5 text-primary" />
                          <div>
                            <p className="font-bold text-foreground">{spec.title}</p>
                            <p className="text-sm text-muted-foreground">{spec.detail}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  {product.reviews.length > 0 && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
                      <span className="text-3xl font-bold">{product.rating}</span>
                      <div>
                        <StarRating rating={product.rating} size="sm" />
                        <p className="text-xs text-muted-foreground">{product.reviewCount}</p>
                      </div>
                    </div>
                  )}

                  <ReviewForm productId={product.id} isAuthenticated={Boolean(session?.user)} />

                  {product.reviews.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Belum ada ulasan untuk produk ini. Jadilah yang pertama memberi ulasan!
                    </p>
                  ) : (
                    <div className="space-y-8">
                      {product.reviews.map((review, index) => (
                        <div
                          key={`${review.name}-${index}`}
                          className="flex flex-col gap-4 border-b border-border/30 pb-6 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                {review.initial}
                              </div>
                              <div>
                                <p className="font-bold text-foreground">{review.name}</p>
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{review.timeAgo}</span>
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                <div className="rounded-2xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-full">
                      <Image
                        src="https://placehold.co/96x96/2563eb/ffffff/png?text=PJ"
                        alt="Logo toko Pratama Jaya"
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{product.storeName}</h4>
                      <div className="flex items-center gap-1 text-xs text-secondary">
                        <ShieldCheck className="size-3.5" />
                        <span>Premium Seller</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border/30 bg-background p-2 text-center">
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="text-sm font-bold">4.9/5.0</p>
                    </div>
                    <div className="rounded-lg border border-border/30 bg-background p-2 text-center">
                      <p className="text-xs text-muted-foreground">Pesanan</p>
                      <p className="text-sm font-bold">1.2jt+</p>
                    </div>
                  </div>
                  <Button className="mb-2 w-full">Follow Toko</Button>
                  <Button variant="outline" className="w-full">
                    Kunjungi Toko
                  </Button>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h4 className="mb-4 font-bold">Promo Menarik</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/10 p-3 text-secondary">
                      <Ticket className="size-5" />
                      <span className="text-xs font-bold">Cashback Rp 50.000</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-preorder/10 p-3 text-preorder">
                      <Gift className="size-5" />
                      <span className="text-xs font-bold">Bonus Travel Case</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </Tabs>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
