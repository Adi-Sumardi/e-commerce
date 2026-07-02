import { db } from "@/lib/db";

export class CategoryRepository {
  static async findAll() {
    return db.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  static async findBySlug(slug: string) {
    return db.category.findUnique({
      where: { slug },
    });
  }
}
