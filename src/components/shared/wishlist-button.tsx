"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleWishlistAction } from "@/app/wishlist/actions";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted: boolean;
  className?: string;
  iconClassName?: string;
}

export function WishlistButton({ productId, initialWishlisted, className, iconClassName }: WishlistButtonProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const next = !wishlisted;
    setWishlisted(next);

    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if ("requiresLogin" in result && result.requiresLogin) {
        setWishlisted(!next);
        toast.error("Harap masuk terlebih dahulu untuk menyimpan wishlist.");
        router.push("/login");
        return;
      }
      if ("wishlisted" in result) {
        setWishlisted(result.wishlisted);
        toast.success(result.wishlisted ? "Ditambahkan ke wishlist." : "Dihapus dari wishlist.");
        window.dispatchEvent(new Event("wishlist:changed"));
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
      aria-pressed={wishlisted}
      className={cn("cursor-pointer transition-transform active:scale-90", className)}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground",
          iconClassName
        )}
      />
    </button>
  );
}
