"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AreaSearchInput } from "@/components/shared/area-search-input";
import { createAddressAction, updateAddressAction } from "./actions";

interface AddressFormProps {
  address?: {
    id: string;
    label: string;
    recipientName: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    postalCode: string;
    fullAddress: string;
    biteshipAreaId: string | null;
  };
  onDone: () => void;
}

export function AddressForm({ address, onDone }: AddressFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [label, setLabel] = useState(address?.label ?? "Rumah");
  const [recipientName, setRecipientName] = useState(address?.recipientName ?? "");
  const [phone, setPhone] = useState(address?.phone ?? "");
  const [province, setProvince] = useState(address?.province ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [district, setDistrict] = useState(address?.district ?? "");
  const [postalCode, setPostalCode] = useState(address?.postalCode ?? "");
  const [fullAddress, setFullAddress] = useState(address?.fullAddress ?? "");
  const [biteshipAreaId, setBiteshipAreaId] = useState(address?.biteshipAreaId ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientName || !phone || !province || !city || !district || !postalCode || !fullAddress) {
      toast.error("Harap isi semua kolom alamat.");
      return;
    }
    if (!biteshipAreaId) {
      toast.error("Harap cari dan pilih kecamatan/kota tujuan dari daftar pencarian.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { label, recipientName, phone, province, city, district, postalCode, fullAddress, biteshipAreaId };
      const result = address
        ? await updateAddressAction(address.id, payload)
        : await createAddressAction(payload);

      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(address ? "Alamat berhasil diperbarui." : "Alamat berhasil ditambahkan.");
      router.refresh();
      onDone();
    } catch {
      toast.error("Gagal menyimpan alamat.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="label">Label Alamat</Label>
          <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Rumah, Kantor, Kos" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="recipient">Nama Penerima</Label>
          <Input id="recipient" required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="phone">No. Telepon / HP</Label>
        <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="081234567890" />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Kecamatan / Kota Tujuan</Label>
        <AreaSearchInput
          onSelect={(area) => {
            setBiteshipAreaId(area.id);
            setProvince(area.administrative_division_level_1_name);
            setCity(area.administrative_division_level_2_name);
            setDistrict(area.administrative_division_level_3_name ?? area.name);
            setPostalCode(String(area.postal_code));
          }}
        />
        {biteshipAreaId && (
          <p className="mt-1 text-xs text-muted-foreground">
            {district}, {city}, {province} {postalCode}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="fullAddress">Alamat Lengkap</Label>
        <textarea
          id="fullAddress"
          required
          rows={3}
          className="w-full rounded-lg border border-border bg-background p-2 text-sm focus:ring-primary"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          placeholder="Jalan, No. Rumah, RT/RW, Blok, Gang"
        />
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Button type="submit" disabled={submitting} size="lg" className="min-w-[160px] gap-2 cursor-pointer font-bold">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Simpan
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onDone} disabled={submitting} className="cursor-pointer">
          Batal
        </Button>
      </div>
    </form>
  );
}
