"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUploadInput } from "@/components/shared/file-upload-input";
import { submitPaymentProofAction } from "../actions";

export function ProofForm({ orderId }: { orderId: string }) {
  const [proofUrl, setProofUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proofUrl) {
      toast.error("Upload dulu screenshot bukti transfernya.");
      return;
    }
    startTransition(async () => {
      const res = await submitPaymentProofAction(orderId, proofUrl);
      if (res.success) {
        toast.success("Bukti transfer terkirim! Admin akan segera mengonfirmasi pembayaranmu.");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengirim bukti transfer.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Bukti Transfer</Label>
        <FileUploadInput value={proofUrl} onChange={setProofUrl} label="Upload Screenshot Bukti Transfer" />
        <p className="text-xs text-muted-foreground">Format JPG/PNG/WebP, maksimal 5MB.</p>
      </div>
      <Button type="submit" disabled={isPending || !proofUrl} className="gap-2 cursor-pointer">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Kirim Bukti Transfer
      </Button>
    </form>
  );
}
