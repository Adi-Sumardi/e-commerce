"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/app/products/_data";
import { WishlistButton } from "@/components/shared/wishlist-button";

interface ProductGalleryProps {
  images: ProductImage[];
  productId: string;
  initialWishlisted: boolean;
}

export function ProductGallery({ images, productId, initialWishlisted }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];
  const thumbnails = images.slice(1);
  const extraCount = thumbnails.length - 3;

  return (
    <div className="grid h-[500px] grid-cols-4 grid-rows-4 gap-2 lg:h-[600px]">
      <div className="group relative col-span-4 row-span-3 overflow-hidden rounded-xl shadow-sm">
        <Image
          src={active.url}
          alt={active.alt}
          fill
          priority
          unoptimized
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain transition-transform duration-700 group-hover:scale-105"
        />
        <WishlistButton
          productId={productId}
          initialWishlisted={initialWishlisted}
          className="absolute top-4 right-4 rounded-full bg-card/90 p-2 shadow-lg"
          iconClassName="size-5"
        />
      </div>
      {thumbnails.slice(0, 4).map((image, index) => {
        const isLast = index === 3 && extraCount > 0;
        return (
          <button
            key={image.url}
            onClick={() => setActiveIndex(index + 1)}
            className={`relative col-span-1 row-span-1 overflow-hidden rounded-xl transition-opacity ${
              activeIndex === index + 1
                ? "border-2 border-primary"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              unoptimized
              sizes="120px"
              className="object-contain"
            />
            {isLast && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 text-sm font-bold text-white">
                +{extraCount}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
