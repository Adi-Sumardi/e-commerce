"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteVoucherAction } from "./actions";

export function DeleteVoucherButton({ voucherId }: { voucherId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
      disabled={isPending}
      onClick={() => {
        if (confirm("Hapus voucher ini? Tindakan tidak dapat dibatalkan.")) {
          startTransition(() => deleteVoucherAction(voucherId));
        }
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
