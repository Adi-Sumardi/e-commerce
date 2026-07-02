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
  const idPrefix = mode === "create" ? "new-wh" : `edit-wh-${initialValues?.code}`;

  function handleSubmit(formData: FormData) {
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
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-province`}>Provinsi</Label>
              <Input id={`${idPrefix}-province`} name="province" defaultValue={initialValues?.province} required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-city`}>Kota</Label>
              <Input id={`${idPrefix}-city`} name="city" defaultValue={initialValues?.city} required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-district`}>Kecamatan</Label>
              <Input id={`${idPrefix}-district`} name="district" defaultValue={initialValues?.district} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-postalCode`}>Kode Pos</Label>
              <Input id={`${idPrefix}-postalCode`} name="postalCode" defaultValue={initialValues?.postalCode} required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-biteshipAreaId`}>Biteship Area ID (opsional)</Label>
              <Input
                id={`${idPrefix}-biteshipAreaId`}
                name="biteshipAreaId"
                placeholder="loc-12345"
                defaultValue={initialValues?.biteshipAreaId ?? ""}
              />
            </div>
          </div>
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
