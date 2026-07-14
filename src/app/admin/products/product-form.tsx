"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { Plus, Trash2, Loader2, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface VariantRow {
  key: string;
  sku: string;
  name: string;
  type: "TEXT" | "COLOR";
  colorHex: string;
  price: string;
  stock: string;
}

interface SpecRow {
  key: string;
  label: string;
  value: string;
}

interface ProductFormProps {
  categories: { id: string; name: string }[];
  action: (formData: FormData) => Promise<{ id: string } | void>;
  submitLabel: string;
  initialValues?: {
    name: string;
    categoryId: string;
    description: string;
    basePrice: number;
    compareAtPrice: number | null;
    weightGrams: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    status: string;
    isPreorder: boolean;
    preorderPaymentType: string | null;
    preorderDpPercentage: number | null;
    preorderEstimatedDate: string | null;
    images: string[];
    variants: {
      sku: string;
      name: string;
      type: "TEXT" | "COLOR";
      colorHex: string | null;
      price: number;
      stock: number;
    }[];
    specs: { label: string; value: string }[];
  };
}

function makeKey() {
  return Math.random().toString(36).slice(2);
}

export function ProductForm({ categories, action, submitLabel, initialValues }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPreorder, setIsPreorder] = useState(initialValues?.isPreorder ?? false);
  const [preorderPaymentType, setPreorderPaymentType] = useState(
    initialValues?.preorderPaymentType ?? "FULL"
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    initialValues?.variants.length
      ? initialValues.variants.map((v) => ({
          key: makeKey(),
          sku: v.sku,
          name: v.name,
          type: v.type,
          colorHex: v.colorHex ?? "#191B23",
          price: String(v.price),
          stock: String(v.stock),
        }))
      : [{ key: makeKey(), sku: "", name: "", type: "TEXT", colorHex: "#191B23", price: "", stock: "" }]
  );

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { key: makeKey(), sku: "", name: "", type: "TEXT", colorHex: "#191B23", price: "", stock: "" },
    ]);
  }

  function removeVariant(key: string) {
    setVariants((prev) => (prev.length > 1 ? prev.filter((v) => v.key !== key) : prev));
  }

  function updateVariant(key: string, field: keyof VariantRow, value: string) {
    setVariants((prev) =>
      prev.map((v) => (v.key === key ? ({ ...v, [field]: value } as VariantRow) : v))
    );
  }

  const [specs, setSpecs] = useState<SpecRow[]>(
    initialValues?.specs.length
      ? initialValues.specs.map((s) => ({ key: makeKey(), label: s.label, value: s.value }))
      : []
  );

  function addSpec() {
    setSpecs((prev) => [...prev, { key: makeKey(), label: "", value: "" }]);
  }

  function removeSpec(key: string) {
    setSpecs((prev) => prev.filter((s) => s.key !== key));
  }

  function updateSpec(key: string, field: "label" | "value", value: string) {
    setSpecs((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
  }

  const [images, setImages] = useState<string[]>(initialValues?.images ?? []);
  const [uploadingImages, setUploadingImages] = useState(false);

  async function handleImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal upload gambar.");
        uploaded.push(data.url);
      }
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} gambar berhasil diupload.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal upload gambar.");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  function handleSubmit(formData: FormData) {
    if (images.length === 0) {
      toast.error("Upload minimal satu gambar produk.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await action(formData);
        toast.success("Produk berhasil disimpan.");
        if (result?.id) {
          router.push(`/admin/products/${result.id}/edit`);
        } else {
          router.refresh();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan produk.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-semibold">Informasi Dasar</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" name="name" defaultValue={initialValues?.name} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="categoryId">Kategori</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={initialValues?.categoryId ?? ""}
              required
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={initialValues?.status ?? "DRAFT"}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Aktif (Published)</option>
              <option value="ARCHIVED">Arsip</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialValues?.description}
              required
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-semibold">Harga & Diskon</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="basePrice">Harga Jual (Rp)</Label>
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              min={0}
              defaultValue={initialValues?.basePrice}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="compareAtPrice">Harga Coret / Sebelum Diskon (Rp, opsional)</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              min={0}
              placeholder="Kosongkan jika tidak diskon"
              defaultValue={initialValues?.compareAtPrice ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Isi lebih besar dari Harga Jual supaya badge diskon otomatis muncul di storefront.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-semibold">Berat & Dimensi (untuk kalkulasi ongkir)</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="weightGrams">Berat (gram)</Label>
            <Input id="weightGrams" name="weightGrams" type="number" min={0} defaultValue={initialValues?.weightGrams ?? 100} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="lengthCm">Panjang (cm)</Label>
            <Input id="lengthCm" name="lengthCm" type="number" min={0} defaultValue={initialValues?.lengthCm ?? 10} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="widthCm">Lebar (cm)</Label>
            <Input id="widthCm" name="widthCm" type="number" min={0} defaultValue={initialValues?.widthCm ?? 10} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="heightCm">Tinggi (cm)</Label>
            <Input id="heightCm" name="heightCm" type="number" min={0} defaultValue={initialValues?.heightCm ?? 10} required />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-preorder/30 bg-preorder/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            id="isPreorder"
            name="isPreorder"
            checked={isPreorder}
            onCheckedChange={(checked) => setIsPreorder(checked === true)}
            className="border-preorder/50 bg-background"
          />
          <Label htmlFor="isPreorder" className="text-base font-semibold text-preorder">
            Produk ini Pre-Order
          </Label>
        </div>

        {isPreorder && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="preorderPaymentType">Skema Pembayaran</Label>
              <select
                id="preorderPaymentType"
                name="preorderPaymentType"
                value={preorderPaymentType}
                onChange={(e) => setPreorderPaymentType(e.target.value)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="FULL">Bayar Penuh di Muka</option>
                <option value="DOWN_PAYMENT">DP (Uang Muka)</option>
              </select>
            </div>
            {preorderPaymentType === "DOWN_PAYMENT" && (
              <div className="flex flex-col gap-1">
                <Label htmlFor="preorderDpPercentage">Persentase DP (%)</Label>
                <Input
                  id="preorderDpPercentage"
                  name="preorderDpPercentage"
                  type="number"
                  min={1}
                  max={99}
                  defaultValue={initialValues?.preorderDpPercentage ?? 30}
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <Label htmlFor="preorderEstimatedDate">Estimasi Tanggal Kirim</Label>
              <Input
                id="preorderEstimatedDate"
                name="preorderEstimatedDate"
                type="date"
                defaultValue={initialValues?.preorderEstimatedDate ?? ""}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-2 text-base font-semibold">Gambar Produk</h2>
        <p className="mb-3 text-xs text-muted-foreground">Upload satu atau beberapa gambar. Gambar pertama jadi foto utama.</p>
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative size-24 overflow-hidden rounded-lg border border-border bg-muted">
                <NextImage src={url} alt={`Gambar ${i + 1}`} fill unoptimized className="object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-primary/80 py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
                    Utama
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white cursor-pointer hover:bg-black/80"
                  aria-label="Hapus gambar"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted">
          {uploadingImages ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Upload Gambar
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={handleImageFiles}
            disabled={uploadingImages}
          />
        </label>
        <input type="hidden" name="images" value={images.join("\n")} readOnly />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Varian Produk</h2>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={addVariant}>
            <Plus className="size-3.5" />
            Tambah Varian
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {variants.map((v) => (
            <div key={v.key} className="flex flex-col gap-2 rounded-lg border border-border/60 p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Tipe Varian</Label>
                  <select
                    name="variant_type"
                    value={v.type}
                    onChange={(e) => updateVariant(v.key, "type", e.target.value)}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  >
                    <option value="TEXT">Teks / Nama</option>
                    <option value="COLOR">Warna</option>
                  </select>
                </div>
                {v.type === "COLOR" ? (
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Warna</Label>
                    <div className="flex h-10 items-center gap-2">
                      <input
                        type="color"
                        name="variant_color_hex"
                        value={v.colorHex}
                        onChange={(e) => updateVariant(v.key, "colorHex", e.target.value)}
                        className="size-10 shrink-0 cursor-pointer rounded-md border border-border bg-background p-1"
                      />
                      <Input
                        value={v.colorHex}
                        onChange={(e) => updateVariant(v.key, "colorHex", e.target.value)}
                        placeholder="#191B23"
                        className="font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <input type="hidden" name="variant_color_hex" value={v.colorHex} readOnly />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">SKU</Label>
                  <Input
                    name="variant_sku"
                    value={v.sku}
                    onChange={(e) => updateVariant(v.key, "sku", e.target.value)}
                    placeholder="SKU-001"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Nama Varian</Label>
                  <Input
                    name="variant_name"
                    value={v.name}
                    onChange={(e) => updateVariant(v.key, "name", e.target.value)}
                    placeholder="Hitam / L"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Harga (Rp)</Label>
                  <Input
                    name="variant_price"
                    type="number"
                    min={0}
                    value={v.price}
                    onChange={(e) => updateVariant(v.key, "price", e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Stok</Label>
                  <Input
                    name="variant_stock"
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={(e) => updateVariant(v.key, "stock", e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-destructive hover:bg-destructive/10"
                    onClick={() => removeVariant(v.key)}
                    disabled={variants.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold">Spesifikasi Produk</h2>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={addSpec}>
            <Plus className="size-3.5" />
            Tambah Spesifikasi
          </Button>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Opsional. Tampil di tab &quot;Spesifikasi&quot; halaman produk (mis. Bahan: Katun, Berat: 250g).
        </p>
        {specs.length > 0 && (
          <div className="flex flex-col gap-3">
            {specs.map((s) => (
              <div key={s.key} className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 p-3 sm:grid-cols-[1fr_1fr_auto]">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Nama Spesifikasi</Label>
                  <Input
                    name="spec_label"
                    value={s.label}
                    onChange={(e) => updateSpec(s.key, "label", e.target.value)}
                    placeholder="Bahan"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Nilai</Label>
                  <Input
                    name="spec_value"
                    value={s.value}
                    onChange={(e) => updateSpec(s.key, "value", e.target.value)}
                    placeholder="Katun 100%"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-destructive hover:bg-destructive/10"
                    onClick={() => removeSpec(s.key)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="gap-2 cursor-pointer">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
