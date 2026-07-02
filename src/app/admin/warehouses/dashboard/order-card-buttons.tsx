"use client";

import { useState } from "react";
import { ClipboardCheck, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processOrderAction, shipOrderAction } from "./actions";
import { toast } from "sonner";

interface OrderCardButtonsProps {
  orderId: string;
  status: string; // PAID, PROCESSING, etc.
  actionLabel: string;
}

export function OrderCardButtons({ orderId, status, actionLabel }: OrderCardButtonsProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (status === "PAID") {
        const res = await processOrderAction(orderId);
        if (res.success) {
          toast.success("Order berhasil diproses!");
        }
      } else if (status === "PROCESSING") {
        const res = await shipOrderAction(orderId);
        if (res.success) {
          toast.success("Order berhasil dikirim (Shipment dibuat)!");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui status order.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "PAID") {
    return (
      <Button
        onClick={handleAction}
        disabled={loading}
        className="w-full gap-2 py-6 font-bold active:scale-95 cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <ClipboardCheck className="size-5" />
        )}
        {actionLabel}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAction}
      disabled={loading}
      variant="outline"
      className="w-full gap-2 border-2 py-6 font-bold cursor-pointer hover:bg-accent"
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <Printer className="size-5 text-secondary" />
      )}
      {actionLabel}
    </Button>
  );
}
