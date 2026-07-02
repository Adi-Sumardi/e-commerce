"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function addReviewAction(productId: string, rating: number, comment: string) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Harap masuk untuk menulis ulasan." };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: "Rating tidak valid." };
  }

  try {
    await db.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        comment,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Gagal menambahkan ulasan:", error);
    return { success: false, error: "Gagal mengirimkan ulasan." };
  }
}
