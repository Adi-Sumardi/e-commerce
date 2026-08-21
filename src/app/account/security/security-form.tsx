"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "./actions";

export function SecurityForm({ hasPassword }: { hasPassword: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await changePasswordAction({ currentPassword, newPassword });
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(hasPassword ? "Password berhasil diubah." : "Password berhasil dibuat.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Gagal menyimpan password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      {!hasPassword && (
        <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Akun ini masuk lewat Google dan belum punya password. Buat password di bawah supaya bisa login
          langsung pakai email juga.
        </p>
      )}

      {hasPassword && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="currentPassword">Password Saat Ini</Label>
          <Input
            id="currentPassword"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <Label htmlFor="newPassword">Password Baru</Label>
        <Input
          id="newPassword"
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
        <Input
          id="confirmPassword"
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="flex justify-center pt-2">
        <Button type="submit" disabled={submitting} size="lg" className="min-w-[180px] gap-2 cursor-pointer font-bold">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {hasPassword ? "Ubah Password" : "Buat Password"}
        </Button>
      </div>
    </form>
  );
}
