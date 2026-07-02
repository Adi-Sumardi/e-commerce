import { redirect } from "next/navigation";
import { Boxes, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createCategoryAction, deleteCategoryAction } from "./actions";
import { CategoryEditDialog } from "./category-edit-dialog";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const categories = await db.category.findMany({
    include: { parent: true, _count: { select: { products: true, children: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Kategori</h1>
            <p className="text-sm text-muted-foreground">
              {categories.length} kategori terdaftar
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Plus className="size-4 text-primary" />
            Tambah Kategori Baru
          </h2>
          <form action={createCategoryAction} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="cat-name">Nama Kategori</Label>
              <Input id="cat-name" name="name" placeholder="Elektronik" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cat-parent">Sub-kategori dari (opsional)</Label>
              <select
                id="cat-parent"
                name="parentId"
                defaultValue=""
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
            <div className="flex items-end">
              <Button type="submit" className="w-full gap-2 cursor-pointer sm:w-auto">
                <Plus className="size-4" />
                Buat Kategori
              </Button>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Induk</TableHead>
                <TableHead className="text-center">Produk</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                    <Boxes className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="font-medium">Belum ada kategori</p>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-semibold text-sm">{cat.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cat.parent?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {cat._count.products}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <CategoryEditDialog
                          category={{ id: cat.id, name: cat.name, parentId: cat.parentId }}
                          categories={categories
                            .filter((c) => c.id !== cat.id)
                            .map((c) => ({ id: c.id, name: c.name }))}
                        />
                        <ConfirmDeleteButton
                          confirmMessage={`Hapus kategori "${cat.name}"?`}
                          successMessage="Kategori berhasil dihapus."
                          action={deleteCategoryAction.bind(null, cat.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
