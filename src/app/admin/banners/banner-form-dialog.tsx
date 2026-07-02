"use client";

import { useState, useTransition } from "react";
import { Info, Pencil, Plus } from "lucide-react";
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

interface BannerFormDialogProps {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void>;
  initialValues?: {
    badgeText: string | null;
    title: string;
    subtitle: string | null;
    imageUrl: string;
    ctaLabel: string | null;
    ctaLink: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}

export function BannerFormDialog({ mode, action, initialValues }: BannerFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await action(formData);
        toast.success(mode === "create" ? "Banner berhasil dibuat." : "Banner berhasil diperbarui.");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan banner.");
      }
    });
  }

  const idPrefix = mode === "create" ? "new" : "edit";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "create" ? (
            <Button className="gap-2 cursor-pointer">
              <Plus className="size-4" />
              Tambah Banner
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
          <DialogTitle>{mode === "create" ? "Tambah Banner Baru" : "Edit Banner"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-badgeText`}>Badge Text (opsional)</Label>
            <Input
              id={`${idPrefix}-badgeText`}
              name="badgeText"
              placeholder="Flash Sale Juli"
              defaultValue={initialValues?.badgeText ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-title`}>Judul</Label>
            <Input
              id={`${idPrefix}-title`}
              name="title"
              placeholder="Diskon Hingga 70% Audio Premium"
              defaultValue={initialValues?.title}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-subtitle`}>Subjudul (opsional)</Label>
            <Input
              id={`${idPrefix}-subtitle`}
              name="subtitle"
              placeholder="Gratis ongkir se-Indonesia!"
              defaultValue={initialValues?.subtitle ?? ""}
            />
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Spesifikasi Gambar (desain di Canva, lalu upload/hosting & tempel link-nya di sini)</p>
              <p>
                <strong className="text-foreground">Banner Utama</strong> (urutan 0): ukuran{" "}
                <strong className="text-foreground">1200 × 545 px</strong> (rasio 2.2:1). Cari template Canva
                &ldquo;Custom size&rdquo; dengan ukuran ini.
              </p>
              <p>
                <strong className="text-foreground">Banner Samping</strong> (urutan 1 &amp; 2): ukuran{" "}
                <strong className="text-foreground">600 × 270 px</strong> (rasio 2.2:1 juga, cuma lebih kecil).
              </p>
              <p>Format JPG/PNG/WebP, maksimal ±500KB. Teks penting taruh di area kiri/tengah (bagian kanan gambar akan sedikit tertutup gradasi gelap).</p>
              <p>
                Setelah export dari Canva, upload ke layanan hosting gambar (mis. imgur.com, atau Cloudinary/S3 kalau sudah
                dikonfigurasi), lalu tempel URL gambarnya ke kolom di bawah ini.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-imageUrl`}>URL Gambar</Label>
            <Input
              id={`${idPrefix}-imageUrl`}
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
              defaultValue={initialValues?.imageUrl}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-ctaLabel`}>Label Tombol (opsional)</Label>
              <Input
                id={`${idPrefix}-ctaLabel`}
                name="ctaLabel"
                placeholder="Belanja Sekarang"
                defaultValue={initialValues?.ctaLabel ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${idPrefix}-ctaLink`}>Link Tujuan</Label>
              <Input
                id={`${idPrefix}-ctaLink`}
                name="ctaLink"
                placeholder="/products?category=elektronik"
                defaultValue={initialValues?.ctaLink ?? ""}
              />
            </div>
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
              <Label htmlFor={`${idPrefix}-isActive`}>Aktif tampil di storefront</Label>
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
