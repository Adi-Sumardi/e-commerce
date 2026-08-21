"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, MapPin, Package, Truck, User, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

export interface OrderDetailData {
  id: string;
  orderNumber: string;
  createdAt: string;
  statusLabel: string;
  courierCode: string | null;
  courierService: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  customer: { name: string; email: string };
  address: {
    recipientName: string;
    phone: string;
    fullAddress: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
  items: { id: string; productNameSnapshot: string; quantity: number; priceSnapshot: number }[];
  payment: {
    method: string;
    status: string;
    channel: string | null;
    proofUrl: string | null;
    amount: number;
  } | null;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function OrderDetailDialog({ order }: { order: OrderDetailData }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs cursor-pointer">
            <Eye className="size-3" />
            Detail
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2 pr-6">
            <span>Order #{order.orderNumber}</span>
            <StatusBadge status={order.statusLabel} />
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 text-sm">
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <User className="size-3.5" />
              Customer
            </h3>
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-muted-foreground">{order.customer.email}</p>
          </section>

          {order.address && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <MapPin className="size-3.5" />
                Alamat Pengiriman
              </h3>
              <p className="font-medium">
                {order.address.recipientName} · {order.address.phone}
              </p>
              <p className="text-muted-foreground">
                {order.address.fullAddress}, {order.address.district}, {order.address.city},{" "}
                {order.address.province} {order.address.postalCode}
              </p>
              {order.courierCode && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Truck className="size-3" />
                  {order.courierCode.toUpperCase()} {order.courierService}
                </p>
              )}
            </section>
          )}

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Package className="size-3.5" />
              Item Pesanan
            </h3>
            <div className="flex flex-col gap-1.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span>
                    {item.productNameSnapshot} <span className="text-muted-foreground">x{item.quantity}</span>
                  </span>
                  <span className="font-medium">{formatIDR(item.priceSnapshot * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-border pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatIDR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Ongkos Kirim</span>
                <span>{formatIDR(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Diskon</span>
                  <span>-{formatIDR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">{formatIDR(order.total)}</span>
              </div>
            </div>
          </section>

          {order.payment && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <Wallet className="size-3.5" />
                Pembayaran
              </h3>
              <p>
                {order.payment.method === "MANUAL_TRANSFER" ? "Transfer Manual" : order.payment.method}
                {order.payment.channel ? ` — ${order.payment.channel}` : ""}
              </p>
              <p className="text-muted-foreground">Status: {order.payment.status}</p>
              {order.payment.proofUrl && (
                <a href={order.payment.proofUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                  <div className="relative size-28 overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.payment.proofUrl}
                      alt="Bukti transfer"
                      className="size-full object-cover"
                    />
                  </div>
                </a>
              )}
            </section>
          )}

          <div className="flex justify-center border-t border-border pt-4">
            <Link
              href={`/track/${order.id}`}
              target="_blank"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "min-w-[180px] font-bold cursor-pointer")}
            >
              Buka Halaman Lacak Pesanan
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
