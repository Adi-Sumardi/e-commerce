"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "./actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await updateProfileAction({ name: value });
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Profil berhasil diperbarui.");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan profil.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-1">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" required value={value} onChange={(e) => setValue(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Email dipakai untuk login, tidak bisa diubah sendiri.</p>
      </div>

      <div className="flex justify-center pt-2">
        <Button type="submit" disabled={submitting} size="lg" className="min-w-[180px] gap-2 cursor-pointer font-bold">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Simpan
        </Button>
      </div>
    </form>
  );
}
