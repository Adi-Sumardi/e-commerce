import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Filter,
  Calendar,
  User,
  Package,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmPaymentButton } from "./confirm-payment-button";
import { OrderDetailDialog } from "./order-detail-dialog";


const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending",
  PAID: "Dibayar",
  WAITING_STOCK: "Menunggu Stok",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Refund",
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "PENDING_PAYMENT", label: "Pending" },
  { value: "PAID", label: "Dibayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DELIVERED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const search = searchParams.search ?? "";
  const statusFilter = searchParams.status ?? "";

  const orders = await db.order.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search } },
              { user: { name: { contains: search } } },
              { user: { email: { contains: search } } },
            ],
          }
        : {}),
      ...(statusFilter ? { status: statusFilter as OrderStatus } : {}),
    },
    include: {
      user: true,
      items: true,
      address: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Order</h1>
            <p className="text-sm text-muted-foreground">
              {orders.length} order ditemukan — pantau dan kelola semua transaksi
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <form method="get" className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="Cari nomor order, nama, atau email customer..."
              className="pl-9"
            />
          </div>
          <select
            name="status"
            defaultValue={statusFilter}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" className="gap-2 cursor-pointer">
            <Filter className="size-4" />
            Filter
          </Button>
        </form>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>No. Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Item</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center text-muted-foreground">
                    <ShoppingBag className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="font-medium">Belum ada order</p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const statusLabel = ORDER_STATUS_MAP[order.status] ?? "—";
                  return (
                    <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <span className="font-mono text-sm font-bold text-primary">
                          {order.orderNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{order.user?.name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Package className="size-3.5 text-muted-foreground" />
                          {order.items.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-sm text-destructive">
                        {formatIDR(Number(order.total))}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={statusLabel} />
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          {new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {order.status === "PENDING_PAYMENT" &&
                            order.payments[0]?.method === "MANUAL_TRANSFER" &&
                            order.payments[0]?.status === "PENDING" && (
                              <ConfirmPaymentButton orderId={order.id} hasProof={Boolean(order.payments[0]?.proofUrl)} />
                            )}
                          <OrderDetailDialog
                            order={{
                              id: order.id,
                              orderNumber: order.orderNumber,
                              createdAt: order.createdAt.toISOString(),
                              statusLabel,
                              courierCode: order.courierCode,
                              courierService: order.courierService,
                              subtotal: Number(order.subtotal),
                              shippingCost: Number(order.shippingCost),
                              discount: Number(order.discount),
                              total: Number(order.total),
                              customer: {
                                name: order.user?.name ?? "—",
                                email: order.user?.email ?? "—",
                              },
                              address: order.address
                                ? {
                                    recipientName: order.address.recipientName,
                                    phone: order.address.phone,
                                    fullAddress: order.address.fullAddress,
                                    district: order.address.district,
                                    city: order.address.city,
                                    province: order.address.province,
                                    postalCode: order.address.postalCode,
                                  }
                                : null,
                              items: order.items.map((item) => ({
                                id: item.id,
                                productNameSnapshot: item.productNameSnapshot,
                                quantity: item.quantity,
                                priceSnapshot: Number(item.priceSnapshot),
                              })),
                              payment: order.payments[0]
                                ? {
                                    method: order.payments[0].method,
                                    status: order.payments[0].status,
                                    channel: order.payments[0].channel,
                                    proofUrl: order.payments[0].proofUrl,
                                    amount: Number(order.payments[0].amount),
                                  }
                                : null,
                            }}
                          />
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
