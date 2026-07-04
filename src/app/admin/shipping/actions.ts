"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBiteshipRates } from "@/lib/biteship";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }
}

export async function checkShippingRatesAction(params: {
  originAreaId: string;
  destinationAreaId: string;
  weightGrams: number;
}) {
  await requireSuperAdmin();

  if (!params.originAreaId || !params.destinationAreaId) {
    throw new Error("Asal dan tujuan wajib dipilih dari hasil pencarian area.");
  }
  if (!params.weightGrams || params.weightGrams <= 0) {
    throw new Error("Berat paket wajib diisi.");
  }

  const result = await getBiteshipRates({
    originAreaId: params.originAreaId,
    destinationAreaId: params.destinationAreaId,
    couriers: "jne,jnt,sicepat,anteraja,ninja,sap",
    items: [
      {
        name: "Paket Cek Ongkir",
        value: 10000,
        weight: params.weightGrams,
        quantity: 1,
      },
    ],
  });

  if (!result?.pricing) {
    throw new Error("Biteship tidak mengembalikan data tarif untuk rute ini.");
  }

  return (result.pricing as Array<Record<string, any>>).map((price) => ({
    courierName: price.courier_name,
    courierService: price.courier_service_name ?? price.courier_service,
    duration: price.duration || "-",
    price: Number(price.price),
  }));
}
