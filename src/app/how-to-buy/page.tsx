import { StaticPageLayout } from "@/components/storefront/static-page-layout";

export default function HowToBuyPage() {
  return (
    <StaticPageLayout title="Cara Pembelian" subtitle="Panduan langkah demi langkah berbelanja di Pratama Jaya.">
      <h2>1. Pilih Produk</h2>
      <p>Jelajahi katalog produk kami dan pilih item yang ingin dibeli beserta variannya.</p>
      <h2>2. Tambahkan ke Keranjang</h2>
      <p>Tentukan jumlah yang diinginkan, lalu tambahkan produk ke keranjang belanja.</p>
      <h2>3. Checkout</h2>
      <p>Buka halaman keranjang, periksa kembali pesanan Anda, lalu lanjutkan ke checkout.</p>
      <h2>4. Isi Alamat &amp; Pilih Pengiriman</h2>
      <p>Masukkan alamat pengiriman dan pilih kurir sesuai kebutuhan Anda.</p>
      <h2>5. Selesaikan Pembayaran</h2>
      <p>
        Pilih metode pembayaran yang tersedia dan selesaikan transaksi. Pesanan akan diproses
        setelah pembayaran terkonfirmasi.
      </p>
    </StaticPageLayout>
  );
}
