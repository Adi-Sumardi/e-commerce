import { db } from "@/lib/db";

export class ProductRepository {
  static async findPublished(
    optionsOrLimit: number | {
      limit?: number;
      categorySlug?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    } = 10,
    categorySlugFallback?: string
  ) {
    let limit = 10;
    let search: string | undefined;
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    let sort: string | undefined;
    let catSlug = categorySlugFallback;

    if (typeof optionsOrLimit === "object" && optionsOrLimit !== null) {
      limit = optionsOrLimit.limit ?? 10;
      catSlug = optionsOrLimit.categorySlug ?? catSlug;
      search = optionsOrLimit.search;
      minPrice = optionsOrLimit.minPrice;
      maxPrice = optionsOrLimit.maxPrice;
      sort = optionsOrLimit.sort;
    } else if (typeof optionsOrLimit === "number") {
      limit = optionsOrLimit;
    }

    const where: any = { status: "PUBLISHED" };
    if (catSlug) {
      where.category = { slug: catSlug };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") {
      orderBy = { basePrice: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { basePrice: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    return db.product.findMany({
      where,
      take: limit,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          orderBy: { price: "asc" },
        },
        reviews: true,
      },
      orderBy,
    });
  }

  static async findFeatured(limit = 10) {
    return db.product.findMany({
      where: {
        status: "PUBLISHED",
        isFeatured: true,
      },
      take: limit,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          orderBy: { price: "asc" },
        },
        reviews: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async findByIds(ids: string[]) {
    return db.product.findMany({
      where: { id: { in: ids } },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { price: "asc" } },
        reviews: true,
      },
    });
  }

  static async findBySlug(slug: string) {
    return db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          orderBy: { price: "asc" },
        },
        specs: {
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async findVariantById(id: string) {
    return db.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
            },
          },
        },
      },
    });
  }
}
