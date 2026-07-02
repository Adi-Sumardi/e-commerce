import Link from "next/link";
import { redirect } from "next/navigation";
import { Truck, AlertTriangle, Package, ExternalLink, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SHIPMENT_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Dikonfirmasi",
  ALLOCATED: "Dialokasi",
  PICKED_UP: "Dijemput Kurir",
  ON_PROCESS: "Diproses Kurir",
  DELIVERED: "Terkirim",
  CANCELLED: "Dibatalkan",
  RETURNED: "Retur",
};

export default async function WarehouseShipmentsPage() {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  const user = session.user as any;

  const staffRelation = await db.warehouseStaff.findFirst({
    where: { userId: user.id },
    include: { warehouse: true },
  });

  let warehouse = staffRelation?.warehouse;
  if (!warehouse && user.role === "SUPER_ADMIN") {
    warehouse = (await db.warehouse.findFirst()) || undefined;
  }

  if (!warehouse) {
    return (
      <>
        <AdminTopbar />
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="mb-3 size-12 text-muted-foreground/30" />
          <p className="font-semibold">Tidak ada gudang yang ditugaskan</p>
        </div>
      </>
    );
  }

  const shipments = await db.shipment.findMany({
    where: { warehouseId: warehouse.id },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
          items: { take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Pengiriman</h1>
          <p className="text-sm text-muted-foreground">
            {warehouse.name} — {shipments.length} pengiriman tercatat
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>No. Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Kurir</TableHead>
                <TableHead>Resi</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center text-muted-foreground">
                    <Truck className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="font-medium">Belum ada riwayat pengiriman</p>
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((shipment) => {
                  const statusLabel = SHIPMENT_STATUS_LABEL[shipment.status] ?? shipment.status;
                  return (
                    <TableRow key={shipment.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <span className="font-mono text-sm font-bold text-primary">
                          {shipment.order.orderNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{shipment.order.user?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{shipment.order.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium uppercase">{shipment.courierCode}</p>
                          <p className="text-xs text-muted-foreground">{shipment.courierService}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {shipment.waybillNumber ? (
                          <span className="font-mono text-xs text-muted-foreground">{shipment.waybillNumber}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            shipment.status === "DELIVERED"
                              ? "default"
                              : shipment.status === "CANCELLED" || shipment.status === "RETURNED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          {new Date(shipment.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {shipment.trackingUrl ? (
                          <a
                            href={shipment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <ExternalLink className="size-3" />
                            Lacak
                          </a>
                        ) : (
                          <Link
                            href={`/track/${shipment.orderId}`}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            Detail
                          </Link>
                        )}
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
