import { StaticPageLayout } from "@/components/storefront/static-page-layout";

export default function ReturnsPage() {
  return (
    <StaticPageLayout title="Pengembalian Barang" subtitle="Ketentuan pengembalian dan penukaran produk.">
      <h2>Syarat Pengembalian</h2>
      <ul>
        <li>Produk dalam kondisi belum digunakan dan kemasan asli masih lengkap.</li>
        <li>Pengajuan pengembalian dilakukan dalam waktu wajar setelah barang diterima.</li>
        <li>Produk yang rusak akibat kesalahan pengiriman berhak ditukar atau dikembalikan dananya.</li>
      </ul>
      <h2>Cara Mengajukan Pengembalian</h2>
      <p>
        Hubungi tim layanan pelanggan melalui Pusat Bantuan dengan menyertakan nomor pesanan dan
        alasan pengembalian, disertai foto/video kondisi produk jika diperlukan.
      </p>
      <h2>Proses Pengembalian Dana</h2>
      <p>
        Setelah pengajuan disetujui, dana akan dikembalikan ke metode pembayaran asal sesuai
        dengan kebijakan mitra pembayaran.
      </p>
    </StaticPageLayout>
  );
}
