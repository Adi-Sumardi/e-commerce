import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, MapPin } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SiteHeader, BottomNavBar } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { AddressManager } from "./address-manager";

export default async function AddressesPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 pb-24 lg:px-8">
        <Link href="/account" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Kembali ke Akun Saya
        </Link>

        <h1 className="mb-6 flex items-center gap-2 text-xl font-bold">
          <MapPin className="size-5 text-primary" />
          Kelola Alamat
        </h1>

        <AddressManager
          addresses={addresses.map((a) => ({
            id: a.id,
            label: a.label,
            recipientName: a.recipientName,
            phone: a.phone,
            province: a.province,
            city: a.city,
            district: a.district,
            postalCode: a.postalCode,
            fullAddress: a.fullAddress,
            biteshipAreaId: a.biteshipAreaId,
            isDefault: a.isDefault,
          }))}
        />
      </main>

      <SiteFooter />
      <BottomNavBar />
    </div>
  );
}
