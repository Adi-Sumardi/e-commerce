import { redirect } from "next/navigation";
import Image from "next/image";
import { Store, Bell, Shield, Database, Landmark, QrCode } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentChannelFormDialog } from "./payment-channel-form-dialog";
import {
  createPaymentChannelAction,
  updatePaymentChannelAction,
  deletePaymentChannelAction,
} from "./payment-channel-actions";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const user = session.user as any;
  const paymentChannels = await db.paymentChannel.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-sm text-muted-foreground">
            Kelola konfigurasi toko dan akun Super Admin Anda
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Store Info */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Store className="size-5 text-primary" />
            <h2 className="text-base font-semibold">Informasi Toko</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-name">Nama Toko</Label>
              <Input id="store-name" defaultValue="Pratama Jaya" readOnly className="bg-muted/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-email">Email Toko</Label>
              <Input id="store-email" defaultValue="info@pratamajaya.com" readOnly className="bg-muted/50" />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="store-desc">Deskripsi Toko</Label>
              <Textarea
                id="store-desc"
                defaultValue="Toko online terpercaya untuk kebutuhan Anda. Kualitas terjamin, pengiriman cepat."
                rows={3}
                readOnly
                className="bg-muted/50 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-phone">Nomor Telepon</Label>
              <Input id="store-phone" defaultValue="+62 812-3456-7890" readOnly className="bg-muted/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-wa">WhatsApp</Label>
              <Input id="store-wa" defaultValue="+62 812-3456-7890" readOnly className="bg-muted/50" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            * Pengaturan toko dikonfigurasi langsung melalui environment variables atau konfigurasi server.
          </p>
        </section>

        {/* Account Info */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <h2 className="text-base font-semibold">Akun Super Admin</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Nama</Label>
              <Input defaultValue={user.name ?? "—"} readOnly className="bg-muted/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input defaultValue={user.email ?? "—"} readOnly className="bg-muted/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Input defaultValue="Super Admin" readOnly className="bg-muted/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>ID Akun</Label>
              <Input defaultValue={user.id ?? "—"} readOnly className="bg-muted/50 font-mono text-xs" />
            </div>
          </div>
        </section>

        {/* Notification Settings (display only) */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="size-5 text-primary" />
            <h2 className="text-base font-semibold">Notifikasi</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Order Baru Masuk", desc: "Terima notifikasi ketika ada order baru yang masuk", enabled: true },
              { label: "Order Dibayar", desc: "Notifikasi ketika customer melakukan pembayaran", enabled: true },
              { label: "Stok Menipis", desc: "Peringatan ketika stok produk di bawah batas minimum", enabled: false },
              { label: "Laporan Harian", desc: "Ringkasan penjualan harian melalui email", enabled: false },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4 py-2">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    item.enabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      item.enabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            * Pengaturan notifikasi email memerlukan konfigurasi SMTP di environment.
          </p>
        </section>

        {/* System Info */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Database className="size-5 text-primary" />
            <h2 className="text-base font-semibold">Informasi Sistem</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Framework", value: "Next.js App Router" },
              { label: "Database", value: "PostgreSQL (Prisma v6)" },
              { label: "Auth", value: "Auth.js v5 (Credentials)" },
              { label: "Payment", value: `Transfer Manual (${paymentChannels.filter((c) => c.isActive).length} aktif)` },
              { label: "Shipping", value: "Biteship API" },
              { label: "Deployment", value: "Local Development" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </section>
        </div>

        {/* Rekening & QRIS Pembayaran (transfer manual) */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Landmark className="size-5 text-primary" />
              <div>
                <h2 className="text-base font-semibold">Rekening & QRIS Pembayaran</h2>
                <p className="text-xs text-muted-foreground">
                  Ditampilkan ke customer saat checkout. Xendit belum diaktifkan — pembayaran diverifikasi manual oleh
                  admin lewat menu Order.
                </p>
              </div>
            </div>
            <PaymentChannelFormDialog mode="create" action={createPaymentChannelAction} />
          </div>

          {paymentChannels.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Landmark className="mx-auto mb-3 size-10 text-muted-foreground/30" />
              <p className="font-medium">Belum ada rekening/QRIS terdaftar</p>
              <p className="text-sm">Customer tidak akan bisa checkout sampai ada minimal 1 metode aktif.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paymentChannels.map((channel) => (
                <div key={channel.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {channel.type === "BANK_TRANSFER" ? (
                        <Landmark className="size-4 shrink-0 text-primary" />
                      ) : (
                        <QrCode className="size-4 shrink-0 text-primary" />
                      )}
                      <span className="text-sm font-semibold">{channel.label}</span>
                    </div>
                    <Badge variant={channel.isActive ? "default" : "secondary"} className="shrink-0 text-xs">
                      {channel.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>

                  {channel.type === "BANK_TRANSFER" ? (
                    <div className="text-sm">
                      <p className="font-mono font-semibold">{channel.accountNumber}</p>
                      <p className="text-muted-foreground">
                        {channel.bankName} a.n. {channel.accountHolder}
                      </p>
                    </div>
                  ) : (
                    channel.qrisImageUrl && (
                      <div className="relative aspect-square w-full max-w-32 overflow-hidden rounded-lg border border-border">
                        <Image src={channel.qrisImageUrl} alt={channel.label} fill className="object-contain" />
                      </div>
                    )
                  )}

                  {channel.instructions && (
                    <p className="text-xs text-muted-foreground">{channel.instructions}</p>
                  )}

                  <div className="mt-auto flex items-center justify-end gap-1 border-t border-border/60 pt-2">
                    <PaymentChannelFormDialog
                      mode="edit"
                      action={updatePaymentChannelAction.bind(null, channel.id)}
                      initialValues={{
                        type: channel.type,
                        label: channel.label,
                        bankName: channel.bankName,
                        accountNumber: channel.accountNumber,
                        accountHolder: channel.accountHolder,
                        qrisImageUrl: channel.qrisImageUrl,
                        instructions: channel.instructions,
                        sortOrder: channel.sortOrder,
                        isActive: channel.isActive,
                      }}
                    />
                    <ConfirmDeleteButton
                      confirmMessage={`Hapus metode pembayaran "${channel.label}"?`}
                      successMessage="Metode pembayaran berhasil dihapus."
                      action={deletePaymentChannelAction.bind(null, channel.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
