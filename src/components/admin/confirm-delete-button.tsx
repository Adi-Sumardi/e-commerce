"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  confirmMessage: string;
  action: () => Promise<void>;
  successMessage?: string;
  /** Kalau diisi, redirect ke path ini setelah berhasil hapus (dipakai saat menghapus item yang sedang dibuka, mis. halaman edit produk). */
  redirectTo?: string;
}

export function ConfirmDeleteButton({
  confirmMessage,
  action,
  successMessage = "Berhasil dihapus.",
  redirectTo,
}: ConfirmDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        // isPending baru true setelah React commit — klik ganda yang sangat cepat
        // bisa lolos sebelum itu, jadi tambah guard sinkron di sini juga.
        if (submittedRef.current) return;
        if (!confirm(confirmMessage)) return;
        submittedRef.current = true;
        startTransition(async () => {
          try {
            await action();
            toast.success(successMessage, {
              icon: <CheckCircle2 className="size-5" />,
              description: "Perubahan sudah tersimpan.",
              duration: 3500,
            });
            // revalidatePath() di server action cuma invalidate cache sisi
            // server — refresh eksplisit di sini supaya halaman tujuan (baik
            // redirect maupun halaman saat ini) benar-benar ambil data baru,
            // bukan versi lama dari Router Cache sisi client.
            if (redirectTo) {
              router.push(redirectTo);
            }
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus.");
          } finally {
            submittedRef.current = false;
          }
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
