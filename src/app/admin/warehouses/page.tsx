import { redirect } from "next/navigation";
import { Warehouse as WarehouseIcon, UserPlus, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { WarehouseFormDialog } from "./warehouse-form-dialog";
import {
  createWarehouseAction,
  updateWarehouseAction,
  deleteWarehouseAction,
  createWarehouseStaffAction,
  removeWarehouseStaffAction,
} from "./actions";

export default async function AdminWarehousesPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const [warehouses, staffAssignments] = await Promise.all([
    db.warehouse.findMany({
      include: { _count: { select: { staff: true, orders: true } } },
      orderBy: { name: "asc" },
    }),
    db.warehouseStaff.findMany({
      include: { user: true, warehouse: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-8 p-6">
        {/* Data Gudang */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Data Gudang</h1>
              <p className="text-sm text-muted-foreground">
                {warehouses.length} lokasi gudang terdaftar — titik asal pengiriman & perhitungan ongkir
              </p>
            </div>
            <WarehouseFormDialog mode="create" action={createWarehouseAction} />
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Nama Gudang</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead className="text-center">Staff</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-20 text-center text-muted-foreground">
                      <WarehouseIcon className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                      <p className="font-medium">Belum ada data gudang</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  warehouses.map((wh) => (
                    <TableRow key={wh.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-sm font-semibold">{wh.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{wh.code}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {wh.city}, {wh.province}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {wh._count.staff}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {wh._count.orders}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={wh.isActive ? "default" : "secondary"} className="text-xs">
                          {wh.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <WarehouseFormDialog
                            mode="edit"
                            action={updateWarehouseAction.bind(null, wh.id)}
                            initialValues={{
                              name: wh.name,
                              code: wh.code,
                              phone: wh.phone,
                              province: wh.province,
                              city: wh.city,
                              district: wh.district,
                              postalCode: wh.postalCode,
                              fullAddress: wh.fullAddress,
                              biteshipAreaId: wh.biteshipAreaId,
                              isActive: wh.isActive,
                            }}
                          />
                          <ConfirmDeleteButton
                            confirmMessage={`Hapus gudang "${wh.name}"?`}
                            successMessage="Gudang berhasil dihapus."
                            action={deleteWarehouseAction.bind(null, wh.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Staff Gudang — generate akun hanya dari sini */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Akun Staff Gudang</h2>
            <p className="text-sm text-muted-foreground">
              Akun dengan role Staff Gudang hanya bisa dibuat di sini oleh Super Admin — tidak tersedia di halaman
              registrasi publik.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <UserPlus className="size-4 text-primary" />
              Generate Akun Staff Gudang Baru
            </h3>
            <form
              action={createWarehouseStaffAction}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="flex flex-col gap-1">
                <Label htmlFor="staff-name">Nama Staff</Label>
                <Input id="staff-name" name="name" placeholder="Nama Lengkap" required />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="staff-email">Email</Label>
                <Input id="staff-email" name="email" type="email" placeholder="staff@pratamajaya.com" required />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="staff-password">Password Awal</Label>
                <Input id="staff-password" name="password" type="password" minLength={8} placeholder="Min. 8 karakter" required />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="staff-warehouseId">Ditugaskan ke Gudang</Label>
                <select
                  id="staff-warehouseId"
                  name="warehouseId"
                  required
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Pilih gudang
                  </option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <Button type="submit" className="gap-2 cursor-pointer">
                  <UserPlus className="size-4" />
                  Buat Akun Staff Gudang
                </Button>
              </div>
            </form>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                      <Users className="mx-auto mb-3 size-10 text-muted-foreground/30" />
                      <p className="font-medium">Belum ada staff gudang</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  staffAssignments.map((assignment) => (
                    <TableRow key={assignment.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-sm font-semibold">{assignment.user.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{assignment.user.email}</TableCell>
                      <TableCell className="text-sm">{assignment.warehouse.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={assignment.user.isActive ? "default" : "secondary"} className="text-xs">
                          {assignment.user.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ConfirmDeleteButton
                          confirmMessage={`Lepas penugasan "${assignment.user.name}" dari gudang "${assignment.warehouse.name}"?`}
                          successMessage="Penugasan staff berhasil dihapus."
                          action={removeWarehouseStaffAction.bind(null, assignment.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
