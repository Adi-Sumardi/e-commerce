import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Copy,
  CreditCard,
  Fullscreen,
  Home,
  MapPin,
  Package,
  Printer,
  ShieldCheck,
  Star,
  Truck,
  CircleHelp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderRepository } from "@/server/repositories/order-repository";
import { formatIDR } from "../../_data";
import { OrderStatus } from "@prisma/client";

const STEP_ICONS = {
  check: ShieldCheck,
  payment: CreditCard,
  package: Package,
  shipping: Truck,
  home: Home,
} as const;

function mapOrderStatusToIndonesian(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return "Menunggu Pembayaran";
    case OrderStatus.PAID:
      return "Sudah Dibayar";
    case OrderStatus.WAITING_STOCK:
      return "Menunggu Stok";
    case OrderStatus.PROCESSING:
      return "Sedang Diproses";
    case OrderStatus.SHIPPED:
      return "Dalam Pengiriman";
    case OrderStatus.DELIVERED:
      return "Sudah Diterima";
    case OrderStatus.CANCELLED:
      return "Dibatalkan";
    case OrderStatus.EXPIRED:
      return "Kedaluwarsa";
    case OrderStatus.REFUNDED:
      return "Dikembalikan (Refund)";
    default:
      return status;
  }
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await OrderRepository.findById(id);

  if (!order) {
    notFound();
  }

  // Construct steps progress
  const statusHistorySet = new Set(order.statusHistory.map((h) => h.status));
  const isPaid = statusHistorySet.has(OrderStatus.PAID) || order.status !== OrderStatus.PENDING_PAYMENT;
  const isProcessing = isPaid && (statusHistorySet.has(OrderStatus.PROCESSING) || order.status === OrderStatus.PROCESSING || order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED);
  const isShipped = isProcessing && (statusHistorySet.has(OrderStatus.SHIPPED) || order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED);
  const isDelivered = order.status === OrderStatus.DELIVERED;

  const steps = [
    {
      label: "Dibuat",
      date: order.createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      icon: "check" as const,
      done: true,
    },
    {
      label: "Dibayar",
      date: isPaid
        ? order.payments.find((p) => p.status === "PAID")?.paidAt?.toLocaleDateString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) || "Selesai"
        : "Menunggu",
      icon: "payment" as const,
      done: isPaid,
    },
    {
      label: "Diproses",
      date: isProcessing ? "Selesai" : "Menunggu",
      icon: "package" as const,
      done: isProcessing,
    },
    {
      label: "Dikirim",
      date: isShipped ? "Selesai" : "Menunggu",
      icon: "shipping" as const,
      done: isShipped,
    },
    {
      label: "Diterima",
      date: isDelivered ? "Selesai" : "Menunggu",
      icon: "home" as const,
      done: isDelivered,
    },
  ];

  let progressPercent = 10;
  if (isDelivered) progressPercent = 100;
  else if (isShipped) progressPercent = 75;
  else if (isProcessing) progressPercent = 50;
  else if (isPaid) progressPercent = 30;

  // Build History Log
  const historyLog: { title: string; description: string; time: string }[] = [];

  // 1. Order Status History
  order.statusHistory.forEach((h) => {
    historyLog.push({
      title: mapOrderStatusToIndonesian(h.status),
      description: h.note || "Perubahan status pesanan.",
      time: h.createdAt.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    });
  });

  // 2. Biteship shipment tracking log
  if (order.shipment?.tracking) {
    order.shipment.tracking.forEach((t) => {
      historyLog.push({
        title: `Pengiriman: ${t.status}`,
        description: t.description || "",
        time: t.eventTime.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      });
    });
  }

  // Sort history log descending by time (approximate via index or we can sort them if we keep dates, but let's assume they are already in logical order, or just sort them)
  // To keep it simple, we sort by order.statusHistory dates
  historyLog.reverse(); // Newest first

  const activePayment = order.payments[0];

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground md:pb-0">
      <header className="fixed inset-x-0 top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            Pratama Jaya
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link className="text-sm text-muted-foreground hover:text-primary font-semibold" href="/">
              Shop
            </Link>
            <a className="border-b-2 border-primary pb-1 text-sm font-bold text-primary" href="#">
              My Orders
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <nav className="mb-1 flex items-center gap-1 text-muted-foreground">
              <span className="text-xs">My Orders</span>
              <ChevronRight className="size-4" />
              <span className="text-xs">#{order.orderNumber}</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight">Pelacakan Pesanan</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pesanan di <span className="font-semibold text-foreground">Pratama Jaya</span> •{" "}
              {order.orderType === "PRE_ORDER" ? "Skema Pre-Order" : "Pengiriman Reguler"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 font-bold text-primary cursor-pointer">
              <CircleHelp className="size-5" />
              Bantuan
            </Button>
            {activePayment && activePayment.status === "PENDING" && activePayment.paymentUrl && (
              <Link href={activePayment.paymentUrl}>
                <Button className="gap-2 font-bold bg-secondary hover:bg-secondary/95 text-secondary-foreground cursor-pointer">
                  Bayar Sekarang
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-8">
            {/* Progress Timeline */}
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase font-bold">
                    Status Saat Ini
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="size-3 animate-pulse rounded-full bg-primary" />
                    <span className="text-xl font-bold text-primary">
                      {mapOrderStatusToIndonesian(order.status)}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-2">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Kurir Pengiriman</p>
                  <p className="flex items-center gap-1 text-sm font-bold text-foreground mt-0.5">
                    {order.courierCode?.toUpperCase()} ({order.courierService})
                    {order.shipment?.waybillNumber && (
                      <>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-primary">{order.shipment.waybillNumber}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Visual progress bar */}
              <div className="relative py-8">
                <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-[repeating-linear-gradient(90deg,var(--border)_0,var(--border)_4px,transparent_4px,transparent_8px)]" />
                <div
                  className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
                <div className="relative z-10 flex justify-between">
                  {steps.map((step) => {
                    const Icon = STEP_ICONS[step.icon];
                    return (
                      <div key={step.label} className="flex flex-col items-center">
                        <div
                          className={`flex size-10 items-center justify-center rounded-full border-4 border-card shadow-md transition-all duration-300 ${
                            step.done
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground shadow-none"
                          }`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <p
                          className={`mt-2 text-xs font-bold ${
                            step.done ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{step.date}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status log */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 p-4">
                <h2 className="text-lg font-bold text-foreground">Riwayat Pelacakan</h2>
                <Badge className="bg-primary/10 text-xs font-bold text-primary uppercase">
                  Real-time
                </Badge>
              </div>
              <div className="space-y-6 p-8">
                {historyLog.length > 0 ? (
                  historyLog.map((entry, index) => (
                    <div key={index} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div
                          className={`mt-1.5 size-3 rounded-full ${
                            index === 0 ? "bg-primary" : "bg-muted-foreground/50"
                          }`}
                        />
                        {index < historyLog.length - 1 && (
                          <div className="my-1 h-full w-px bg-border" />
                        )}
                      </div>
                      <div className={index < historyLog.length - 1 ? "pb-6" : ""}>
                        <p className="font-bold text-foreground text-sm">{entry.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 font-semibold">{entry.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">Belum ada riwayat pelacakan.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-4">
            <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card shadow-sm md:aspect-video lg:aspect-square">
              <Image
                src="https://placehold.co/600x600/e2e8f0/64748b/png?text=Peta+Rute+Pengiriman"
                alt="Peta rute pengiriman"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/50 to-transparent p-4">
                <div className="text-white">
                  <p className="font-bold text-sm">Lokasi Kurir</p>
                  <p className="text-xs opacity-90">Kurir sedang mengambil paket dari Gudang Jakarta</p>
                </div>
              </div>
              <button
                aria-label="Perbesar peta"
                className="absolute top-4 right-4 rounded-lg bg-card/90 p-2 shadow-md backdrop-blur-sm transition-colors hover:bg-card cursor-pointer"
              >
                <Fullscreen className="size-5 text-primary" />
              </button>
            </div>

            {/* Seller info */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-4">
                <div className="relative size-12 overflow-hidden rounded-lg border border-border">
                  <Image
                    src="https://placehold.co/96x96/2563eb/ffffff/png?text=PJ"
                    alt="Logo toko Pratama Jaya"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold">Pratama Jaya Store</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Star className="size-3.5 fill-secondary text-secondary" />
                    4.9 (Premium Official Store)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 text-xs font-bold cursor-pointer">
                  Chat Penjual
                </Button>
                <Button variant="outline" className="flex-1 text-xs font-bold cursor-pointer">
                  Kunjungi Toko
                </Button>
              </div>
            </div>

            {/* Delivery address */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-start gap-4">
                <MapPin className="size-5 rounded-lg bg-primary/10 p-2 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-sm">Alamat Pengiriman</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    <span className="mb-1 block font-bold text-foreground">
                      {order.address.recipientName}
                    </span>
                    {order.address.fullAddress}<br />
                    {order.address.district}, {order.address.city}<br />
                    {order.address.province}, {order.address.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items Snapshot */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-sm border-b border-border pb-2">Rincian Belanja</h3>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground line-clamp-1">{item.productNameSnapshot}</p>
                    <p className="text-muted-foreground mt-0.5">{item.quantity} barang x {formatIDR(Number(item.priceSnapshot))}</p>
                  </div>
                  <span className="font-bold text-foreground align-bottom self-end">
                    {formatIDR(Number(item.priceSnapshot) * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal Belanja</span>
                  <span>{formatIDR(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span>{formatIDR(Number(order.shippingCost))}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border/50">
                  <span>Total Transaksi</span>
                  <span className="text-primary">{formatIDR(Number(order.total))}</span>
                </div>
              </div>
            </div>

            {/* Security assurance */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex gap-2">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Perlindungan Pembelian</p>
                  <p className="mt-1 text-[10px] text-muted-foreground leading-normal">
                    Dana Anda aman bersama Pratama Jaya. Kami hanya melepaskan pembayaran kepada kurir/penjual setelah barang Anda sampai dengan selamat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-border bg-accent">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 lg:px-8">
          <div className="col-span-2 md:col-span-1">
            <span className="mb-4 block text-lg font-bold">Pratama Jaya</span>
            <p className="pr-8 text-xs text-muted-foreground leading-normal">
              Pilihan belanja online terlengkap, berkualitas, dan terpercaya di Indonesia. Terintegrasi langsung dengan Xendit &amp; Biteship.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-sm">Shop</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link className="hover:text-primary" href="/">
                  Home
                </Link>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Kategori
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-sm">Bantuan</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a className="hover:text-primary" href="#">
                  CS Hub
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Cara Lacak
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-sm">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a className="hover:text-primary" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 py-4 text-center">
          <p className="text-[10px] text-muted-foreground opacity-70">
            © 2026 Pratama Jaya Indonesia. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border bg-card px-4 md:hidden">
        <Link href="/" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Home className="size-5" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <MapPin className="size-5" />
          <span className="text-[10px] font-bold">Explore</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary">
          <Package className="size-5" />
          <span className="text-[10px] font-bold">Orders</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <ShieldCheck className="size-5" />
          <span className="text-[10px] font-bold">Account</span>
        </button>
      </nav>
    </div>
  );
}
