"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateStoreSettingsAction } from "./store-settings-actions";

interface StoreSettingsFormProps {
  initialValues: {
    name: string;
    email: string;
    description: string;
    phone: string;
    whatsapp: string;
  };
}

export function StoreSettingsForm({ initialValues }: StoreSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateStoreSettingsAction(formData);
        toast.success("Informasi toko berhasil disimpan.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan informasi toko.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="store-name">Nama Toko</Label>
          <Input id="store-name" name="name" defaultValue={initialValues.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="store-email">Email Toko</Label>
          <Input id="store-email" name="email" type="email" defaultValue={initialValues.email} required />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="store-desc">Deskripsi Toko</Label>
          <Textarea
            id="store-desc"
            name="description"
            defaultValue={initialValues.description}
            rows={3}
            required
            className="resize-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="store-phone">Nomor Telepon</Label>
          <Input id="store-phone" name="phone" defaultValue={initialValues.phone} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="store-wa">WhatsApp</Label>
          <Input id="store-wa" name="whatsapp" defaultValue={initialValues.whatsapp} required />
        </div>
      </div>
      <div className="flex justify-center pt-2 border-t border-border">
        <Button type="submit" disabled={isPending} size="lg" className="min-w-[200px] cursor-pointer font-bold">
          Simpan Perubahan
        </Button>
      </div>
    </form>
  );
}
