import { redirect } from "next/navigation";
import { Package, AlertTriangle, TrendingDown, Boxes } from "lucide-react";
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

const LOW_STOCK_THRESHOLD = 5;

export default async function WarehouseStockPage() {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  const user = session.user as any;

  let staffRelation = await db.warehouseStaff.findFirst({
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

  const stocks = await db.warehouseStock.findMany({
    where: { warehouseId: warehouse.id },
    include: {
      productVariant: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { stock: "asc" }, // low stock first
  });

  const totalItems = stocks.reduce((sum, s) => sum + s.stock, 0);
  const lowStockCount = stocks.filter((s) => s.stock <= LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = stocks.filter((s) => s.stock === 0).length;

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stok Gudang</h1>
          <p className="text-sm text-muted-foreground">
            {warehouse.name} — {warehouse.code}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Item</p>
            <p className="mt-1 text-2xl font-bold text-primary">{totalItems.toLocaleString("id-ID")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stocks.length} SKU</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/20 dark:border-amber-900/40">
            <p className="text-xs text-amber-700 dark:text-amber-400">Stok Menipis</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{lowStockCount}</p>
            <p className="mt-0.5 text-xs text-amber-600/70">≤ {LOW_STOCK_THRESHOLD} unit</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:bg-red-950/20 dark:border-red-900/40">
            <p className="text-xs text-red-700 dark:text-red-400">Habis</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{outOfStockCount}</p>
            <p className="mt-0.5 text-xs text-red-600/70">0 unit tersisa</p>
          </div>
        </div>

        {/* Stock Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Produk / Varian</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center text-muted-foreground">
                    <Boxes className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="font-medium">Belum ada data stok</p>
                  </TableCell>
                </TableRow>
              ) : (
                stocks.map((stock) => {
                  const variant = stock.productVariant;
                  const product = variant.product;
                  const isLow = stock.stock > 0 && stock.stock <= LOW_STOCK_THRESHOLD;
                  const isOut = stock.stock === 0;

                  return (
                    <TableRow key={stock.id} className={`hover:bg-muted/20 transition-colors ${isOut ? "bg-red-50/40 dark:bg-red-950/10" : isLow ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}`}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{variant.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">{variant.sku}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-sm ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-foreground"}`}>
                          {stock.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {isOut ? (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertTriangle className="size-3" />
                            Habis
                          </Badge>
                        ) : isLow ? (
                          <Badge className="text-xs gap-1 bg-amber-500 hover:bg-amber-500">
                            <TrendingDown className="size-3" />
                            Menipis
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Normal</Badge>
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
