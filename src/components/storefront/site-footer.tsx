import Image from "next/image";
import Link from "next/link";
import { Globe, MessageCircle, Smile } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-accent">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <Image
            src="/logo/pratama-jaya.png"
            alt="Pratama Jaya"
            width={640}
            height={426}
            unoptimized
            className="h-10 w-auto"
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Pratama Jaya adalah marketplace terpercaya di Indonesia yang menyediakan
            berbagai kebutuhan harian dengan harga terbaik.
          </p>
          <div className="mt-6 flex gap-4">
            <button
              aria-label="Media sosial"
              className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:text-primary"
            >
              <Smile className="size-5" />
            </button>
            <button
              aria-label="Instagram"
              className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:text-primary"
            >
              <Globe className="size-5" />
            </button>
            <button
              aria-label="Live chat"
              className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:text-primary"
            >
              <MessageCircle className="size-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold tracking-wider text-foreground uppercase">
            Layanan Pelanggan
          </span>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/help">
            Pusat Bantuan
          </Link>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/how-to-buy">
            Cara Pembelian
          </Link>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/shipping-info">
            Pengiriman
          </Link>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/returns">
            Pengembalian Barang
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold tracking-wider text-foreground uppercase">Jelajahi</span>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/products">
            Shop
          </Link>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/products">
            Flash Sale
          </Link>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/vouchers">
            Voucher
          </Link>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/products">
            Katalog Digital
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold tracking-wider text-foreground uppercase">Kebijakan</span>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/terms">
            Terms &amp; Conditions
          </Link>
          <Link className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="/security">
            Keamanan Transaksi
          </Link>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-border px-4 py-6 md:flex-row lg:px-8">
        <span className="text-sm text-muted-foreground opacity-70">
          © 2026 Pratama Jaya Indonesia. All rights reserved.
        </span>
        <div className="flex items-center gap-3">
          <Globe className="size-4 text-muted-foreground opacity-60" />
          <span className="text-sm text-muted-foreground">Bahasa Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
