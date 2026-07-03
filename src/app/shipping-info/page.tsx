import { StaticPageLayout } from "@/components/storefront/static-page-layout";

export default function ShippingInfoPage() {
  return (
    <StaticPageLayout title="Pengiriman" subtitle="Informasi mengenai proses dan estimasi pengiriman pesanan Anda.">
      <h2>Estimasi Pengiriman</h2>
      <p>
        Waktu pengiriman bervariasi tergantung lokasi tujuan dan kurir yang dipilih saat
        checkout. Estimasi waktu tiba akan ditampilkan sebelum Anda menyelesaikan pembayaran.
      </p>
      <h2>Melacak Pesanan</h2>
      <p>
        Setelah pesanan dikirim, Anda dapat memantau status pengiriman secara real-time melalui
        halaman <strong>Pesanan Saya</strong>.
      </p>
      <h2>Biaya Pengiriman</h2>
      <p>
        Biaya pengiriman dihitung otomatis berdasarkan berat, dimensi produk, dan jarak
        pengiriman pada saat checkout.
      </p>
      <h2>Kendala Pengiriman</h2>
      <p>
        Jika pesanan Anda mengalami keterlambatan atau kendala pengiriman, silakan hubungi
        Pusat Bantuan kami.
      </p>
    </StaticPageLayout>
  );
}
