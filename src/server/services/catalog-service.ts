import { ProductRepository } from "@/server/repositories/product-repository";
import { CategoryRepository } from "@/server/repositories/category-repository";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/format";

export class CatalogService {
  static async getActiveBanners() {
    return db.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getHomeCategories() {
    const categories = await CategoryRepository.findAll();
    // Map icons based on category slug/name
    return categories.map((cat) => {
      let icon: "laptop" | "shirt" | "chair" | "sparkles" | "gamepad" | "shopping-basket" = "shopping-basket";
      if (cat.slug === "elektronik") icon = "laptop";
      else if (cat.slug === "fashion") icon = "shirt";
      else if (cat.slug === "rumah-tangga") icon = "chair";
      else if (cat.slug === "kecantikan") icon = "sparkles";
      else if (cat.slug === "hobi-gaming") icon = "gamepad";

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon,
      };
    });
  }

  static async getBestSellers(
    optionsOrCategory?: string | {
      categorySlug?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      rating?: number;
      sort?: string;
    }
  ) {
    let categorySlug: string | undefined;
    let search: string | undefined;
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    let rating: number | undefined;
    let sort: string | undefined;

    if (typeof optionsOrCategory === "string") {
      categorySlug = optionsOrCategory;
    } else if (optionsOrCategory && typeof optionsOrCategory === "object") {
      categorySlug = optionsOrCategory.categorySlug;
      search = optionsOrCategory.search;
      minPrice = optionsOrCategory.minPrice;
      maxPrice = optionsOrCategory.maxPrice;
      rating = optionsOrCategory.rating;
      sort = optionsOrCategory.sort;
    }

    const limit = (rating || sort === "rating") ? 100 : 40;

    const products = await ProductRepository.findPublished({
      limit,
      categorySlug,
      search,
      minPrice,
      maxPrice,
      sort,
    });

    let mappedProducts = products.map((prod) => {
      const price = prod.variants[0] ? Number(prod.variants[0].price) : Number(prod.basePrice);
      const compareAtPrice = prod.compareAtPrice ? Number(prod.compareAtPrice) : null;
      const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
      const discountPercent = hasDiscount
        ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)
        : null;

      const reviewCount = prod.reviews.length;
      const averageRating =
        reviewCount > 0
          ? Number((prod.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
          : 0;

      return {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        category: prod.category.name,
        storeName: "Pratama Jaya",
        price,
        originalPrice: hasDiscount ? compareAtPrice : null,
        discount: discountPercent ? `${discountPercent}%` : null,
        rating: averageRating,
        reviewCount: reviewCount > 0 ? `${reviewCount} Ulasan` : "Belum ada ulasan",
        soldLabel: "Produk Tersedia",
        image: prod.images[0]?.url ?? "https://placehold.co/400x400/e2e8f0/64748b/png?text=Product",
        isPreorder: prod.isPreorder,
      };
    });

    if (rating !== undefined) {
      mappedProducts = mappedProducts.filter((p) => p.rating >= rating);
    }

    if (sort === "rating") {
      mappedProducts.sort((a, b) => b.rating - a.rating);
    }

    return mappedProducts;
  }

  static async getProductDetail(slug: string) {
    const prod = await ProductRepository.findBySlug(slug);
    if (!prod) return null;

    const basePrice = Number(prod.basePrice);
    const compareAtPrice = prod.compareAtPrice ? Number(prod.compareAtPrice) : null;
    const hasDiscount = compareAtPrice !== null && compareAtPrice > basePrice;
    const originalPrice = hasDiscount ? compareAtPrice : null;
    const discountLabel = hasDiscount
      ? `${Math.round(((compareAtPrice! - basePrice) / compareAtPrice!) * 100)}% OFF`
      : null;

    // Format colors from variants or default if empty
    const colors = prod.variants.map((v) => {
      let hex = "#191B23";
      if (v.name.toLowerCase().includes("silver") || v.name.toLowerCase().includes("white")) {
        hex = "#E2E8F0";
      } else if (v.name.toLowerCase().includes("blue")) {
        hex = "#2563eb";
      } else if (v.name.toLowerCase().includes("sand")) {
        hex = "#d2b48c";
      }
      return {
        id: v.id,
        sku: v.sku,
        name: v.name,
        hex,
        price: Number(v.price),
        stock: v.stock,
      };
    });

    const totalStock = colors.reduce((acc, curr) => acc + curr.stock, 0);

    const images = prod.images.map((img) => ({
      url: img.url,
      alt: `Foto produk ${prod.name}`,
    }));

    if (images.length === 0) {
      images.push({
        url: "https://placehold.co/800x800/191b23/ffffff/png?text=Product+Image",
        alt: `Foto placeholder produk ${prod.name}`,
      });
    }

    const reviews = prod.reviews.map((r) => ({
      name: r.user.name,
      initial: r.user.name.charAt(0).toUpperCase(),
      rating: r.rating,
      timeAgo: formatRelativeTime(r.createdAt),
      comment: r.comment ?? "",
    }));

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

    return {
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      storeName: "Pratama Jaya",
      rating: averageRating,
      reviewCount: reviews.length > 0 ? `${reviews.length} Ulasan` : "Belum ada ulasan",
      soldLabel: "Produk Tersedia",
      price: basePrice,
      originalPrice,
      discountLabel,
      colors,
      stock: totalStock,
      images,
      description: prod.description,
      specs: [
        { icon: "battery" as const, title: "Daya Tahan", detail: "Penggunaan optimal sepanjang hari." },
        { icon: "bluetooth" as const, title: "Konektivitas", detail: "Mendukung koneksi nirkabel stabil." },
      ],
      reviews,
      isPreorder: prod.isPreorder,
      preorderPaymentType: prod.preorderPaymentType,
      preorderDpPercentage: prod.preorderDpPercentage ? Number(prod.preorderDpPercentage) : null,
      preorderEstimatedDate: prod.preorderEstimatedDate,
    };
  }
}
