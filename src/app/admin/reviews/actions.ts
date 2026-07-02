"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function deleteReviewAction(reviewId: string) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  await db.review.delete({ where: { id: reviewId } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/products/[slug]", "page");
}
