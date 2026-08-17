"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  Clock,
  CreditCard,
  History,
  Landmark,
  MapPin,
  QrCode,
  ShieldCheck,
  Truck,
  Loader2,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/store/cart-store";
import { AreaSearchInput } from "@/components/shared/area-search-input";
import { formatIDR } from "../_data";
import { getCheckoutDataAction, placeOrderAction, addAddressAction, applyVoucherAction } from "./actions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CheckoutFormProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function CheckoutForm({ user }: CheckoutFormProps) {
  const { items, clear } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState<any>(null);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);

  // Selection states
  const [selectedCourier, setSelectedCourier] = useState<string>("");
  const [selectedPaymentChannelId, setSelectedPaymentChannelId] = useState<string>("");
  const [preorderScheme, setPreorderScheme] = useState<"full" | "dp">("dp");

  // Voucher / Discount states
  const [voucherCode, setVoucherCode] = useState("");
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    id: string;
    code: string;
    type: string;
    value: number;
    discountAmount: number;
  } | null>(null);

  // New Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [label, setLabel] = useState("Rumah");
  const [recipientName, setRecipientName] = useState(user.name);
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [biteshipAreaId, setBiteshipAreaId] = useState("");
  const [addingAddress, setAddingAddress] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (items.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const data = await getCheckoutDataAction(items);
        setAddress(data.address);
        setShippingOptions(data.shippingOptions);
        setPaymentChannels(data.paymentChannels ?? []);
        if (data.shippingOptions.length > 0) {
          setSelectedCourier(data.shippingOptions[0].id);
        }
        if (data.paymentChannels?.length > 0) {
          setSelectedPaymentChannelId(data.paymentChannels[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat opsi pengiriman.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
          <ShoppingCart className="size-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Keranjang Belanja Kosong</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
          Harap tambahkan item ke keranjang belanja Anda sebelum masuk ke checkout.
        </p>
        <Link href="/">
          <Button size="lg" className="font-bold bg-primary hover:bg-primary/95 shadow-md active:scale-95 transition-all">
            Belanja Sekarang
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-4 font-semibold">Memuat opsi checkout...</p>
      </div>
    );
  }

  // Cost calculation
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const selectedCourierObj = shippingOptions.find((c) => c.id === selectedCourier);
  const courierPrice = selectedCourierObj ? selectedCourierObj.price : 0;
  const insurance = 10000; // Fixed insurance cost Rp 10.000
  const serviceFee = 1000; // Fixed service fee Rp 1.000
  
  // Calculate discount dynamically based on voucher type
  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const total = Math.max(0, subtotal + courierPrice + insurance + serviceFee - discount);

  const hasPreorder = items.some((i) => i.isPreorder);
  const dpAmount = Math.round(total * 0.3);
  const remainingAmount = total - dpAmount;

  const payNowAmount = hasPreorder && preorderScheme === "dp" ? dpAmount : total;

  async function handleApplyVoucher() {
    if (!voucherCode.trim()) return;
    setApplyingVoucher(true);
    try {
      const res = await applyVoucherAction(voucherCode, subtotal);
      if (res.success && res.voucher) {
        setAppliedVoucher(res.voucher);
        toast.success(`Voucher ${res.voucher.code} berhasil dipasang!`);
      } else {
        toast.error(res.message || "Gagal memasang voucher.");
      }
    } catch (err) {
      toast.error("Gagal memproses voucher.");
    } finally {
      setApplyingVoucher(false);
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !province || !city || !district || !postalCode || !fullAddress) {
      toast.error("Harap isi semua kolom alamat.");
      return;
    }
    if (!biteshipAreaId) {
      toast.error("Harap cari dan pilih kecamatan/kota tujuan dari daftar pencarian.");
      return;
    }

    setAddingAddress(true);
    try {
      const newAddress = await addAddressAction({
        label,
        recipientName,
        phone,
        province,
        city,
        district,
        postalCode,
        fullAddress,
        biteshipAreaId,
      });
      setAddress(newAddress);
      setShowAddressForm(false);
      toast.success("Alamat pengiriman berhasil ditambahkan!");
      
      // Reload checkout data with the new address area ID
      setLoading(true);
      const data = await getCheckoutDataAction(items);
      setShippingOptions(data.shippingOptions);
      if (data.shippingOptions.length > 0) {
        setSelectedCourier(data.shippingOptions[0].id);
      }
    } catch (err) {
      toast.error("Gagal menyimpan alamat.");
    } finally {
      setAddingAddress(false);
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!address) {
      toast.error("Harap tentukan alamat pengiriman terlebih dahulu.");
      return;
    }
    if (!selectedCourier) {
      toast.error("Harap pilih kurir pengiriman.");
      return;
    }
    if (!selectedPaymentChannelId) {
      toast.error("Harap pilih rekening/QRIS tujuan transfer.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await placeOrderAction({
        addressId: address.id,
        courierId: selectedCourier,
        courierName: selectedCourierObj?.name || "Biteship Delivery",
        courierPrice,
        paymentMethod: "manual_transfer",
        paymentChannelId: selectedPaymentChannelId,
        preorderScheme,
        items: items.map((i) => ({
          productVariantId: i.productVariantId,
          quantity: i.quantity,
        })),
        voucherId: appliedVoucher?.id ?? null,
        discount: discount,
      });

      toast.success("Order berhasil dibuat!");
      clear(); // Clear local Zustand cart
      window.location.href = res.paymentUrl;
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card shadow-sm border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="cursor-pointer text-2xl font-bold text-primary">
            Pratama Jaya
          </Link>
          <div className="hidden items-center gap-4 md:flex">
            <span className="text-sm text-muted-foreground">Butuh bantuan?</span>
            <a className="text-sm font-bold text-primary hover:underline" href="#">
              Chat Penjual
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        {/* Progress Indicator */}
        <nav className="mb-12 flex items-center justify-center">
          <ol className="flex w-full max-w-2xl items-center">
            <li className="relative flex w-full items-center text-primary after:inline-block after:h-1 after:w-full after:border-b-4 after:border-primary">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white lg:size-12">
                <Check className="size-5" />
              </span>
              <div className="absolute top-full mt-2 text-center">
                <span className="text-xs font-semibold">Alamat</span>
              </div>
            </li>
            <li className="relative flex w-full items-center text-primary after:inline-block after:h-1 after:w-full after:border-b-4 after:border-border">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white ring-4 ring-primary/20 lg:size-12">
                2
              </span>
              <div className="absolute top-full mt-2 text-center">
                <span className="text-xs font-bold text-primary">Kurir &amp; Bayar</span>
              </div>
            </li>
            <li className="relative flex items-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground lg:size-12">
                3
              </span>
              <div className="absolute top-full mt-2 text-center">
                <span className="text-xs text-muted-foreground">Konfirmasi</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Address Section */}
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <MapPin className="size-5 text-primary" />
                  Alamat Pengiriman
                </h2>
                {!address && !showAddressForm && (
                  <Button
                    onClick={() => setShowAddressForm(true)}
                    variant="outline"
                    className="font-bold gap-2 border-primary text-primary hover:bg-primary/5 cursor-pointer"
                  >
                    <Plus className="size-4" />
                    Tambah Alamat
                  </Button>
                )}
              </div>

              {address ? (
                <div className="border-l-4 border-primary pl-4 py-1">
                  <p className="text-lg font-bold flex items-center gap-2">
                    {address.recipientName}
                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground font-normal">
                      {address.label}
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {address.fullAddress}, {address.district}, {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-2">{address.phone}</p>
                </div>
              ) : !showAddressForm ? (
                <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-4 text-center">
                  <p className="text-sm text-destructive font-bold mb-2">Anda belum memiliki alamat pengiriman.</p>
                  <p className="text-xs text-muted-foreground">Harap tambahkan alamat pengiriman agar sistem dapat menghitung biaya pengiriman Biteship.</p>
                </div>
              ) : null}

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mt-4 border-t border-border pt-4 space-y-4">
                  <h3 className="font-bold text-sm">Alamat Baru</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="label">Label Alamat</Label>
                      <input
                        id="label"
                        className="w-full rounded-lg border border-border bg-background p-2 mt-1 focus:ring-primary"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Contoh: Rumah, Kantor, Kos"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipient">Nama Penerima</Label>
                      <input
                        id="recipient"
                        required
                        className="w-full rounded-lg border border-border bg-background p-2 mt-1 focus:ring-primary"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">No. Telepon / HP</Label>
                    <input
                      id="phone"
                      required
                      className="w-full rounded-lg border border-border bg-background p-2 mt-1 focus:ring-primary"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                    />
                  </div>

                  <div>
                    <Label>Kecamatan / Kota Tujuan</Label>
                    <div className="mt-1">
                      <AreaSearchInput
                        onSelect={(area) => {
                          setBiteshipAreaId(area.id);
                          setProvince(area.administrative_division_level_1_name);
                          setCity(area.administrative_division_level_2_name);
                          setDistrict(area.administrative_division_level_3_name ?? area.name);
                          setPostalCode(String(area.postal_code));
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cari dan pilih lokasi supaya ongkos kirim dihitung akurat sesuai kurir Biteship.
                    </p>
                  </div>

                  {biteshipAreaId && (
                    <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Provinsi</p>
                        <p className="font-semibold">{province}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Kota/Kabupaten</p>
                        <p className="font-semibold">{city}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Kode Pos</p>
                        <p className="font-semibold">{postalCode}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="fullAddress">Alamat Lengkap</Label>
                    <textarea
                      id="fullAddress"
                      required
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background p-2 mt-1 focus:ring-primary"
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="Jalan, No. Rumah, RT/RW, Blok, Gang"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddressForm(false)}
                      disabled={addingAddress}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={addingAddress} className="font-bold cursor-pointer">
                      {addingAddress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Simpan Alamat
                    </Button>
                  </div>
                </form>
              )}
            </section>

            {/* Pre-Order Banner Scheme */}
            {hasPreorder && (
              <section className="rounded-xl border border-preorder/30 bg-preorder/5 shadow-sm p-6">
                <div className="flex items-center gap-3 border-b border-preorder/20 pb-4 mb-4">
                  <Clock className="size-6 text-preorder shrink-0" />
                  <div>
                    <p className="text-base font-bold text-preorder">
                      Item Pre-Order Terdeteksi di Keranjang
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Barang akan dikirim segera setelah stok siap diproduksi/didatangkan.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-bold text-foreground">Pilih Skema Pembayaran</h3>
                  <RadioGroup
                    value={preorderScheme}
                    onValueChange={(v) => setPreorderScheme(v as "full" | "dp")}
                    className="gap-3"
                  >
                    <label
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all ${
                        preorderScheme === "full"
                          ? "border-2 border-preorder bg-preorder/10 shadow-xs"
                          : "border-border hover:border-preorder/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="full" id="scheme-full" />
                        <Label htmlFor="scheme-full" className="font-bold cursor-pointer">
                          Bayar Penuh Sekarang
                        </Label>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatIDR(total)}
                      </span>
                    </label>
                    <label
                      className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-all ${
                        preorderScheme === "dp"
                          ? "border-2 border-preorder bg-preorder/10 shadow-xs"
                          : "border-border hover:border-preorder/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="dp" id="scheme-dp" />
                          <Label htmlFor="scheme-dp" className="font-bold cursor-pointer">
                            DP 30% Sekarang
                          </Label>
                        </div>
                        <span className="font-bold text-primary">{formatIDR(dpAmount)}</span>
                      </div>
                      <p className="pl-7 text-xs text-muted-foreground font-semibold">
                        (Sisa Pelunasan {formatIDR(remainingAmount)} dibayar saat barang siap kirim)
                      </p>
                    </label>
                  </RadioGroup>
                </div>
              </section>
            )}

            {/* Courier Selection */}
            {address && (
              <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <Truck className="size-5 text-primary" />
                    Pilih Kurir Pengiriman (Biteship Live Rates)
                  </h2>
                </div>
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  <Truck className="size-4 shrink-0" />
                  <span><strong>Promo Aktif:</strong> Gratis Ongkir Jabodetabek • Luar Jabodetabek Potong Ongkir Rp30.000</span>
                </div>
                <RadioGroup
                  value={selectedCourier}
                  onValueChange={setSelectedCourier}
                  className="grid grid-cols-1 gap-4 md:grid-cols-3"
                >
                  {shippingOptions.map((courier) => (
                    <label
                      key={courier.id}
                      className={`relative flex cursor-pointer flex-col rounded-xl p-4 transition-all ${
                        selectedCourier === courier.id
                          ? "border-2 border-primary bg-primary/5 shadow-xs"
                          : "border border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <RadioGroupItem value={courier.id} className="sr-only" />
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-6 w-14 items-center justify-center rounded bg-muted text-[9px] font-extrabold uppercase">
                            {courier.name.split(" ")[0]}
                          </div>
                          {courier.isFreeShipping || courier.price === 0 ? (
                            <Badge className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0">
                              GRATIS ONGKIR
                            </Badge>
                          ) : courier.originalPrice ? (
                            <Badge className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0">
                              POTONG Rp30.000
                            </Badge>
                          ) : null}
                        </div>
                        {selectedCourier === courier.id && (
                          <Check className="size-5 text-primary" />
                        )}
                      </div>
                      <p className="mt-4 text-base font-bold">{courier.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{courier.eta}</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        {courier.price === 0 ? (
                          <>
                            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                              FREE / Rp 0
                            </span>
                            {courier.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatIDR(courier.originalPrice)}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-base font-extrabold text-primary">
                              {formatIDR(courier.price)}
                            </span>
                            {courier.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatIDR(courier.originalPrice)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </section>
            )}

            {/* Payment Method */}
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-2 flex items-center gap-2 text-xl font-bold">
                <CreditCard className="size-5 text-primary" />
                Metode Pembayaran
              </h2>
              <p className="mb-6 text-xs text-muted-foreground">
                Transfer ke rekening/QRIS di bawah ini, lalu kirim bukti transfer setelah pesanan dibuat. Admin akan
                verifikasi & konfirmasi pembayaran secara manual.
              </p>

              {paymentChannels.length === 0 ? (
                <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
                  Belum ada rekening/QRIS aktif. Hubungi admin toko untuk menambahkan metode pembayaran.
                </div>
              ) : (
                <RadioGroup
                  value={selectedPaymentChannelId}
                  onValueChange={setSelectedPaymentChannelId}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  {paymentChannels.map((channel) => (
                    <label
                      key={channel.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-all ${
                        selectedPaymentChannelId === channel.id
                          ? "border-2 border-primary bg-primary/5 shadow-xs"
                          : "border border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={channel.id} className="mt-1" />
                      <div className="flex flex-1 items-start gap-3">
                        {channel.type === "BANK_TRANSFER" ? (
                          <Landmark className="mt-0.5 size-5 shrink-0 text-primary" />
                        ) : (
                          <QrCode className="mt-0.5 size-5 shrink-0 text-primary" />
                        )}
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-sm">{channel.label}</span>
                          {channel.type === "BANK_TRANSFER" ? (
                            <span className="font-mono text-xs text-muted-foreground">
                              {channel.accountNumber} a.n. {channel.accountHolder}
                            </span>
                          ) : (
                            channel.qrisImageUrl && (
                              <div className="relative size-20 overflow-hidden rounded-lg border border-border">
                                <Image
                                  src={channel.qrisImageUrl}
                                  alt={channel.label}
                                  fill
                                  unoptimized
                                  className="object-contain"
                                />
                              </div>
                            )
                          )}
                          {channel.instructions && (
                            <span className="text-[10px] text-muted-foreground">{channel.instructions}</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              )}
            </section>
          </div>

          {/* Right column: Summary */}
          <div className="sticky top-24 lg:col-span-4">
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              <div className="bg-primary p-6 text-primary-foreground">
                <h3 className="text-xl font-bold">Ringkasan Belanja</h3>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-sm">Total Harga ({items.reduce((acc, i) => acc + i.quantity, 0)} Barang)</span>
                  <span className="text-sm font-semibold text-foreground">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-sm">Ongkos Kirim ({selectedCourierObj?.name.split(" ")[0] || "-"})</span>
                  <span className="text-sm font-semibold text-foreground">{formatIDR(courierPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-sm">Asuransi Pengiriman</span>
                  <span className="text-sm font-semibold text-foreground">{formatIDR(insurance)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-sm">Biaya Layanan</span>
                  <span className="text-sm font-semibold text-foreground">{formatIDR(serviceFee)}</span>
                </div>
                 <div className="flex gap-2 my-2">
                  <Input
                    placeholder="KODE VOUCHER (HEMAT50)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 uppercase font-bold text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={applyingVoucher || !voucherCode.trim()}
                    onClick={handleApplyVoucher}
                    className="cursor-pointer font-bold shrink-0"
                  >
                    {applyingVoucher ? "..." : "Pakai"}
                  </Button>
                </div>

                {appliedVoucher && (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">Voucher: {appliedVoucher.code}</p>
                      <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 truncate">Potongan {appliedVoucher.type === "PERCENTAGE" ? `${appliedVoucher.value}%` : formatIDR(appliedVoucher.value)}</p>
                    </div>
                    <span className="font-bold shrink-0">- {formatIDR(appliedVoucher.discountAmount)}</span>
                  </div>
                )}

                <div className="my-4 h-px bg-border" />
                
                {hasPreorder && preorderScheme === "dp" && (
                  <div className="rounded-lg bg-preorder/5 border border-preorder/20 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-preorder">
                      <span>Total Tagihan:</span>
                      <span>{formatIDR(total)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>DP 30% Wajib (Sekarang):</span>
                      <span>{formatIDR(dpAmount)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Pelunasan (Nanti):</span>
                      <span>{formatIDR(remainingAmount)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-between pt-4">
                  <span className="text-lg font-bold text-foreground">Total Bayar Sekarang</span>
                  <span className="text-xl font-extrabold text-primary">{formatIDR(payNowAmount)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={submitting}
                  size="lg"
                  className="mt-6 w-full bg-secondary py-6 text-base font-bold text-secondary-foreground shadow-md transition-all hover:bg-secondary/95 active:scale-95 cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      Membuat Pesanan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Buat Pesanan ({formatIDR(payNowAmount)})
                    </span>
                  )}
                </Button>

                <p className="mt-4 text-center text-[10px] text-muted-foreground leading-normal">
                  Dengan mengklik tombol, Anda menyetujui{" "}
                  <a className="text-primary underline" href="#">
                    Syarat &amp; Ketentuan
                  </a>{" "}
                  Pratama Jaya. Pengiriman diproses via mitra Biteship.
                </p>
              </div>
            </section>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-2 gap-4 opacity-75">
              <div className="flex flex-col items-center rounded-xl bg-card border border-border p-4 shadow-2xs">
                <ShieldCheck className="size-6 text-primary" />
                <span className="mt-2 text-center text-xs font-semibold">Belanja Aman 100%</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-card border border-border p-4 shadow-2xs">
                <History className="size-6 text-primary" />
                <span className="mt-2 text-center text-xs font-semibold">Garansi Pengembalian</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
