import { redirect } from "next/navigation";
import Image from "next/image";
import { GalleryHorizontal } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createBannerAction, updateBannerAction, deleteBannerAction } from "./actions";
import { BannerFormDialog } from "./banner-form-dialog";

export default async function AdminBannersPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const banners = await db.banner.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Banner Homepage</h1>
            <p className="text-sm text-muted-foreground">
              {banners.length} banner terdaftar — banner pertama (urutan terkecil) jadi banner utama
            </p>
          </div>
          <BannerFormDialog mode="create" action={createBannerAction} />
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-20">Preview</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead className="text-center">Urutan</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                    <GalleryHorizontal className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="font-medium">Belum ada banner</p>
                    <p className="text-sm">Homepage akan menampilkan section tanpa banner promo</p>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="relative size-14 overflow-hidden rounded-lg border border-border bg-muted">
                        <Image src={banner.imageUrl} alt={banner.title} fill sizes="56px" className="object-cover" unoptimized />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm">{banner.title}</p>
                        {banner.videoUrl && (
                          <Badge variant="outline" className="text-[10px]">Video</Badge>
                        )}
                      </div>
                      {banner.subtitle && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{banner.subtitle}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">{banner.sortOrder}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={banner.isActive ? "default" : "secondary"} className="text-xs">
                        {banner.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <BannerFormDialog
                          mode="edit"
                          action={updateBannerAction.bind(null, banner.id)}
                          initialValues={{
                            badgeText: banner.badgeText,
                            title: banner.title,
                            subtitle: banner.subtitle,
                            imageUrl: banner.imageUrl,
                            videoUrl: banner.videoUrl,
                            ctaLabel: banner.ctaLabel,
                            ctaLink: banner.ctaLink,
                            sortOrder: banner.sortOrder,
                            isActive: banner.isActive,
                          }}
                        />
                        <ConfirmDeleteButton
                          confirmMessage={`Hapus banner "${banner.title}"?`}
                          successMessage="Banner berhasil dihapus."
                          action={deleteBannerAction.bind(null, banner.id)}
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
