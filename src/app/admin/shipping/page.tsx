import { redirect } from "next/navigation";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { ShippingChecker } from "./shipping-checker";

export default async function ShippingCheckerPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const warehouses = await db.warehouse.findMany({
    where: { isActive: true },
    select: { id: true, name: true, city: true, biteshipAreaId: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cek Ongkir</h1>
            <p className="text-sm text-muted-foreground">
              Cek tarif kurir langsung dari Biteship antara gudang dan tujuan mana pun.
            </p>
          </div>
          <Link href="/admin/vouchers">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <Ticket className="size-4" />
              Kelola Promo / Voucher
            </Button>
          </Link>
        </div>

        {warehouses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Belum ada data gudang aktif. Tambahkan gudang terlebih dahulu di menu Data Gudang.
          </div>
        ) : (
          <ShippingChecker warehouses={warehouses} />
        )}
      </div>
    </>
  );
}
