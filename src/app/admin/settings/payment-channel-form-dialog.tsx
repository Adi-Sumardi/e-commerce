"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PaymentChannelFormDialogProps {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void>;
  initialValues?: {
    type: "BANK_TRANSFER" | "QRIS_STATIC";
    label: string;
    bankName: string | null;
    accountNumber: string | null;
    accountHolder: string | null;
    qrisImageUrl: string | null;
    instructions: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}

export function PaymentChannelFormDialog({ mode, action, initialValues }: PaymentChannelFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"BANK_TRANSFER" | "QRIS_STATIC">(initialValues?.type ?? "BANK_TRANSFER");
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const idPrefix = mode === "create" ? "new-pc" : `edit-pc-${initialValues?.label}`;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await action(formData);
        toast.success(mode === "create" ? "Metode pembayaran berhasil ditambahkan." : "Metode pembayaran berhasil diperbarui.");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan metode pembayaran.");
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
              Tambah Rekening/QRIS
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
          <DialogTitle>{mode === "create" ? "Tambah Metode Pembayaran Manual" : "Edit Metode Pembayaran"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-type`}>Tipe</Label>
            <select
              id={`${idPrefix}-type`}
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as "BANK_TRANSFER" | "QRIS_STATIC")}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="BANK_TRANSFER">Transfer Bank</option>
              <option value="QRIS_STATIC">QRIS Statis</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-label`}>Label Tampilan</Label>
            <Input
              id={`${idPrefix}-label`}
              name="label"
              placeholder="BCA - Toko Pratama Jaya"
              defaultValue={initialValues?.label}
              required
            />
          </div>

          {type === "BANK_TRANSFER" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`${idPrefix}-bankName`}>Nama Bank</Label>
                  <Input
                    id={`${idPrefix}-bankName`}
                    name="bankName"
                    placeholder="BCA"
                    defaultValue={initialValues?.bankName ?? ""}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`${idPrefix}-accountNumber`}>Nomor Rekening</Label>
                  <Input
                    id={`${idPrefix}-accountNumber`}
                    name="accountNumber"
                    placeholder="1234567890"
                    defaultValue={initialValues?.accountNumber ?? ""}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`${idPrefix}-accountHolder`}>Atas Nama</Label>
                <Input
                  id={`${idPrefix}-accountHolder`}
                  name="accountHolder"
                  placeholder="PT Pratama Jaya Sejahtera"
                  defaultValue={initialValues?.accountHolder ?? ""}
                  required
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-qrisImageUrl`}>URL Gambar QRIS</Label>
              <Input
                id={`${idPrefix}-qrisImageUrl`}
                name="qrisImageUrl"
                placeholder="https://i.imgur.com/xxxx.png"
                defaultValue={initialValues?.qrisImageUrl ?? ""}
                required
              />
              <p className="text-xs text-muted-foreground">
                Ambil dari QR statis merchant (BCA mobile bisnis/GoBiz/DANA Bisnis/ShopeePay merchant), lalu upload
                fotonya ke hosting gambar dan tempel link-nya di sini. Customer akan input nominal transfer secara
                manual saat scan.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-instructions`}>Catatan Tambahan (opsional)</Label>
            <Textarea
              id={`${idPrefix}-instructions`}
              name="instructions"
              rows={2}
              placeholder="Contoh: konfirmasi ke WhatsApp 0812xxxx setelah transfer."
              defaultValue={initialValues?.instructions ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-sortOrder`}>Urutan Tampil</Label>
              <Input
                id={`${idPrefix}-sortOrder`}
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={initialValues?.sortOrder ?? 0}
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id={`${idPrefix}-isActive`}
                name="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked === true)}
              />
              <Label htmlFor={`${idPrefix}-isActive`}>Aktif (muncul di checkout)</Label>
            </div>
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
