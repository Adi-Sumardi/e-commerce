"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  BarChart3,
  Warehouse,
  Settings,
  Boxes,
  Truck,
  Bell,
  GalleryHorizontal,
  MessageSquare,
} from "lucide-react";
import { useSession } from "next-auth/react";

const SUPER_ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/products", icon: Package },
  { label: "Kategori", href: "/admin/categories", icon: Boxes },
  { label: "Order", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customer", href: "/admin/customers", icon: Users },
  { label: "Voucher", href: "/admin/vouchers", icon: Ticket },
  { label: "Banner", href: "/admin/banners", icon: GalleryHorizontal },
  { label: "Ulasan", href: "/admin/reviews", icon: MessageSquare },
  { label: "Laporan", href: "/admin/reports", icon: BarChart3 },
  { label: "Data Gudang", href: "/admin/warehouses", icon: Warehouse },
  { label: "Dashboard Gudang", href: "/admin/warehouses/dashboard", icon: Bell },
  { label: "Pengaturan", href: "/admin/settings", icon: Settings },
];

const WAREHOUSE_STAFF_NAV = [
  { label: "Dashboard", href: "/admin/warehouses/dashboard", icon: LayoutDashboard },
  { label: "Stok Gudang", href: "/admin/warehouses/stock", icon: Boxes },
  { label: "Pengiriman", href: "/admin/warehouses/shipments", icon: Truck },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user as any;
  const name = user?.name ?? "Admin";
  const role = user?.role ?? "";
  const roleLabel =
    role === "SUPER_ADMIN" ? "Super Admin" : role === "STAFF_GUDANG" ? "Staff Gudang" : role === "CS" ? "Customer Service" : "Admin";
  const initial = name[0].toUpperCase();

  const navItems = role === "STAFF_GUDANG" ? WAREHOUSE_STAFF_NAV : SUPER_ADMIN_NAV;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-full flex-col gap-1 p-4">
        {/* Brand */}
        <div className="mb-4 px-3 py-5">
          <Image
            src="/logo/pratama-jaya.png"
            alt="Pratama Jaya"
            width={640}
            height={426}
            unoptimized
            className="h-10 w-auto"
            priority
          />
          <p className="text-xs text-sidebar-foreground/50 mt-1.5">
            {roleLabel === "Staff Gudang" ? "Warehouse Panel" : "Admin Panel"}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item, idx) => {
            // Semua sub-route /admin/warehouses/* berbagi prefix yang sama,
            // jadi butuh exact-match supaya "Data Gudang", "Dashboard Gudang",
            // "Stok Gudang", dan "Pengiriman" tidak sama-sama aktif sekaligus.
            const isActive = item.href.startsWith("/admin/warehouses")
              ? pathname === item.href
              : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={`${item.href}-${idx}`}
                href={item.href}
                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info (tombol Keluar sudah dipindah ke dropdown akun di navbar/topbar) */}
        <div className="mt-auto border-t border-sidebar-border/30 pt-4">
          <div className="flex items-center gap-3 px-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initial}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">{name}</span>
              <span className="text-xs text-sidebar-foreground/55">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
