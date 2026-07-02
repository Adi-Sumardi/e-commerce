"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginWithCredentials, loginWithGoogle } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(loginWithCredentials, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="email">
            Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Mail className="size-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Contoh: user@email.com"
              required
              autoComplete="email"
              className="w-full pl-9 pr-3 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="password">
            Kata Sandi
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Lock className="size-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              required
              autoComplete="current-password"
              className="w-full pl-9 pr-10 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground"
            />
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Lupa Password */}
        <div className="flex items-center justify-between mt-1 text-xs">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
            />
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              Ingat saya
            </span>
          </label>
          <a className="font-semibold text-primary hover:underline" href="#">
            Lupa kata sandi?
          </a>
        </div>

        {state?.error && (
          <p className="text-xs text-destructive font-bold mt-1" role="alert">
            {state.error}
          </p>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full py-5 rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-md active:scale-95 transition-all cursor-pointer mt-2"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Memproses...
            </span>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-3 text-[10px] font-bold text-muted-foreground uppercase">
          Atau masuk dengan
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Google Sign In */}
      <form action={loginWithGoogle}>
        <Button
          type="submit"
          variant="outline"
          className="w-full py-5 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
      </form>

      {/* Register link */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        Belum punya akun?{" "}
        <Link href="/register" className="font-bold text-primary hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
