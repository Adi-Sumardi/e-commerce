import { StaticPageLayout } from "@/components/storefront/static-page-layout";

export default function SecurityPage() {
  return (
    <StaticPageLayout title="Keamanan Transaksi" subtitle="Bagaimana kami menjaga keamanan setiap transaksi Anda.">
      <h2>Pembayaran Terenkripsi</h2>
      <p>
        Seluruh transaksi diproses melalui mitra pembayaran tepercaya dengan protokol enkripsi
        standar industri, sehingga data pembayaran Anda tidak pernah disimpan langsung di server
        kami.
      </p>
      <h2>Verifikasi Akun</h2>
      <p>
        Kami menerapkan sistem autentikasi untuk memastikan hanya pemilik akun yang dapat
        melakukan transaksi.
      </p>
      <h2>Tips Berbelanja Aman</h2>
      <ul>
        <li>Jangan pernah membagikan kode OTP atau kata sandi akun Anda kepada siapa pun.</li>
        <li>Pastikan Anda berbelanja hanya melalui domain resmi Pratama Jaya.</li>
        <li>Segera laporkan aktivitas mencurigakan pada akun Anda ke Pusat Bantuan.</li>
      </ul>
    </StaticPageLayout>
  );
}
