import { Globe, MessageCircle, Smile } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-accent">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <span className="text-lg font-bold text-foreground">Pratama Jaya</span>
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
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Pusat Bantuan
          </a>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Cara Pembelian
          </a>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Pengiriman
          </a>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Pengembalian Barang
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold tracking-wider text-foreground uppercase">Jelajahi</span>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Shop
          </a>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Flash Sale
          </a>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Voucher
          </a>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Katalog Digital
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold tracking-wider text-foreground uppercase">Kebijakan</span>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Privacy Policy
          </a>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Terms &amp; Conditions
          </a>
          <a className="text-sm text-muted-foreground underline transition-all hover:text-primary" href="#">
            Keamanan Transaksi
          </a>
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
