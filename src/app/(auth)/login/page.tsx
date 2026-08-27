import type { Metadata } from "next";
import { ShoppingBasket, Info, AlertTriangle } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

function getAuthErrorMessage(error: string | undefined): string | null {
  if (!error) return null;
  switch (error) {
    case "Configuration":
      return "Terjadi kendala konfigurasi pada server autentikasi. Silakan masuk menggunakan Email dan Kata Sandi.";
    case "AccessDenied":
      return "Akses ditolak. Anda tidak memiliki izin untuk masuk.";
    case "Verification":
      return "Tautan verifikasi sudah tidak berlaku atau kedaluwarsa.";
    case "OAuthSignin":
    case "OAuthCallbackError":
    case "InvalidCheck":
      return "Gagal melakukan autentikasi dengan Google. Silakan coba beberapa saat lagi atau gunakan Email & Kata Sandi.";
    default:
      return "Terjadi kendala saat proses autentikasi. Silakan coba lagi.";
  }
}

// Kasih tau user KENAPA mereka di-redirect ke sini, bukan cuma nampilin
// form login polos — mengurangi kebingungan pas checkout/akses halaman
// yang butuh login lalu tiba-tiba "dilempar" ke sini tanpa konteks.
function getRedirectReasonMessage(callbackUrl: string | undefined): string | null {
  if (!callbackUrl || callbackUrl === "/") return null;
  if (callbackUrl.includes("/checkout")) {
    return "Silakan masuk terlebih dahulu untuk melanjutkan checkout.";
  }
  if (callbackUrl.includes("/account")) {
    return "Silakan masuk terlebih dahulu untuk mengakses akun Anda.";
  }
  if (callbackUrl.includes("/orders") || callbackUrl.includes("/track")) {
    return "Silakan masuk terlebih dahulu untuk melihat pesanan Anda.";
  }
  if (callbackUrl.includes("/admin")) {
    return "Halaman ini khusus admin/staf. Silakan masuk dengan akun yang sesuai.";
  }
  return "Silakan masuk terlebih dahulu untuk melanjutkan.";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const redirectReason = getRedirectReasonMessage(callbackUrl);
  const authError = getAuthErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-muted/30">
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-card rounded-2xl overflow-hidden shadow-xl border border-border">
        {/* Left Side: Login Form */}
        <div className="flex flex-col justify-center px-6 py-10 md:px-12 md:py-16 order-2 md:order-1">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-md">
                <ShoppingBasket className="size-5" />
              </div>
              <span className="text-lg font-bold text-foreground">Pratama Jaya</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-1">Masuk ke Pratama Jaya</h1>
            <p className="text-xs text-muted-foreground">Selamat datang kembali! Silakan masuk ke akun Anda.</p>
          </div>

          {authError && (
            <div className="mb-6 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {!authError && redirectReason && (
            <div className="mb-6 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{redirectReason}</span>
            </div>
          )}

          <LoginForm callbackUrl={callbackUrl ?? "/"} />
        </div>

        {/* Right Side: Brand Visuals */}
        <div className="relative hidden md:block order-1 md:order-2 overflow-hidden bg-primary/10">
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary/60 to-primary/90 mix-blend-multiply"></div>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA-S_SxBgkYjYW7NAKAQcHDTzgkailBBKPbHYRS6vVTaYGShDlTtSIvl6zyoC1jrrTrIWQJwbPFcmr4G6umzMn4pKgZjqqZpWuDUSNxIO_-sSMVp6AQe3P4QM80DT7Y9I0wDnd4DZHL9yMK0K_G-bASty_2JLh9W3MoZNtFQoxi1mCIxk1SfxbGsyG4Uetjn2PKXFoXp3Hd4oZo-osCyVwxZ12mKT98m2yfINnWVJ95A0EvcRIMmKmFjw')`,
            }}
          ></div>
          {/* Content Overlay */}
          <div className="relative z-20 h-full flex flex-col justify-end p-12 text-primary-foreground">
            <div className="bg-card/15 backdrop-blur-md border border-white/20 p-6 rounded-xl mb-8 max-w-sm">
              <h2 className="text-2xl font-bold mb-2">Solusi Belanja Terpercaya</h2>
              <p className="text-sm opacity-90 leading-relaxed">
                Kami menghubungkan jutaan pembeli dan penjual di seluruh Indonesia dengan sistem pengiriman yang cepat dan aman.
              </p>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold leading-none">12jt+</span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 mt-1">Pengguna Aktif</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold leading-none">24/7</span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 mt-1">Layanan Kurir</span>
              </div>
            </div>
          </div>
          {/* Subtle Floating Element */}
          <div className="absolute top-8 right-8 z-20">
            <div className="bg-card/80 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-border">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-foreground text-[10px] font-bold uppercase tracking-wider">Sistem Normal</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
