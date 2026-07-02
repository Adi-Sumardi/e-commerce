import { redirect } from "next/navigation";
import { Users, Search, Mail, Phone, ShoppingBag, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const search = searchParams.search ?? "";

  const customers = await db.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      orders: {
        select: { id: true, total: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Customer</h1>
            <p className="text-sm text-muted-foreground">
              {customers.length} customer terdaftar di platform
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
              placeholder="Cari nama atau email customer..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" className="gap-2 cursor-pointer">
            <Search className="size-4" />
            Cari
          </Button>
        </form>

        {/* Customers Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>#</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Total Order</TableHead>
                <TableHead className="text-right">Total Belanja</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center text-muted-foreground">
                    <Users className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="font-medium">Belum ada customer</p>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer, idx) => {
                  const completedOrders = customer.orders.filter(
                    (o) => o.status === "DELIVERED" || o.status === "PAID" || o.status === "PROCESSING" || o.status === "SHIPPED"
                  );
                  const totalBelanja = completedOrders.reduce(
                    (acc, o) => acc + Number(o.total),
                    0
                  );

                  return (
                    <TableRow key={customer.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {(customer.name ?? "?")[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-sm">{customer.name ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="size-3.5" />
                          {customer.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <ShoppingBag className="size-3.5 text-muted-foreground" />
                          {customer.orders.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-primary">
                        {totalBelanja > 0 ? formatIDR(totalBelanja) : "—"}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          {new Date(customer.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={customer.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {customer.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
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
