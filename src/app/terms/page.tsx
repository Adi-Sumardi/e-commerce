import { StaticPageLayout } from "@/components/storefront/static-page-layout";

export default function TermsPage() {
  return (
    <StaticPageLayout title="Terms & Conditions" subtitle="Syarat dan ketentuan penggunaan layanan Pratama Jaya.">
      <h2>Penggunaan Layanan</h2>
      <p>
        Dengan menggunakan platform ini, Anda setuju untuk memberikan informasi yang akurat dan
        menggunakan layanan sesuai dengan tujuannya.
      </p>
      <h2>Pemesanan &amp; Pembayaran</h2>
      <p>
        Pesanan dianggap sah setelah pembayaran terkonfirmasi. Kami berhak membatalkan pesanan
        jika terjadi kendala stok atau indikasi kecurangan.
      </p>
      <h2>Harga &amp; Ketersediaan Produk</h2>
      <p>
        Harga dan ketersediaan produk dapat berubah sewaktu-waktu tanpa pemberitahuan
        sebelumnya.
      </p>
      <h2>Batasan Tanggung Jawab</h2>
      <p>
        Kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan
        layanan ini di luar kendali wajar kami.
      </p>
    </StaticPageLayout>
  );
}
