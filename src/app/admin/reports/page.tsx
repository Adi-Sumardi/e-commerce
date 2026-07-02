import { redirect } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <span
              className={`mt-1 flex items-center gap-1 text-xs font-semibold ${
                trend.value >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {trend.value >= 0 ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {trend.label}
            </span>
          )}
        </div>
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="size-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Aggregate metrics
  const [salesResult, orderCount, customerCount, productCount] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
      },
    }),
    db.order.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.count({ where: { status: "PUBLISHED" } }),
  ]);

  const totalSales = Number(salesResult._sum.total || 0);

  // Order counts per status
  const ordersByStatus = await db.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const statusMap: Record<string, number> = {};
  for (const row of ordersByStatus) {
    statusMap[row.status] = row._count._all;
  }

  // Top products by order items
  const topProducts = await db.orderItem.groupBy({
    by: ["productNameSnapshot"],
    _sum: { quantity: true },
    _count: { _all: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  // Recent 7-day daily sales (approximate from createdAt)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentOrders = await db.order.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
    },
    select: { createdAt: true, total: true },
  });

  // Group by date
  const dailySales: Record<string, number> = {};
  for (const order of recentOrders) {
    const dateKey = order.createdAt.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    dailySales[dateKey] = (dailySales[dateKey] || 0) + Number(order.total);
  }

  const dailySalesEntries = Object.entries(dailySales);

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan & Analitik</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan performa penjualan, order, dan pertumbuhan Pratama Jaya
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Pendapatan"
            value={formatIDR(totalSales)}
            subtitle="Dari order terkonfirmasi"
            icon={DollarSign}
            color="bg-primary"
          />
          <StatCard
            title="Total Order"
            value={orderCount.toLocaleString("id-ID")}
            subtitle={`${statusMap.PENDING_PAYMENT || 0} menunggu pembayaran`}
            icon={ShoppingBag}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Customer"
            value={customerCount.toLocaleString("id-ID")}
            subtitle="Akun customer terdaftar"
            icon={Users}
            color="bg-violet-500"
          />
          <StatCard
            title="Produk Aktif"
            value={productCount.toLocaleString("id-ID")}
            subtitle="Produk tersedia di katalog"
            icon={Package}
            color="bg-emerald-500"
          />
        </div>

        {/* Status Distribution & Top Products */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Order Status Distribution */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              Distribusi Status Order
            </h2>
            <div className="space-y-3">
              {[
                { key: "PENDING_PAYMENT", label: "Pending Pembayaran", color: "bg-amber-400" },
                { key: "PAID", label: "Dibayar", color: "bg-blue-500" },
                { key: "PROCESSING", label: "Diproses", color: "bg-violet-500" },
                { key: "SHIPPED", label: "Dikirim", color: "bg-cyan-500" },
                { key: "DELIVERED", label: "Selesai", color: "bg-emerald-500" },
                { key: "CANCELLED", label: "Dibatalkan", color: "bg-red-400" },
              ].map(({ key, label, color }) => {
                const count = statusMap[key] || 0;
                const pct = orderCount > 0 ? Math.round((count / orderCount) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 text-xs text-muted-foreground truncate">{label}</div>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-mono text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Produk Terlaris
            </h2>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada data penjualan</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, idx) => {
                  const qty = Number(p._sum.quantity) || 0;
                  const maxQty = Number(topProducts[0]._sum.quantity) || 1;
                  const pct = Math.round((qty / maxQty) * 100);
                  return (
                    <div key={p.productNameSnapshot} className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.productNameSnapshot}</p>
                        <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                        {qty} terjual
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Daily Sales (last 7 days) */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Penjualan 7 Hari Terakhir
          </h2>
          {dailySalesEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada transaksi dalam 7 hari terakhir
            </p>
          ) : (
            <div className="space-y-2">
              {dailySalesEntries.map(([date, total]) => {
                const maxTotal = Math.max(...dailySalesEntries.map(([, t]) => t));
                const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">{date}</span>
                    <div className="flex-1 h-5 rounded-md bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-md bg-primary/70 flex items-center px-2 text-[10px] text-white font-medium transition-all"
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      >
                        {formatIDR(total)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
