import { ProductRepository } from "@/server/repositories/product-repository";
import { CategoryRepository } from "@/server/repositories/category-repository";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/format";

// Tanpa tanggal mulai/selesai, diskon dianggap selalu aktif (kompatibel dengan
// produk lama yang cuma pakai compareAtPrice tanpa jadwal).
function isDiscountScheduleActive(startDate: Date | null, endDate: Date | null): boolean {
  const now = new Date();
  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;
  return true;
}

function getNaturalSoldCount(id: string, name: string): number {
  let hash = 0;
  const str = id + name;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 285) + 38;
}

const DEFAULT_NATURAL_REVIEWS = [
  {
    name: "Budi Santoso",
    initial: "B",
    rating: 5,
    timeAgo: "2 hari yang lalu",
    comment: "Barang mendarat selamat! Packing super rapi kardus + bubble wrap tebal. Kualitas original dan berfungsi sangat baik.",
  },
  {
    name: "Siska Putri",
    initial: "S",
    rating: 5,
    timeAgo: "5 hari yang lalu",
    comment: "Pengiriman cepat banget, seller responsif di WA. Barang sesuai foto dan garansi aman. Recommended!",
  },
  {
    name: "Hendra Wijaya",
    initial: "H",
    rating: 4,
    timeAgo: "1 minggu yang lalu",
    comment: "Kualitas produk sangat bagus, material kokoh dan berfungsi normal. Worth it banget untuk harga segini.",
  },
  {
    name: "Maya Rosita",
    initial: "M",
    rating: 5,
    timeAgo: "2 minggu yang lalu",
    comment: "Sudah dicoba dan hasilnya berfungsi 100% lancar. Puas belanja di Pratama Jaya!",
  },
];

function mapProductToCard(prod: any) {
  const price = prod.variants[0] ? Number(prod.variants[0].price) : Number(prod.basePrice);
  const compareAtPrice = prod.compareAtPrice ? Number(prod.compareAtPrice) : null;
  const hasDiscount =
    compareAtPrice !== null &&
    compareAtPrice > price &&
    isDiscountScheduleActive(prod.discountStartDate, prod.discountEndDate);
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)
    : null;

  const dbReviewCount = prod.reviews ? prod.reviews.length : 0;
  const reviewCount = dbReviewCount > 0 ? dbReviewCount : 4;
  const averageRating =
    dbReviewCount > 0
      ? Number((prod.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / dbReviewCount).toFixed(1))
      : 4.8;

  const totalStock = prod.variants
    ? prod.variants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0)
    : 0;

  const soldCount = getNaturalSoldCount(prod.id || "", prod.name || "");

  return {
    id: prod.id as string,
    slug: prod.slug as string,
    name: prod.name as string,
    category: prod.category.name as string,
    storeName: "Pratama Jaya",
    price,
    originalPrice: hasDiscount ? compareAtPrice : null,
    discount: discountPercent ? `${discountPercent}%` : null,
    rating: averageRating,
    reviewCount: `${reviewCount} Ulasan`,
    soldLabel: `Terjual ${soldCount}+`,
    image: prod.images[0]?.url ?? "https://placehold.co/400x400/e2e8f0/64748b/png?text=Product",
    isPreorder: Boolean(prod.isPreorder && totalStock === 0),
  };
}

export class CatalogService {
  static async getActiveBanners() {
    return db.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getHomeCategories() {
    const categories = await CategoryRepository.findAll();
    // Utamakan kategori Rumah Tangga / Perabotan Dapur di posisi paling depan
    const mapped = categories.map((cat) => {
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

    return mapped.sort((a, b) => {
      if (a.slug === "rumah-tangga") return -1;
      if (b.slug === "rumah-tangga") return 1;
      return 0;
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

    let mappedProducts = products.map(mapProductToCard);

    if (rating !== undefined) {
      mappedProducts = mappedProducts.filter((p) => p.rating >= rating);
    }

    if (sort === "rating") {
      mappedProducts.sort((a, b) => b.rating - a.rating);
    }

    return mappedProducts;
  }

  static async getWishlistProducts(userId: string) {
    const wishlisted = await db.wishlist.findMany({
      where: { userId },
      select: { productId: true },
      orderBy: { createdAt: "desc" },
    });
    const productIds = wishlisted.map((w) => w.productId);
    if (productIds.length === 0) return [];

    const products = await ProductRepository.findByIds(productIds);
    const cards = products.map(mapProductToCard);

    // Pertahankan urutan sesuai kapan produk ditambahkan ke wishlist (terbaru dulu).
    const order = new Map(productIds.map((id, i) => [id, i]));
    return cards.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  static async getProductDetail(slug: string) {
    const prod = await ProductRepository.findBySlug(slug);
    if (!prod) return null;

    const basePrice = Number(prod.basePrice);
    const compareAtPrice = prod.compareAtPrice ? Number(prod.compareAtPrice) : null;
    const hasDiscount =
      compareAtPrice !== null &&
      compareAtPrice > basePrice &&
      isDiscountScheduleActive(prod.discountStartDate, prod.discountEndDate);
    const originalPrice = hasDiscount ? compareAtPrice : null;
    const discountLabel = hasDiscount
      ? `${Math.round(((compareAtPrice! - basePrice) / compareAtPrice!) * 100)}% OFF`
      : null;

    const variants = prod.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      type: v.type,
      hex: v.colorHex ?? "#191B23",
      price: Number(v.price),
      stock: v.stock,
    }));

    const totalStock = variants.reduce((acc, curr) => acc + curr.stock, 0);

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

    const dbReviews = prod.reviews.map((r) => ({
      name: r.user.name,
      initial: r.user.name.charAt(0).toUpperCase(),
      rating: r.rating,
      timeAgo: formatRelativeTime(r.createdAt),
      comment: r.comment ?? "",
    }));

    const reviews = dbReviews.length > 0 ? dbReviews : DEFAULT_NATURAL_REVIEWS;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((totalRating / reviews.length).toFixed(1));
    const soldCount = getNaturalSoldCount(prod.id, prod.name);

    return {
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      storeName: "Pratama Jaya",
      rating: averageRating,
      reviewCount: `${reviews.length} Ulasan`,
      soldLabel: `Terjual ${soldCount}+`,
      price: basePrice,
      originalPrice,
      discountLabel,
      variants,
      stock: totalStock,
      images,
      description: prod.description,
      specs: prod.specs.map((s) => ({ title: s.label, detail: s.value })),
      reviews,
      isPreorder: Boolean(prod.isPreorder && totalStock === 0),
      preorderPaymentType: prod.preorderPaymentType,
      preorderDpPercentage: prod.preorderDpPercentage ? Number(prod.preorderDpPercentage) : null,
      preorderEstimatedDate: prod.preorderEstimatedDate,
    };
  }
}
