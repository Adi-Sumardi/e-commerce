"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";

export function SidebarFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPriceRange = searchParams.get("priceRange") ?? "";
  const currentRating = searchParams.get("rating") ?? "";

  const handlePriceRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentPriceRange === value) {
      params.delete("priceRange");
    } else {
      params.set("priceRange", value);
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleRatingChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentRating === value) {
      params.delete("rating");
    } else {
      params.set("rating", value);
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Rentang Harga */}
      <div>
        <h3 className="mb-4 text-sm font-bold text-foreground">Rentang Harga</h3>
        <div className="space-y-2">
          {[
            { label: "Di bawah Rp 100.000", value: "0-100000" },
            { label: "Rp 100.000 – 500.000", value: "100000-500000" },
            { label: "Rp 500.000 – 1.000.000", value: "500000-1000000" },
            { label: "Di atas Rp 1.000.000", value: "1000000-999999999" },
          ].map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                className="accent-primary cursor-pointer"
                checked={currentPriceRange === opt.value}
                onChange={() => handlePriceRangeChange(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Filter Rating */}
      <div>
        <h3 className="mb-4 text-sm font-bold text-foreground">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                className="accent-primary cursor-pointer"
                checked={currentRating === String(r)}
                onChange={() => handleRatingChange(String(r))}
              />
              <span className="flex items-center gap-1">
                {Array.from({ length: r }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-secondary text-secondary" />
                ))}
                {r < 5 && <span className="text-muted-foreground">ke atas</span>}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
