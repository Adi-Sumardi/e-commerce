"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { confirmManualPaymentAction } from "./actions";

export function ConfirmPaymentButton({ orderId, hasProof }: { orderId: string; hasProof: boolean }) {
  const [isPending, startTransition] = useTransition();

  function runConfirm() {
    startTransition(async () => {
      try {
        await confirmManualPaymentAction(orderId);
        toast.success("Pembayaran berhasil dikonfirmasi. Order siap diproses gudang.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal mengonfirmasi pembayaran.");
      }
    });
  }

  function handleConfirm() {
    toast(
      hasProof ? "Konfirmasi pembayaran ini sebagai LUNAS?" : "Bukti transfer belum dikirim customer.",
      {
        description: hasProof
          ? "Pastikan sudah cek mutasi rekening sebelum konfirmasi."
          : "Tetap konfirmasi pembayaran sebagai LUNAS?",
        duration: 8000,
        action: {
          label: "Ya, Konfirmasi",
          onClick: runConfirm,
        },
        cancel: {
          label: "Batal",
          onClick: () => {},
        },
      }
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleConfirm}
      disabled={isPending}
      className="h-7 gap-1 bg-success text-xs text-success-foreground hover:bg-success/90 cursor-pointer"
    >
      {isPending ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
      Konfirmasi Bayar
    </Button>
  );
}
