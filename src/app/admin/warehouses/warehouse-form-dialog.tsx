"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AreaSearchInput } from "@/components/shared/area-search-input";

interface WarehouseFormDialogProps {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void>;
  initialValues?: {
    name: string;
    code: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    postalCode: string;
    fullAddress: string;
    biteshipAreaId: string | null;
    isActive: boolean;
  };
}

export function WarehouseFormDialog({ mode, action, initialValues }: WarehouseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [province, setProvince] = useState(initialValues?.province ?? "");
  const [city, setCity] = useState(initialValues?.city ?? "");
  const [district, setDistrict] = useState(initialValues?.district ?? "");
  const [postalCode, setPostalCode] = useState(initialValues?.postalCode ?? "");
  const [biteshipAreaId, setBiteshipAreaId] = useState(initialValues?.biteshipAreaId ?? "");
  const idPrefix = mode === "create" ? "new-wh" : `edit-wh-${initialValues?.code}`;

  function handleSubmit(formData: FormData) {
    if (!province || !city || !district || !postalCode) {
      toast.error("Cari dan pilih kecamatan/kota gudang terlebih dahulu.");
      return;
    }
    startTransition(async () => {
      try {
        await action(formData);
        toast.success(mode === "create" ? "Gudang berhasil dibuat." : "Gudang berhasil diperbarui.");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan data gudang.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "create" ? (
            <Button className="gap-2 cursor-pointer">
              <Plus className="size-4" />
              Tambah Gudang
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
              <Pencil className="size-4 text-blue-500" />
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah Data Gudang" : "Edit Data Gudang"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-name`}>Nama Gudang</Label>
              <Input id={`${idPrefix}-name`} name="name" placeholder="Gudang Utama Jakarta" defaultValue={initialValues?.name} required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-code`}>Kode Gudang</Label>
              <Input id={`${idPrefix}-code`} name="code" placeholder="WH-JKT-01" className="uppercase" defaultValue={initialValues?.code} required />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-phone`}>Telepon PIC Gudang</Label>
            <Input id={`${idPrefix}-phone`} name="phone" placeholder="021-1234567" defaultValue={initialValues?.phone} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Kecamatan / Kota Gudang</Label>
            <AreaSearchInput
              onSelect={(area) => {
                setBiteshipAreaId(area.id);
                setProvince(area.administrative_division_level_1_name);
                setCity(area.administrative_division_level_2_name);
                setDistrict(area.administrative_division_level_3_name ?? area.name);
                setPostalCode(String(area.postal_code));
              }}
            />
            <p className="text-xs text-muted-foreground">
              Cari dan pilih lokasi supaya Biteship Area ID terisi otomatis (dipakai untuk cek ongkir & booking kurir).
            </p>
          </div>
          {biteshipAreaId && (
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Provinsi</p>
                <p className="font-semibold">{province}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kota/Kabupaten</p>
                <p className="font-semibold">{city}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kode Pos</p>
                <p className="font-semibold">{postalCode}</p>
              </div>
            </div>
          )}
          <input type="hidden" name="province" value={province} />
          <input type="hidden" name="city" value={city} />
          <input type="hidden" name="district" value={district} />
          <input type="hidden" name="postalCode" value={postalCode} />
          <input type="hidden" name="biteshipAreaId" value={biteshipAreaId} />
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-fullAddress`}>Alamat Lengkap</Label>
            <Input id={`${idPrefix}-fullAddress`} name="fullAddress" defaultValue={initialValues?.fullAddress} required />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${idPrefix}-isActive`}
              name="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor={`${idPrefix}-isActive`}>Gudang aktif (bisa menerima order)</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
