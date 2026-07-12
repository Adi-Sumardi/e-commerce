import { redirect } from "next/navigation";
import { Ticket, Plus, Percent, BadgeDollarSign, Clock, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { createVoucherAction, deleteVoucherAction } from "./actions";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AdminVouchersPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const vouchers = await db.voucher.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { endDate: "desc" },
  });

  const now = new Date();

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Voucher</h1>
            <p className="text-sm text-muted-foreground">
              {vouchers.length} voucher terdaftar — kelola diskon dan promosi
            </p>
          </div>
        </div>

        {/* Add Voucher Form */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            Tambah Voucher Baru
          </h2>
          <form action={createVoucherAction} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
              <Label htmlFor="vc-code">Kode Voucher</Label>
              <Input id="vc-code" name="code" placeholder="HEMAT50" className="uppercase" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="vc-type">Tipe</Label>
              <select
                id="vc-type"
                name="type"
                required
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Nominal (Rp)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="vc-value">Nilai</Label>
              <Input id="vc-value" name="value" type="number" placeholder="10" required min={1} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="vc-min">Min. Belanja (Rp)</Label>
              <Input id="vc-min" name="minPurchase" type="number" placeholder="0" defaultValue={0} min={0} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="vc-quota">Kuota</Label>
              <Input id="vc-quota" name="quota" type="number" placeholder="100" required min={1} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="vc-start">Tgl Mulai</Label>
              <Input id="vc-start" name="startDate" type="date" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="vc-end">Tgl Selesai</Label>
              <Input id="vc-end" name="endDate" type="date" required />
            </div>
            <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex justify-end">
              <Button type="submit" className="gap-2 cursor-pointer">
                <Plus className="size-4" />
                Buat Voucher
              </Button>
            </div>
          </form>
        </div>

        {/* Vouchers Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Kode</TableHead>
                <TableHead>Tipe & Nilai</TableHead>
                <TableHead className="text-right">Min. Belanja</TableHead>
                <TableHead className="text-center">Kuota</TableHead>
                <TableHead className="text-center">Terpakai</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-20 text-center text-muted-foreground">
                    <Ticket className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="font-medium">Belum ada voucher</p>
                  </TableCell>
                </TableRow>
              ) : (
                vouchers.map((voucher) => {
                  const isActive =
                    voucher.startDate <= now && voucher.endDate >= now && voucher._count.orders < voucher.quota;
                  const isExpired = voucher.endDate < now;
                  const isExhausted = voucher._count.orders >= voucher.quota;

                  let statusLabel = "Aktif";
                  let statusVariant: "default" | "secondary" | "destructive" = "default";
                  if (isExpired) { statusLabel = "Kedaluwarsa"; statusVariant = "secondary"; }
                  if (isExhausted) { statusLabel = "Habis"; statusVariant = "destructive"; }
                  if (!isActive && !isExpired && !isExhausted) { statusLabel = "Belum Mulai"; statusVariant = "secondary"; }

                  return (
                    <TableRow key={voucher.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <span className="font-mono text-sm font-bold text-primary tracking-wider">
                          {voucher.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm font-semibold">
                          {voucher.type === "PERCENTAGE" ? (
                            <Percent className="size-3.5 text-blue-500" />
                          ) : (
                            <BadgeDollarSign className="size-3.5 text-green-500" />
                          )}
                          {voucher.type === "PERCENTAGE"
                            ? `${Number(voucher.value)}%`
                            : formatIDR(Number(voucher.value))}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {Number(voucher.minPurchase) > 0 ? formatIDR(Number(voucher.minPurchase)) : "—"}
                      </TableCell>
                      <TableCell className="text-center text-sm">{voucher.quota}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {voucher._count.orders}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3" />
                            {new Date(voucher.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {new Date(voucher.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusVariant} className="text-xs">
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ConfirmDeleteButton
                          confirmMessage={`Hapus voucher "${voucher.code}"? Tindakan tidak dapat dibatalkan.`}
                          successMessage="Voucher berhasil dihapus."
                          action={deleteVoucherAction.bind(null, voucher.id)}
                        />
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
