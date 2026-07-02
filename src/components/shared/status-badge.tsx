import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Maps free-form Indonesian status labels (as used in the admin mockups) to the
// semantic color tokens defined in docs/UIUX.md §2.1. Real usage will key off
// the Prisma OrderStatus enum (PENDING_PAYMENT, PAID, WAITING_STOCK,
// PROCESSING, SHIPPED, DELIVERED, CANCELLED, EXPIRED, REFUNDED).
const STATUS_STYLES: Record<string, string> = {
  Dikirim: "bg-info/10 text-info",
  Diproses: "bg-info/10 text-info",
  Selesai: "bg-success/10 text-success",
  Diterima: "bg-success/10 text-success",
  Dibayar: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  "Menunggu Stok": "bg-warning/10 text-warning",
  Dibatalkan: "bg-destructive/10 text-destructive",
  Kedaluwarsa: "bg-destructive/10 text-destructive",
  "Pre-Order": "bg-preorder/10 text-preorder",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";
  return (
    <Badge className={cn("font-bold uppercase tracking-tighter", style, className)}>
      {status}
    </Badge>
  );
}
