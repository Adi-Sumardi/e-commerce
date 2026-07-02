"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  confirmMessage: string;
  action: () => Promise<void>;
  successMessage?: string;
}

export function ConfirmDeleteButton({
  confirmMessage,
  action,
  successMessage = "Berhasil dihapus.",
}: ConfirmDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        if (!confirm(confirmMessage)) return;
        startTransition(async () => {
          try {
            await action();
            toast.success(successMessage);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus.");
          }
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
