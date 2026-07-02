import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { StorefrontSessionProvider } from "@/components/storefront/storefront-session-provider";
import { AuthToast } from "@/components/shared/auth-toast";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pratama Jaya | Belanja Online Terpercaya",
  description: "Toko online lengkap dengan pembayaran Xendit & pengiriman Biteship.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pratama Jaya",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StorefrontSessionProvider>
          {children}
          <Toaster position="top-center" richColors />
          <Suspense fallback={null}>
            <AuthToast />
          </Suspense>
        </StorefrontSessionProvider>
      </body>
    </html>
  );
}

