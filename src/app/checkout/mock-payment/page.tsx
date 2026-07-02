"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Landmark, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { simulateMockPaymentAction } from "../actions";
import { toast } from "sonner";

export default function MockPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order_number?: string; amount?: string; payment_id?: string }>;
}) {
  const params = use(searchParams);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const orderNumber = params.order_number || "INV-MOCK";
  const amount = Number(params.amount || 0);
  const paymentId = params.payment_id || "";

  async function handlePayment() {
    if (!paymentId) {
      toast.error("Payment ID tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const res = await simulateMockPaymentAction(paymentId);
      if (res.success) {
        toast.success("Pembayaran berhasil disimulasikan!");
        router.push(`/track/${res.orderId}`);
      } else {
        toast.error("Gagal memproses simulasi pembayaran.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Simulasi Pembayaran Xendit</h1>
          <p className="text-sm text-muted-foreground mt-1">Pratama Jaya Sandbox Mode</p>
        </div>

        <div className="rounded-xl bg-muted/50 p-4 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nomor Invoice</span>
            <span className="font-mono font-bold text-foreground">{orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Jumlah Tagihan</span>
            <span className="font-bold text-destructive">
              Rp {amount.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-2 border-t border-border">
            <span className="text-muted-foreground">Payment Database ID</span>
            <span className="font-mono text-muted-foreground truncate max-w-[200px]" title={paymentId}>
              {paymentId}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Landmark className="size-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold">Virtual Account (VA)</p>
              <p className="text-xs text-muted-foreground">Simulasi transfer bank VA otomatis</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <CreditCard className="size-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold">E-Wallet / QRIS</p>
              <p className="text-xs text-muted-foreground">Simulasi scan QRIS / saldo digital</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-6 text-base font-bold bg-secondary hover:bg-secondary/95 text-secondary-foreground shadow-md active:scale-95 transition-all cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Memproses Pembayaran...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check className="size-5" />
              Bayar Sekarang (Simulasi)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
