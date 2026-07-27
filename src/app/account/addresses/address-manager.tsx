"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Home, MapPin, Phone, Pencil, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { AddressForm } from "./address-form";
import { deleteAddressAction, setDefaultAddressAction } from "./actions";

interface AddressItem {
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
  isDefault: boolean;
}

export function AddressManager({ addresses }: { addresses: AddressItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"idle" | "add" | { edit: string }>("idle");

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultAddressAction(id);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Alamat utama berhasil diperbarui.");
      router.refresh();
    });
  }

  if (mode === "add") {
    return <AddressForm onDone={() => setMode("idle")} />;
  }

  if (typeof mode === "object") {
    const editing = addresses.find((a) => a.id === mode.edit);
    if (editing) {
      return <AddressForm address={editing} onDone={() => setMode("idle")} />;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setMode("add")} size="sm" className="gap-1.5 cursor-pointer">
          <Plus className="size-3.5" />
          Tambah Alamat
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-10 text-center">
          <MapPin className="mb-2 size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Belum ada alamat tersimpan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
              <Home className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{addr.label}</p>
                  {addr.isDefault && <Badge className="h-4 px-1.5 text-[10px]">Utama</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{addr.recipientName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {addr.fullAddress}, {addr.district}, {addr.city}, {addr.province} {addr.postalCode}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="size-3" />
                  {addr.phone}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {!addr.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs cursor-pointer"
                      disabled={isPending}
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      <Star className="size-3" />
                      Jadikan Utama
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs cursor-pointer"
                    onClick={() => setMode({ edit: addr.id })}
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Button>
                  <ConfirmDeleteButton
                    confirmMessage={`Hapus alamat "${addr.label}"?`}
                    action={() => deleteAddressAction(addr.id)}
                    successMessage="Alamat berhasil dihapus."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
