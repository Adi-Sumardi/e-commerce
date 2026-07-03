import { StaticPageLayout } from "@/components/storefront/static-page-layout";

export default function PrivacyPage() {
  return (
    <StaticPageLayout title="Privacy Policy" subtitle="Bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.">
      <h2>Informasi yang Kami Kumpulkan</h2>
      <p>
        Kami mengumpulkan informasi yang Anda berikan saat mendaftar dan berbelanja, seperti
        nama, email, alamat pengiriman, dan riwayat transaksi.
      </p>
      <h2>Penggunaan Data</h2>
      <p>
        Data digunakan untuk memproses pesanan, meningkatkan layanan, dan mengirimkan informasi
        terkait transaksi Anda.
      </p>
      <h2>Keamanan Data</h2>
      <p>
        Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data pribadi Anda
        dari akses yang tidak sah.
      </p>
      <h2>Berbagi Data dengan Pihak Ketiga</h2>
      <p>
        Data hanya dibagikan kepada mitra yang diperlukan untuk memproses pesanan, seperti mitra
        pembayaran dan jasa pengiriman.
      </p>
    </StaticPageLayout>
  );
}
