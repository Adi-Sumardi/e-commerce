"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProductAction, forceDeleteProductAction } from "./actions";

export function ProductDeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);
  const router = useRouter();

  function runDelete(force: boolean) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(async () => {
      try {
        const result = force
          ? await forceDeleteProductAction(productId)
          : await deleteProductAction(productId);

        if (result && "requiresForceConfirm" in result && result.requiresForceConfirm) {
          submittedRef.current = false;
          toast(
            `Produk "${productName}" sudah pernah terjual (${result.orderCount} item order). Hapus produk BESERTA riwayat penjualannya? Data order yang sudah dihapus tidak bisa dikembalikan.`,
            {
              icon: <AlertTriangle className="size-5 text-destructive" />,
              duration: 10000,
              action: { label: "Ya, Hapus Semua", onClick: () => runDelete(true) },
              cancel: { label: "Batal", onClick: () => {} },
            }
          );
          return;
        }

        toast.success(`Produk "${productName}" berhasil dihapus.`, {
          icon: <CheckCircle2 className="size-5" />,
          description: force ? "Riwayat penjualan produk ini juga sudah dihapus." : "Perubahan sudah tersimpan.",
          duration: 3500,
        });
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menghapus produk.");
      } finally {
        submittedRef.current = false;
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        toast(`Hapus produk "${productName}"? Tindakan tidak dapat dibatalkan.`, {
          icon: <AlertTriangle className="size-5 text-destructive" />,
          duration: 8000,
          action: { label: "Hapus", onClick: () => runDelete(false) },
          cancel: { label: "Batal", onClick: () => {} },
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
