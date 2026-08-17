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

function getNaturalReviewCount(id: string, name: string): number {
  let hash = 0;
  const str = name + id + "rev_count";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 247) + 4; // Menghasilkan acak natural antara 4 - 250 ulasan
}

function getNaturalRating(id: string, name: string): number {
  let hash = 0;
  const str = id + name + "rev_rating";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const sampleRatings = [4.7, 4.8, 4.8, 4.9, 4.9, 5.0];
  return sampleRatings[Math.abs(hash) % sampleRatings.length];
}

function getNaturalStoreName(id: string, name: string): string {
  let hash = 0;
  const str = id + name + "store_name";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const storeNames = [
    "Pratama Jaya Official",
    "Pratama Jaya Pusat",
    "Pratama Jaya Direct",
    "Pratama Jaya Store",
    "Pratama Jaya Home",
    "Pratama Jaya Jakarta",
    "Pratama Jaya Official Store",
  ];
  return storeNames[Math.abs(hash) % storeNames.length];
}

const CUSTOMER_NAMES = [
  "Wahyu", "Siti", "Rina", "Hendra", "Dewi",
  "Budi", "Agus", "Dimas", "Rizky", "Fajar",
  "Eka", "Fitri", "Bambang", "Ahmad", "Deni",
  "Tika", "Doni", "Erna", "Yuli", "Wawan",
  "Slamet", "Yudi", "Dian", "Rudi", "Tri",
  "Novi", "Toto", "Gita", "Febri", "Imam",
  "Nita", "Supri", "Bayu", "Aris", "Vivi",
  "Endang", "Joko", "Rio", "Eko", "Shinta",
  "Mulyanto", "Hafiz", "Kiki", "Ginanjar", "Gunawan",
  "Lusi", "Agung", "Nuning", "Melly", "Anis",
  "Totok", "Tari", "Tuty", "Dadan", "Mira",
  "Rudianto", "Ayu", "Toni", "Sri", "Indra",
  "Ratna", "Bowo", "Shanti", "Rizal", "Niken",
  "wahyu66", "Siti27", "budi88", "ratna.p", "agus77",
  "hendra_w", "doni_h88", "yuliana88", "kiki2023", "dimas_pras"
];

const CUSTOMER_COMMENTS = [
  "Barang mendarat selamat! Packing super rapi kardus + bubble wrap tebal. Kualitas original dan berfungsi sangat baik.",
  "Pengiriman cepat banget, seller responsif di WA. Barang sesuai foto dan garansi aman. Recommended seller!",
  "Kualitas produk sangat bagus, material kokoh dan berfungsi normal. Worth it banget untuk harga segini.",
  "Sudah dicoba dan hasilnya berfungsi 100% lancar. Pelayanan fast respon di WA, puas belanja di Pratama Jaya!",
  "Produk mantap, original bergaransi resmi. Pengiriman cepat langsung dikirim hari yang sama saat order.",
  "Beli kompor & peralatan rumah tangga di sini rekomended banget. Respon admin ramah dan pengiriman via GoSend sangat cepat.",
  "Barang bagus, nyampe dengan selamat tanpa lecet sedikitpun. Dus mulus dan alat berfungsi normal.",
  "Sudah langganan di Pratama Jaya. Kualitas perabotan dan alat dapur selalu memuaskan!",
  "Barang original 100%, garansi terjamin. Pengemasan sangat rapi dan bubble wrap aman.",
  "Sangat puas dengan barangnya. Nyaman dipakai dan beneran berkualitas. Terima kasih seller!",
  "Fungsi produk sesuai ekspektasi, harga lebih terjangkau dibanding toko lain. Mantap!",
  "Fast response banget admin WA-nya. Langsung dibantu proses kirim sore itu juga.",
  "Sesuai deskripsi dan foto produk. Kualitas pengerjaan sangat rapi dan estetik.",
  "Penjual jujur dan amanah. Kompor / perabotan berjalan lancar tanpa kendala.",
  "Respon cepat, paking rapi aman bubble wrap tebel bener. Barang belum dites tapi mulus 100%.",
  "Beli pas promo gratis ongkir, sampai Jakarta Selatan cuma 1 hari. Mantap banget pelayanannya!",
  "Garansi aman, kelengkapan fullset. Nggak rugi beli produk Omicko / perabotan di sini.",
  "Kualitasnya terjamin oke, fisik mulus nggak ada baret. Langsung dipasang di dapur dan siap pakai.",
  "Bintang 5 buat Pratama Jaya! Toko terpercaya barang original dan CS-nya responsif banget.",
  "Bungkusnya rapi dan rapat. Tidak ada yang rusak / lecet. Kualitas jempolan!",
  "Keren banget, respon seller sangat baik dan barang cepat diproses. Nanti bakal order alat dapur lain.",
  "Barang oke banget, garansi sesuai yang tertulis. Terima kasih banyak seller!",
  "Packing kencang, aman dari guncangan kurir. Suara mesin halus & pengerjaan rapi.",
  "Pengiriman ekstra cepat! Pesan pagi, besok siang sudah mendarat di rumah. Top!",
  "Suka banget sama produknya. Warnanya cantik, kokoh, dan bergaransi resmi.",
];

function getTimeAgoForIndex(i: number): string {
  if (i === 0) return "Hari ini";
  if (i === 1) return "1 hari yang lalu";
  if (i === 2) return "2 hari yang lalu";
  if (i < 7) return `${i} hari yang lalu`;
  if (i < 30) return `${Math.floor(i / 7)} minggu yang lalu`;
  if (i < 180) return `${Math.floor(i / 30)} bulan yang lalu`;
  return `${Math.floor(i / 180)} tahun yang lalu`;
}

function getNaturalReviewsForProduct(id: string, name: string, targetCount: number) {
  let hash = 0;
  const str = id + name;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const nameOffset = Math.abs(hash);
  const commentOffset = Math.abs(hash * 3);

  const result = [];
  for (let i = 0; i < targetCount; i++) {
    const nameIndex = (nameOffset + i) % CUSTOMER_NAMES.length;
    const commentIndex = (commentOffset + i) % CUSTOMER_COMMENTS.length;
    const reviewerName = CUSTOMER_NAMES[nameIndex];
    const rating = (i + nameOffset) % 7 === 0 ? 4 : 5;

    result.push({
      name: reviewerName,
      initial: reviewerName.charAt(0).toUpperCase(),
      rating,
      timeAgo: getTimeAgoForIndex(i),
      comment: CUSTOMER_COMMENTS[commentIndex],
    });
  }
  return result;
}

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

  const baseNaturalReviews = getNaturalReviewCount(prod.id || "", prod.name || "");
  const dbReviewCount = prod.reviews ? prod.reviews.length : 0;
  const reviewCount = baseNaturalReviews + dbReviewCount;
  const averageRating =
    dbReviewCount > 0
      ? Number((prod.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / dbReviewCount).toFixed(1))
      : getNaturalRating(prod.id || "", prod.name || "");

  const totalStock = prod.variants
    ? prod.variants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0)
    : 0;

  const soldCount = getNaturalSoldCount(prod.id || "", prod.name || "");

  return {
    id: prod.id as string,
    slug: prod.slug as string,
    name: prod.name as string,
    category: prod.category.name as string,
    storeName: getNaturalStoreName(prod.id || "", prod.name || ""),
    price,
    originalPrice: hasDiscount ? compareAtPrice : null,
    discount: discountPercent ? `${discountPercent}%` : null,
    rating: averageRating,
    reviewCount: `${reviewCount} Ulasan`,
    soldLabel: `Terjual ${soldCount}+`,
    image: prod.images[0]?.url ?? "https://placehold.co/400x400/e2e8f0/64748b/png?text=Product",
    isPreorder: Boolean(prod.isPreorder && totalStock === 0),
    isFeatured: Boolean(prod.isFeatured),
  };
}

export class CatalogService {
  static async getFeaturedProducts(limit = 10) {
    const products = await ProductRepository.findFeatured(limit);
    return products.map(mapProductToCard);
  }

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

    const targetCount = getNaturalReviewCount(prod.id, prod.name);
    const neededNaturalCount = Math.max(0, targetCount - dbReviews.length);
    const naturalReviews = getNaturalReviewsForProduct(prod.id, prod.name, neededNaturalCount);
    const reviews = [...dbReviews, ...naturalReviews];
    const reviewCountNum = reviews.length;
    const averageRating =
      reviews.length > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 4.9;
    const soldCount = getNaturalSoldCount(prod.id, prod.name);

    return {
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      storeName: getNaturalStoreName(prod.id, prod.name),
      rating: averageRating,
      reviewCount: `${reviewCountNum} Ulasan`,
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
