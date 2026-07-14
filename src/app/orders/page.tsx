import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, ShoppingBag, Truck, Calendar, CreditCard } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { SiteHeader, BottomNavBar } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatIDR } from "../_data";


const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending",
  PAID: "Dibayar",
  WAITING_STOCK: "Menunggu Stok",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Dibatalkan",
};

export default async function CustomerOrdersPage() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Fetch customer orders with items & payments
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-7xl px-4 py-4 lg:px-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">Pesanan Saya</span>
        </nav>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Pesanan Saya</h1>
            <p className="text-sm text-muted-foreground">
              Pantau status pengiriman, kelola pembayaran, dan lihat riwayat belanja Anda.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-24 text-center bg-card">
              <ShoppingBag className="mb-4 size-16 text-muted-foreground/30 animate-bounce" />
              <h2 className="text-lg font-semibold text-muted-foreground">Belum Ada Transaksi</h2>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                Mulai belanja produk favorit Anda untuk melihat riwayat pesanan di sini.
              </p>
              <Link href="/products">
                <Button className="mt-6 cursor-pointer">Belanja Sekarang</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusLabel = ORDER_STATUS_MAP[order.status] ?? "Pending";
                const latestPayment = order.payments[0];
                const needsPayment = order.status === OrderStatus.PENDING_PAYMENT && latestPayment?.status === PaymentStatus.PENDING;

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Header Order */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4 mb-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-primary">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3.5" />
                            {new Date(order.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={statusLabel} />
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                      {order.items.map((item) => {
                        const variant = item.productVariant;
                        const image = variant?.product?.images[0]?.url ?? "https://placehold.co/96x96/e2e8f0/64748b/png?text=Product";
                        return (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                              <Image
                                src={image}
                                alt={item.productNameSnapshot}
                                fill
                                unoptimized
                                sizes="64px"
                                className="object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-foreground truncate">
                                {item.productNameSnapshot}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.quantity} x {formatIDR(Number(item.priceSnapshot))}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Belanja</p>
                        <p className="text-lg font-bold text-destructive">
                          {formatIDR(Number(order.total))}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        {needsPayment && latestPayment.paymentUrl && (
                          <a
                            href={latestPayment.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button className="gap-2 font-bold cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90">
                              <CreditCard className="size-4" />
                              Bayar Sekarang
                            </Button>
                          </a>
                        )}
                        <Link href={`/track/${order.id}`}>
                          <Button variant="outline" className="gap-2 font-bold cursor-pointer hover:bg-accent">
                            <Truck className="size-4 text-primary" />
                            Lacak Pesanan
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
      <BottomNavBar />
    </div>
  );
}
