"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload-client";

interface FileUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  isVideo?: boolean;
}

export function FileUploadInput({
  value,
  onChange,
  label = "Upload Gambar",
  accept = "image/png,image/jpeg,image/webp",
  isVideo = false,
}: FileUploadInputProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
      toast.success("File berhasil diupload.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal upload file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <div className="relative size-32 overflow-hidden rounded-lg border border-border bg-muted">
          {isVideo ? (
            <video src={value} className="size-full object-cover" muted loop autoPlay playsInline />
          ) : (
            <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
          )}
        </div>
      )}
      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted">
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {value ? "Ganti File" : label}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
