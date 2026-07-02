import Link from "next/image";
import NextLink from "next/link";
import { ShoppingBasket } from "lucide-react";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen">
      {/* Left Side: Aesthetic/Brand Panel */}
      <div className="hidden lg:flex w-1/2 relative bg-primary-container/10 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="relative z-10 max-w-md space-y-6 text-foreground">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Mulai Perjalanan Belanja Anda Bersama Pratama Jaya.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nikmati akses eksklusif ke produk premium, pengiriman prioritas, dan penawaran terbaik setiap harinya.
          </p>
          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2 bg-card border border-border/80 p-4 rounded-xl shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Keamanan Terjamin</span>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border/80 p-4 rounded-xl shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kurir Terpercaya</span>
            </div>
          </div>
        </div>
        {/* Absolute Image Accent */}
        <div className="absolute bottom-12 right-12 w-60 h-60 rounded-full overflow-hidden shadow-2xl border-4 border-card/85">
          <img
            className="w-full h-full object-cover"
            alt="Interior premium lifestyle product placement"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQXmkwFPrW784W-ZizY0gGu6GR8lmqDLmZgT6Yz-Skhp5ClqGq9qwFX6pDVD15GF1OpKTc03JPCzOYkocCBRLbi8eqj4rivIOFBme8XvEt8s8IHm33he9IhaqRrZNJZdx2RSHiOOCfSUJ8Ay46TjF3835_r8uztfHDx4lWViCBYOl725XrV6USqy7TzcVkXlLh-l_l82Cu2pRdbCf0k4TsigfB6M94bI7kbrLNPe4A9iir2GT2Cm4K1g"
          />
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-card">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Brand Header */}
          <div className="text-center lg:text-left space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-md">
                <ShoppingBasket className="size-5" />
              </div>
              <span className="text-lg font-bold text-foreground">Pratama Jaya</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Daftar Akun Baru</h2>
            <p className="text-xs text-muted-foreground leading-normal">Lengkapi data di bawah ini untuk mulai berbelanja.</p>
          </div>

          <RegisterForm />

          {/* Login Link */}
          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Sudah punya akun?{" "}
              <NextLink className="text-primary font-bold hover:underline ml-1" href="/login">
                Masuk
              </NextLink>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
