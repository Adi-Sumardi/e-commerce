"use client";

import { useState } from "react";
import {
  ChevronRight,
  Minus,
  MessageCircle,
  Plus,
  Share2,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductPurchasePanelProps {
  product: {
    id: string;
    slug: string;
    name: string;
    isPreorder: boolean;
    stock: number;
    images: { url: string; alt: string }[];
    colors: {
      id: string;
      sku: string;
      name: string;
      hex: string;
      price: number;
      stock: number;
    }[];
  };
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const selectedColor = product.colors.find((c) => c.name === color);
  const currentStock = selectedColor ? selectedColor.stock : product.stock;

  function changeQty(delta: number) {
    const maxQty = product.isPreorder ? 999 : currentStock;
    setQuantity((qty) => Math.min(maxQty, Math.max(1, qty + delta)));
  }

  function handleAddToCart(silent = false) {
    if (!selectedColor) {
      toast.error("Silakan pilih warna terlebih dahulu.");
      return false;
    }

    if (currentStock <= 0 && !product.isPreorder) {
      toast.error("Stok untuk varian ini sedang habis.");
      return false;
    }

    addItem({
      productVariantId: selectedColor.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: selectedColor.name,
      price: selectedColor.price,
      imageUrl: product.images[0]?.url || "",
      quantity,
      isPreorder: product.isPreorder,
    });

    if (!silent) {
      toast.success(`${product.name} (${selectedColor.name}) ditambahkan ke keranjang.`);
    }
    return true;
  }

  function handleBuyNow() {
    const success = handleAddToCart(true);
    if (success) {
      router.push("/cart");
    }
  }

  return (
    <section className="flex flex-col gap-4">
      {product.colors.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">
            Pilih Warna: <span className="font-normal text-muted-foreground">{color}</span>
          </h3>
          <div className="flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setColor(c.name);
                  setQuantity(1);
                }}
                aria-label={`Pilih warna ${c.name}`}
                style={{ backgroundColor: c.hex }}
                className={`size-12 rounded-full ring-2 transition-all hover:scale-105 active:scale-95 ${
                  color === c.name
                    ? "border-4 border-primary ring-transparent"
                    : "border-4 border-card ring-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="mb-2 text-lg font-semibold">Jumlah</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <button
              aria-label="Kurangi jumlah"
              disabled={quantity <= 1}
              onClick={() => changeQty(-1)}
              className="flex size-8 items-center justify-center rounded transition-colors hover:bg-accent disabled:opacity-50"
            >
              <Minus className="size-4" />
            </button>
            <input
              aria-label="Jumlah"
              className="w-12 border-none bg-transparent text-center font-bold focus:ring-0"
              min={1}
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.min(currentStock, Math.max(1, Number(e.target.value) || 1)))
              }
            />
            <button
              aria-label="Tambah jumlah"
              disabled={quantity >= currentStock}
              onClick={() => changeQty(1)}
              className="flex size-8 items-center justify-center rounded transition-colors hover:bg-accent disabled:opacity-50"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">
            Stok: <span className="font-bold text-foreground">{currentStock}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleAddToCart(false)}
            className="gap-2 border-2 border-primary py-6 font-bold text-primary hover:bg-primary/10 cursor-pointer"
          >
            <ShoppingCart className="size-4" />
            Keranjang
          </Button>
          <Button
            onClick={handleBuyNow}
            className="bg-secondary py-6 font-bold text-secondary-foreground shadow-md hover:bg-secondary/90 active:scale-95 cursor-pointer"
          >
            Beli Sekarang
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 border-t border-border/30 py-2">
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer">
            <MessageCircle className="size-4" />
            Chat
          </button>
          <div className="h-3 w-px bg-border" />
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer">
            <Share2 className="size-4" />
            Bagikan
          </button>
        </div>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-border p-4">
        <div>
          <h4 className="mb-2 text-lg font-semibold">Pengiriman</h4>
          <div className="flex cursor-pointer items-center justify-between rounded-lg bg-muted p-3 transition-colors hover:bg-accent">
            <div className="flex items-center gap-3">
              <Truck className="size-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Pengiriman via Biteship</p>
                <p className="text-xs text-muted-foreground">Reguler &amp; Instant tersedia saat checkout</p>
              </div>
            </div>
            <ChevronRight className="size-5" />
          </div>
        </div>
      </section>
    </section>
  );
}
