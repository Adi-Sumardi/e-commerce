import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Landmark, MapPin, Package, QrCode, Truck } from "lucide-react";
import { auth } from "@/lib/auth";
import { OrderRepository } from "@/server/repositories/order-repository";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/app/_data";
import { ProofForm } from "./proof-form";

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pending",
  PAID: "Dibayar",
  WAITING_STOCK: "Menunggu Stok",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Refund",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await OrderRepository.findById(id);

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const payment = order.payments[0];
  const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;
  const isPendingManualTransfer =
    order.status === "PENDING_PAYMENT" && payment?.method === "MANUAL_TRANSFER" && payment.status === "PENDING";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Pesanan #{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <StatusBadge status={statusLabel} />
        </div>

        {isPendingManualTransfer && (
          <section className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-6">
            <h2 className="mb-1 text-lg font-bold text-primary">Selesaikan Pembayaran</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Transfer sejumlah <strong className="text-foreground">{formatIDR(Number(payment.amount))}</strong>{" "}
              ke rekening/QRIS berikut, sertakan nomor order{" "}
              <strong className="text-foreground">#{order.orderNumber}</strong> di berita transfer/keterangan.
            </p>

            {payment.paymentChannel && (
              <div className="mb-4 rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  {payment.paymentChannel.type === "BANK_TRANSFER" ? (
                    <Landmark className="size-4 text-primary" />
                  ) : (
                    <QrCode className="size-4 text-primary" />
                  )}
                  <span className="text-sm font-bold">{payment.paymentChannel.label}</span>
                </div>
                {payment.paymentChannel.type === "BANK_TRANSFER" ? (
                  <p className="font-mono text-sm">
                    {payment.paymentChannel.accountNumber} a.n. {payment.paymentChannel.accountHolder}
                  </p>
                ) : (
                  payment.paymentChannel.qrisImageUrl && (
                    <div className="relative size-40 overflow-hidden rounded-lg border border-border">
                      <Image
                        src={payment.paymentChannel.qrisImageUrl}
                        alt={payment.paymentChannel.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )
                )}
                {payment.paymentChannel.instructions && (
                  <p className="mt-2 text-xs text-muted-foreground">{payment.paymentChannel.instructions}</p>
                )}
              </div>
            )}

            {payment.proofUrl ? (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                <CheckCircle2 className="size-4 shrink-0" />
                Bukti transfer sudah dikirim. Menunggu konfirmasi admin.
              </div>
            ) : (
              <ProofForm orderId={order.id} />
            )}
          </section>
        )}

        <section className="mb-6 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Package className="size-4 text-primary" />
            Item Pesanan
          </h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>
                  {item.productNameSnapshot} <span className="text-muted-foreground">x{item.quantity}</span>
                </span>
                <span className="font-semibold">{formatIDR(Number(item.priceSnapshot) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatIDR(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkos Kirim</span>
              <span>{formatIDR(Number(order.shippingCost))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Diskon</span>
                <span>-{formatIDR(Number(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatIDR(Number(order.total))}</span>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold">
            <MapPin className="size-4 text-primary" />
            Alamat Pengiriman
          </h2>
          <p className="text-sm font-semibold">{order.address.recipientName}</p>
          <p className="text-sm text-muted-foreground">
            {order.address.fullAddress}, {order.address.district}, {order.address.city},{" "}
            {order.address.province} {order.address.postalCode}
          </p>
        </section>

        <div className="flex justify-end">
          <Link href={`/track/${order.id}`}>
            <Button variant="outline" className="gap-2 cursor-pointer">
              <Truck className="size-4" />
              Lacak Pesanan
            </Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
