"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatIDR } from "../_data";

export function CartContent() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/" className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="size-4" />
          Kembali ke Beranda
        </Link>
      </div>

      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <ShoppingCart className="size-8 text-primary" />
        Keranjang Belanja
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center shadow-xs">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingCart className="size-10" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Keranjang Belanja Kosong</h2>
          <p className="mb-8 max-w-sm text-sm text-muted-foreground">
            Sepertinya Anda belum menambahkan produk apa pun ke keranjang belanja Anda.
          </p>
          <Link href="/">
            <Button size="lg" className="font-bold bg-primary hover:bg-primary/95 shadow-md active:scale-95 transition-all">
              Mulai Belanja Sekarang
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Items List */}
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => (
              <div
                key={item.productVariantId}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:shadow-sm"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="block text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Varian: <span className="font-semibold text-foreground">{item.variantName}</span>
                      </p>
                      {item.isPreorder && (
                        <span className="mt-1 inline-block rounded-full bg-preorder/10 px-2.5 py-0.5 text-[10px] font-bold text-preorder uppercase">
                          Pre-Order
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.productVariantId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-base font-bold text-primary">
                      {formatIDR(item.price)}
                    </span>

                    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
                      <button
                        onClick={() => updateQuantity(item.productVariantId, Math.max(1, item.quantity - 1))}
                        className="flex size-7 items-center justify-center rounded bg-card text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                        disabled={item.quantity <= 1}
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}
                        className="flex size-7 items-center justify-center rounded bg-card text-foreground transition-colors hover:bg-accent"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
              <h3 className="mb-4 text-lg font-bold text-foreground">Ringkasan Belanja</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Harga ({items.reduce((acc, i) => acc + i.quantity, 0)} Barang)</span>
                  <span className="font-semibold text-foreground">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Biaya Pengiriman</span>
                  <span className="text-xs text-secondary font-bold">Dihitung di checkout</span>
                </div>
                <hr className="border-border my-4" />
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Subtotal</span>
                  <span className="text-primary">{formatIDR(subtotal)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="mt-6 w-full py-6 text-base font-bold bg-secondary hover:bg-secondary/95 text-secondary-foreground shadow-md active:scale-95 transition-all gap-2 cursor-pointer">
                  Lanjut ke Checkout
                  <ArrowRight className="size-5" />
                </Button>
              </Link>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Semua transaksi diproses secara aman menggunakan protokol enkripsi standar.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
