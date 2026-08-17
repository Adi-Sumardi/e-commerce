import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { StorefrontSessionProvider } from "@/components/storefront/storefront-session-provider";
import { AuthToast } from "@/components/shared/auth-toast";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { FloatingWhatsapp } from "@/components/shared/floating-whatsapp";
import { AnalyticsScripts } from "@/components/shared/analytics-scripts";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Belanja Online Terpercaya`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Belanja Online Terpercaya`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
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
      <head>
        <AnalyticsScripts />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StorefrontSessionProvider>
          {children}
          <FloatingWhatsapp />
          <Toaster position="top-center" richColors />
          <Suspense fallback={null}>
            <AuthToast />
          </Suspense>
        </StorefrontSessionProvider>
      </body>
    </html>
  );
}
