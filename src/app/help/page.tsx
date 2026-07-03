import { StaticPageLayout } from "@/components/storefront/static-page-layout";

export default function HelpPage() {
  return (
    <StaticPageLayout title="Pusat Bantuan" subtitle="Pertanyaan yang sering diajukan seputar belanja di Pratama Jaya.">
      <h2>Bagaimana cara memesan produk?</h2>
      <p>
        Pilih produk yang diinginkan, tentukan varian dan jumlahnya, lalu tambahkan ke keranjang.
        Selesaikan pembayaran melalui halaman checkout untuk menyelesaikan pesanan.
      </p>
      <h2>Metode pembayaran apa saja yang tersedia?</h2>
      <p>
        Kami mendukung berbagai metode pembayaran termasuk transfer bank, e-wallet, dan QRIS
        yang diproses secara aman melalui mitra pembayaran kami.
      </p>
      <h2>Bagaimana cara melacak pesanan saya?</h2>
      <p>
        Buka halaman <strong>Pesanan Saya</strong> di akun Anda, lalu klik pesanan yang ingin
        dilacak untuk melihat status pengiriman terkini.
      </p>
      <h2>Butuh bantuan lebih lanjut?</h2>
      <p>
        Hubungi tim layanan pelanggan kami melalui WhatsApp atau live chat yang tersedia di
        pojok kanan bawah halaman.
      </p>
    </StaticPageLayout>
  );
}
