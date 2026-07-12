"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  confirmMessage: string;
  action: () => Promise<{ error?: string } | void>;
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

  function runDelete() {
    // isPending baru true setelah React commit — klik ganda yang sangat cepat
    // bisa lolos sebelum itu, jadi tambah guard sinkron di sini juga.
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(async () => {
      try {
        const result = await action();
        // Error validasi (mis. "sudah pernah dipesan") dikembalikan sebagai
        // data, bukan throw — Next.js meredaksi pesan thrown error jadi
        // generik di production, jadi throw cuma cocok untuk error tak
        // terduga yang MEMANG harus disamarkan.
        if (result && "error" in result && result.error) {
          toast.error(result.error);
          return;
        }
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
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        toast(confirmMessage, {
          icon: <AlertTriangle className="size-5 text-destructive" />,
          duration: 8000,
          action: {
            label: "Hapus",
            onClick: runDelete,
          },
          cancel: {
            label: "Batal",
            onClick: () => {},
          },
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
