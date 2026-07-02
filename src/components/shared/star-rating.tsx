import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
} as const;

export function StarRating({ rating, max = 5, size = "md", className }: StarRatingProps) {
  const rounded = Math.round(rating);
  const starClass = SIZE_CLASSES[size];

  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`Rating ${rating} dari ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            starClass,
            i < rounded ? "fill-secondary text-secondary" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
