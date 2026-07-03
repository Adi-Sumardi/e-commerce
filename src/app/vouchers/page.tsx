import { Ticket, Percent, BadgeDollarSign, Calendar } from "lucide-react";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { formatIDR } from "../_data";

export const dynamic = "force-dynamic";

export default async function VouchersPage() {
  const now = new Date();
  const vouchers = await db.voucher.findMany({
    where: { startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { endDate: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Voucher</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Voucher aktif yang bisa Anda pakai saat checkout.
        </p>

        {vouchers.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center shadow-xs">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Ticket className="size-10" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Belum Ada Voucher Aktif</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Pantau terus halaman ini — voucher baru akan muncul di sini begitu tersedia.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="flex items-center gap-4 rounded-2xl border border-dashed border-primary/40 bg-card p-5 shadow-xs"
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {voucher.type === "PERCENTAGE" ? (
                    <Percent className="size-6" />
                  ) : (
                    <BadgeDollarSign className="size-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-base font-bold text-foreground">{voucher.code}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {voucher.type === "PERCENTAGE"
                      ? `Diskon ${Number(voucher.value)}%`
                      : `Diskon ${formatIDR(Number(voucher.value))}`}
                    {Number(voucher.minPurchase) > 0 &&
                      ` · Min. belanja ${formatIDR(Number(voucher.minPurchase))}`}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    Berlaku sampai {voucher.endDate.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
