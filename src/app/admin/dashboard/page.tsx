import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Eye,
  MoreVertical,
  PackageSearch,
  ShoppingCart,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";

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

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // 1. Fetch real sales total
  const salesQuery = await db.order.aggregate({
    _sum: {
      total: true,
    },
    where: {
      status: {
        in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      },
    },
  });
  const totalSales = Number(salesQuery._sum.total || 0);

  // 2. Fetch new orders count (paid or pending payment)
  const newOrdersCount = await db.order.count({
    where: {
      status: {
        in: [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID],
      },
    },
  });

  // 3. Fetch customers count
  const newCustomersCount = await db.user.count({
    where: {
      role: "CUSTOMER",
    },
  });

  // 4. Fetch low stock products (stock <= 5)
  const lowStockCount = await db.productVariant.count({
    where: {
      stock: {
        lte: 5,
      },
    },
  });

  // 4b. Produk dengan stok paling menipis (untuk daftar aksi nyata, bukan angka statis)
  const lowStockVariants = await db.productVariant.findMany({
    where: { stock: { lte: 5 } },
    include: { product: { select: { name: true } } },
    orderBy: { stock: "asc" },
    take: 3,
  });

  // 4c. Order yang sudah dibayar tapi belum diproses/dikirim gudang
  const awaitingProcessCount = await db.order.count({
    where: { status: { in: [OrderStatus.PAID, OrderStatus.WAITING_STOCK] } },
  });

  // 5. Fetch recent orders
  const orders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      address: true,
    },
  });

  // Format IDR Helper
  const formatIDR = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  // Static chart data for aesthetic rendering
  const salesChart = [40, 60, 35, 75, 55, 90, 65, 45, 80, 70];
  const courierPerformance = [
    { name: "JNE Express", percent: 45, colorVar: "primary" as const },
    { name: "GoSend", percent: 32, colorVar: "secondary" as const },
  ];

  return (
    <>
      <AdminTopbar />
      <div className="mx-auto w-full max-w-(--breakpoint-2xl) flex-1 space-y-8 p-4 lg:p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <CreditCard className="size-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-success">
                +12%
                <TrendingUp className="ml-1 size-4" />
              </span>
            </div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Total Penjualan
            </p>
            <h3 className="mt-1 text-2xl font-semibold">
              {formatIDR(totalSales)}
            </h3>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                <ShoppingCart className="size-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-secondary">
                Hari ini
              </span>
            </div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Order Baru
            </p>
            <h3 className="mt-1 text-2xl font-semibold">
              {newOrdersCount.toLocaleString("id-ID")}
            </h3>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-preorder/10 p-2 text-preorder">
                <UserPlus className="size-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-preorder">
                +8%
                <TrendingUp className="ml-1 size-4" />
              </span>
            </div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Customer Baru
            </p>
            <h3 className="mt-1 text-2xl font-semibold">{newCustomersCount}</h3>
          </div>

          <div className="rounded-xl border border-border border-l-4 border-l-destructive bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                <PackageSearch className="size-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-destructive">
                Perlu Tindakan
              </span>
            </div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Stok Rendah
            </p>
            <h3 className="mt-1 text-2xl font-semibold">{lowStockCount} Produk</h3>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sales chart placeholder */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Tren Penjualan 30 Hari</h2>
                <p className="text-sm text-muted-foreground">Performa transaksi bulanan</p>
              </div>
              <select className="rounded-lg border border-border bg-muted px-4 py-2 text-sm focus:ring-primary">
                <option>Juli 2026</option>
                <option>Juni 2026</option>
              </select>
            </div>
            <div className="flex h-64 items-end gap-2 border-b border-l border-border/30 px-2">
              {salesChart.map((value, index) => (
                <div
                  key={index}
                  style={{ height: `${value}%` }}
                  className="flex-1 rounded-t-sm bg-primary/20 transition-all hover:bg-primary/40"
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between px-2 text-xs text-muted-foreground">
              <span>01 Jul</span>
              <span>10 Jul</span>
              <span>20 Jul</span>
              <span>30 Jul</span>
            </div>
          </div>

          {/* Sidebar stats */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Perlu Tindakan Gudang</h3>
                <PackageSearch className="size-5 text-destructive" />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-xl font-bold text-destructive">{lowStockCount}</p>
                  <p className="text-xs text-muted-foreground">Produk stok menipis</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <p className="text-xl font-bold text-primary">{awaitingProcessCount}</p>
                  <p className="text-xs text-muted-foreground">Order belum diproses</p>
                </div>
              </div>
              {lowStockVariants.length > 0 && (
                <ul className="mb-4 space-y-1.5 text-sm">
                  {lowStockVariants.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1 text-muted-foreground">
                        {v.product.name} ({v.name})
                      </span>
                      <span className="shrink-0 font-semibold text-destructive">{v.stock} tersisa</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/admin/warehouses/stock"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] cursor-pointer"
              >
                Lihat Stok Gudang
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Kurir Populer</h3>
              <div className="space-y-4">
                {courierPerformance.map((courier) => (
                  <div key={courier.name}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex size-8 items-center justify-center rounded bg-muted font-bold ${
                            courier.colorVar === "primary" ? "text-primary" : "text-secondary"
                          }`}
                        >
                          {courier.name[0]}
                        </div>
                        <span className="text-sm font-semibold">{courier.name}</span>
                      </div>
                      <span className="text-sm font-bold">{courier.percent}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        style={{ width: `${courier.percent}%` }}
                        className={`h-full ${
                          courier.colorVar === "primary" ? "bg-primary" : "bg-secondary"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent orders table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-border/30 p-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold">Order Terbaru</h2>
              <p className="text-sm text-muted-foreground">Update real-time transaksi pelanggan</p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>ID Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada order transaksi.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const statusLabel = ORDER_STATUS_MAP[order.status] ?? "Pending";
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-semibold text-primary">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{order.user.name}</span>
                          <span className="text-xs text-muted-foreground">{order.address.city}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={statusLabel} />
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatIDR(Number(order.total))}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Link href={`/track/${order.id}`} title="Lacak Pesanan" className="inline-flex size-8 items-center justify-center rounded-lg p-0 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Eye className="size-4" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
