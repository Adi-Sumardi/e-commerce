import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Shield } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SiteHeader, BottomNavBar } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SecurityForm } from "./security-form";

export default async function SecurityPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const profile = await db.user.findUnique({ where: { id: session.user.id } });
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 pb-24 lg:px-8">
        <Link href="/account" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Kembali ke Akun Saya
        </Link>

        <h1 className="mb-6 flex items-center gap-2 text-xl font-bold">
          <Shield className="size-5 text-primary" />
          Keamanan Akun
        </h1>

        <SecurityForm hasPassword={!!profile.passwordHash} />
      </main>

      <SiteFooter />
      <BottomNavBar />
    </div>
  );
}
