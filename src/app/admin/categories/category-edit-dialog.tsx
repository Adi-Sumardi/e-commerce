"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateCategoryAction } from "./actions";

interface CategoryEditDialogProps {
  category: { id: string; name: string; parentId: string | null };
  categories: { id: string; name: string }[];
}

export function CategoryEditDialog({ category, categories }: CategoryEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateCategoryAction(category.id, formData);
        toast.success("Kategori berhasil diperbarui.");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal memperbarui kategori.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
            <Pencil className="size-4 text-blue-500" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`edit-name-${category.id}`}>Nama Kategori</Label>
            <Input id={`edit-name-${category.id}`} name="name" defaultValue={category.name} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`edit-parent-${category.id}`}>Sub-kategori dari (opsional)</Label>
            <select
              id={`edit-parent-${category.id}`}
              name="parentId"
              defaultValue={category.parentId ?? ""}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">— Tidak ada (kategori utama) —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
