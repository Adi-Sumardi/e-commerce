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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WhatsappIcon, InstagramIcon, FacebookIcon, TiktokIcon } from "@/components/shared/social-icons";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatIDR } from "@/app/_data";

interface ProductPurchasePanelProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    originalPrice: number | null;
    isPreorder: boolean;
    stock: number;
    images: { url: string; alt: string }[];
    variants: {
      id: string;
      sku: string;
      name: string;
      type: "TEXT" | "COLOR";
      hex: string;
      price: number;
      stock: number;
    }[];
  };
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [color, setColor] = useState(product.variants[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const isColorPicker = product.variants.some((v) => v.type === "COLOR");
  const selectedColor = product.variants.find((c) => c.name === color);
  const currentStock = selectedColor ? selectedColor.stock : product.stock;
  const activePrice = selectedColor ? selectedColor.price : product.price;
  const hasDiscount = product.originalPrice !== null && product.originalPrice > activePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - activePrice) / product.originalPrice!) * 100)
    : null;

  function changeQty(delta: number) {
    const maxQty = product.isPreorder ? 999 : currentStock;
    setQuantity((qty) => Math.min(maxQty, Math.max(1, qty + delta)));
  }

  function handleAddToCart(silent = false) {
    if (!selectedColor) {
      toast.error(isColorPicker ? "Silakan pilih warna terlebih dahulu." : "Silakan pilih varian terlebih dahulu.");
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

  async function handleShare(platform: "whatsapp" | "instagram" | "facebook" | "tiktok") {
    const shareUrl = `${window.location.origin}/products/${product.slug}`;
    const shareText = `${product.name} - Pratama Jaya`;

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, "_blank");
      return;
    }
    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
      return;
    }

    // Instagram & TikTok tidak punya web share URL resmi untuk konten
    // arbitrer — coba native share sheet (kalau ada Instagram/TikTok
    // terpasang, muncul di situ), fallback ke copy link.
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl });
        return;
      } catch {
        // user membatalkan share sheet — jangan lanjut ke fallback copy
        return;
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    toast.success(
      `Link disalin! Buka ${platform === "instagram" ? "Instagram" : "TikTok"} lalu tempel di story/bio.`
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-xl bg-muted p-4">
        <div className="mb-1 text-2xl font-bold text-foreground">{formatIDR(activePrice)}</div>
        {hasDiscount && (
          <div className="flex items-center gap-2">
            <Badge className="bg-destructive/10 font-bold text-destructive">{discountPercent}% OFF</Badge>
            <span className="text-sm text-muted-foreground line-through">
              {formatIDR(product.originalPrice!)}
            </span>
          </div>
        )}
      </div>
      {product.variants.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">
            {isColorPicker ? "Pilih Warna" : "Pilih Varian"}:{" "}
            <span className="font-normal text-muted-foreground">{color}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) =>
              v.type === "COLOR" ? (
                <button
                  key={v.name}
                  onClick={() => {
                    setColor(v.name);
                    setQuantity(1);
                  }}
                  aria-label={`Pilih warna ${v.name}`}
                  style={{ backgroundColor: v.hex }}
                  className={`size-12 rounded-full ring-2 transition-all hover:scale-105 active:scale-95 ${
                    color === v.name
                      ? "border-4 border-primary ring-transparent"
                      : "border-4 border-card ring-transparent"
                  }`}
                />
              ) : (
                <button
                  key={v.name}
                  onClick={() => {
                    setColor(v.name);
                    setQuantity(1);
                  }}
                  aria-label={`Pilih varian ${v.name}`}
                  className={`min-w-12 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                    color === v.name
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {v.name}
                </button>
              )
            )}
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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer">
                  <Share2 className="size-4" />
                  Bagikan
                </button>
              }
            />
            <DropdownMenuContent align="center" className="w-44">
              <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="cursor-pointer gap-2">
                <WhatsappIcon className="size-4 text-[#25D366]" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer gap-2">
                <FacebookIcon className="size-4 text-[#1877F2]" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("instagram")} className="cursor-pointer gap-2">
                <InstagramIcon className="size-4 text-[#E4405F]" />
                Instagram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("tiktok")} className="cursor-pointer gap-2">
                <TiktokIcon className="size-4 text-foreground" />
                TikTok
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
