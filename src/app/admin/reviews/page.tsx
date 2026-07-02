import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { StarRating } from "@/components/shared/star-rating";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteReviewAction } from "./actions";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const reviews = await db.review.findMany({
    include: { user: true, product: { select: { slug: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminTopbar />
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Moderasi Ulasan</h1>
          <p className="text-sm text-muted-foreground">
            {reviews.length} ulasan dari customer — hapus ulasan yang tidak pantas/spam
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Produk</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead>Komentar</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="font-medium">Belum ada ulasan</p>
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <Link
                        href={`/products/${review.product.slug}`}
                        target="_blank"
                        className="text-sm font-semibold text-primary hover:underline line-clamp-1"
                      >
                        {review.product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{review.user.name}</TableCell>
                    <TableCell className="text-center">
                      <StarRating rating={review.rating} size="sm" />
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground line-clamp-2">
                      {review.comment || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <ConfirmDeleteButton
                        confirmMessage="Hapus ulasan ini?"
                        successMessage="Ulasan berhasil dihapus."
                        action={deleteReviewAction.bind(null, review.id)}
                      />
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
