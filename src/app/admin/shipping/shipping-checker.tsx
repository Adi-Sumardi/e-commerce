"use client";

import { useState, useTransition } from "react";
import { Loader2, PackageSearch, Search, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AreaSearchInput } from "@/components/shared/area-search-input";
import { checkShippingRatesAction } from "./actions";

interface Warehouse {
  id: string;
  name: string;
  city: string;
  biteshipAreaId: string | null;
}

interface RateResult {
  courierName: string;
  courierService: string;
  duration: string;
  price: number;
}

function formatIDR(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function ShippingChecker({ warehouses }: { warehouses: Warehouse[] }) {
  const [isPending, startTransition] = useTransition();
  const [originWarehouseId, setOriginWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [destinationAreaId, setDestinationAreaId] = useState("");
  const [destinationLabel, setDestinationLabel] = useState("");
  const [weightGrams, setWeightGrams] = useState("1000");
  const [results, setResults] = useState<RateResult[] | null>(null);

  const originWarehouse = warehouses.find((w) => w.id === originWarehouseId);

  function handleCheck() {
    if (!originWarehouse?.biteshipAreaId) {
      toast.error("Gudang asal belum punya Biteship Area ID. Lengkapi dulu di menu Data Gudang.");
      return;
    }
    if (!destinationAreaId) {
      toast.error("Cari dan pilih kecamatan/kota tujuan terlebih dahulu.");
      return;
    }
    const weight = parseInt(weightGrams, 10);
    if (!weight || weight <= 0) {
      toast.error("Berat paket wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        const rates = await checkShippingRatesAction({
          originAreaId: originWarehouse.biteshipAreaId!,
          destinationAreaId,
          weightGrams: weight,
        });
        setResults(rates.sort((a, b) => a.price - b.price));
      } catch (error) {
        setResults(null);
        toast.error(error instanceof Error ? error.message : "Gagal mengecek ongkir.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-6 lg:col-span-1">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
          <Search className="size-4 text-primary" />
          Parameter Pengecekan
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="origin">Gudang Asal</Label>
            <select
              id="origin"
              value={originWarehouseId}
              onChange={(e) => setOriginWarehouseId(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.city}
                </option>
              ))}
            </select>
            {originWarehouse && !originWarehouse.biteshipAreaId && (
              <p className="text-xs text-destructive">
                Gudang ini belum punya Biteship Area ID, lengkapi dulu di Data Gudang.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Kecamatan / Kota Tujuan</Label>
            <AreaSearchInput
              onSelect={(area) => {
                setDestinationAreaId(area.id);
                setDestinationLabel(`${area.name}, ${area.administrative_division_level_2_name}`);
              }}
            />
            {destinationLabel && (
              <p className="text-xs text-muted-foreground">Dipilih: {destinationLabel}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="weight">Berat Paket (gram)</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              value={weightGrams}
              onChange={(e) => setWeightGrams(e.target.value)}
            />
          </div>

          <Button onClick={handleCheck} disabled={isPending} className="mt-2 gap-2 cursor-pointer">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
            Cek Ongkir
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
        <h2 className="mb-4 text-base font-semibold">Hasil Tarif Kurir</h2>
        {results === null ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-muted p-12 text-center">
            <PackageSearch className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Pilih gudang asal, cari tujuan, lalu klik &quot;Cek Ongkir&quot; untuk melihat tarif dari Biteship.
            </p>
          </div>
        ) : results.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada tarif kurir yang tersedia untuk rute ini.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
            {results.map((rate, i) => (
              <div key={i} className="flex items-center justify-between gap-4 bg-card p-4 odd:bg-muted/40">
                <div>
                  <p className="font-semibold text-foreground">
                    {rate.courierName} <span className="text-muted-foreground">· {rate.courierService}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Estimasi {rate.duration}</p>
                </div>
                <p className="font-bold text-primary">{formatIDR(rate.price)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
