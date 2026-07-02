import { db } from "@/lib/db";

export class AddressRepository {
  static async findByUserId(userId: string) {
    return db.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });
  }

  static async findDefaultByUserId(userId: string) {
    return db.address.findFirst({
      where: { userId, isDefault: true },
    });
  }

  static async findById(id: string) {
    return db.address.findUnique({
      where: { id },
    });
  }
}
