"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function toggleWishlistAction(productId: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return { error: "Harap masuk terlebih dahulu.", requiresLogin: true as const };
  }

  const userId = session.user.id;

  const existing = await db.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await db.wishlist.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { wishlisted: false };
  }

  await db.wishlist.create({ data: { userId, productId } });
  revalidatePath("/wishlist");
  return { wishlisted: true };
}

export async function getWishlistedProductIdsAction(): Promise<string[]> {
  const session = await auth();
  if (!session || !session.user?.id) return [];

  const rows = await db.wishlist.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}
