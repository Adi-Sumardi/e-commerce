import Link from "next/link";
import { redirect } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Shield,
  Home,
  PackagePlus,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { SiteHeader, BottomNavBar } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING_PAYMENT: "Pending",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
};

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AccountPage() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const user = session.user as any;

  // Fetch full user profile + addresses + recent orders
  const profile = await db.user.findUnique({
    where: { id: user.id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      orders: {
        include: {
          items: { take: 1 },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!profile) {
    redirect("/login");
  }

  const initials = (profile.name ?? "U")[0].toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Profile Card */}
          <div className="flex flex-col gap-6">
            {/* Profile */}
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                {initials}
              </div>
              <h1 className="text-xl font-bold">{profile.name ?? "Customer"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
              <Badge className="mt-2 text-xs">
                {profile.role === "CUSTOMER" ? "Customer" : profile.role}
              </Badge>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/40 pt-4 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">{profile.orders.length}</p>
                  <p className="text-xs text-muted-foreground">Order</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">{profile.addresses.length}</p>
                  <p className="text-xs text-muted-foreground">Alamat</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">
                    {profile.orders.filter((o) => o.status === "DELIVERED").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Selesai</p>
                </div>
              </div>
            </div>

            {/* Quick Menu */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {[
                { href: "/orders", icon: ShoppingBag, label: "Pesanan Saya" },
                { href: "/account/addresses", icon: MapPin, label: "Kelola Alamat" },
                { href: "/account/profile", icon: User, label: "Edit Profil" },
                { href: "/account/security", icon: Shield, label: "Keamanan Akun" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-5 py-3.5 text-sm hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="flex-1 font-medium">{label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="size-4" />
                  <span className="flex-1 text-left font-medium">Keluar</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: Main Content */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Addresses */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  Alamat Tersimpan
                </h2>
                <Link
                  href="/account/addresses"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs cursor-pointer")}
                >
                  <PackagePlus className="mr-1.5 size-3.5" />
                  Tambah
                </Link>
              </div>

              {profile.addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-10 text-center">
                  <MapPin className="mb-2 size-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Belum ada alamat tersimpan</p>
                  <Link href="/account/addresses">
                    <Button size="sm" className="mt-3 cursor-pointer">Tambah Alamat</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-start gap-3 rounded-xl border border-border p-4"
                    >
                      <Home className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{addr.label}</p>
                          {addr.isDefault && (
                            <Badge className="text-[10px] h-4 px-1.5">Utama</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{addr.recipientName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {addr.fullAddress}, {addr.district}, {addr.city}, {addr.province} {addr.postalCode}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Phone className="size-3" />
                          {addr.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <ShoppingBag className="size-4 text-primary" />
                  Pesanan Terbaru
                </h2>
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="h-7 text-xs cursor-pointer gap-1">
                    Lihat Semua
                    <ChevronRight className="size-3.5" />
                  </Button>
                </Link>
              </div>

              {profile.orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-10 text-center">
                  <ShoppingBag className="mb-2 size-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Belum ada pesanan</p>
                  <Link href="/products">
                    <Button size="sm" className="mt-3 cursor-pointer">Mulai Belanja</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.orders.map((order) => {
                    const firstItem = order.items[0];
                    const statusLabel = STATUS_LABEL[order.status] ?? order.status;
                    return (
                      <Link
                        key={order.id}
                        href={`/track/${order.id}`}
                        className="flex items-center gap-4 rounded-xl border border-border p-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-sm font-bold text-primary truncate">
                              {order.orderNumber}
                            </p>
                            <Badge
                              variant={
                                order.status === "DELIVERED"
                                  ? "default"
                                  : order.status === "CANCELLED"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs shrink-0"
                            >
                              {statusLabel}
                            </Badge>
                          </div>
                          {firstItem && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {firstItem.productNameSnapshot}
                              {order.items.length > 1 ? ` +${order.items.length - 1} item lain` : ""}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-destructive mt-1">
                            {formatIDR(Number(order.total))}
                          </p>
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <BottomNavBar />
    </div>
  );
}
