"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addReviewAction } from "@/app/products/actions";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  productId: string;
  isAuthenticated: boolean;
}

export function ReviewForm({ productId, isAuthenticated }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Anda harus masuk akun terlebih dahulu untuk menulis ulasan produk.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Silakan berikan rating 1-5 bintang.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addReviewAction(productId, rating, comment);
      if (res.success) {
        toast.success("Ulasan Anda berhasil dikirim!");
        setComment("");
        setRating(5);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengirim ulasan.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold text-foreground">Tulis Ulasan Produk</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Bagikan pengalaman Anda menggunakan produk ini.</p>
      </div>

      {/* Star Rating Select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground">Rating Bintang</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = hoverRating !== null ? star <= hoverRating : star <= rating;
            return (
              <button
                key={star}
                type="button"
                className="p-1 cursor-pointer transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                aria-label={`Beri rating ${star} bintang`}
              >
                <Star
                  className={`size-6 ${
                    isFilled ? "fill-secondary text-secondary" : "text-muted-foreground/30"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment Input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-comment" className="text-xs font-bold text-muted-foreground">
          Komentar Ulasan
        </label>
        <textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tulis ulasan lengkap Anda di sini..."
          className="w-full rounded-lg border border-border bg-background p-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
          required
        />
      </div>

      <div className="flex justify-center pt-2">
        <Button type="submit" disabled={submitting} size="lg" className="min-w-[180px] font-bold cursor-pointer">
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            "Kirim Ulasan"
          )}
        </Button>
      </div>
    </form>
  );
}
