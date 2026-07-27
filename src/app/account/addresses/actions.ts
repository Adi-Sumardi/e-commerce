"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

async function requireUserId() {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

interface AddressInput {
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
  biteshipAreaId: string;
}

export async function createAddressAction(data: AddressInput) {
  const userId = await requireUserId();

  if (!data.biteshipAreaId) {
    return { error: "Area tujuan Biteship wajib dipilih dari hasil pencarian." };
  }

  const existing = await db.address.findFirst({ where: { userId } });

  await db.address.create({
    data: {
      userId,
      label: data.label,
      recipientName: data.recipientName,
      phone: data.phone,
      province: data.province,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      fullAddress: data.fullAddress,
      biteshipAreaId: data.biteshipAreaId,
      isDefault: !existing,
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/addresses");
}

export async function updateAddressAction(addressId: string, data: AddressInput) {
  const userId = await requireUserId();

  if (!data.biteshipAreaId) {
    return { error: "Area tujuan Biteship wajib dipilih dari hasil pencarian." };
  }

  const address = await db.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    return { error: "Alamat tidak ditemukan." };
  }

  await db.address.update({
    where: { id: addressId },
    data: {
      label: data.label,
      recipientName: data.recipientName,
      phone: data.phone,
      province: data.province,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      fullAddress: data.fullAddress,
      biteshipAreaId: data.biteshipAreaId,
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/addresses");
}

export async function deleteAddressAction(addressId: string) {
  const userId = await requireUserId();

  const address = await db.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    return { error: "Alamat tidak ditemukan." };
  }

  try {
    await db.address.delete({ where: { id: addressId } });
  } catch (error) {
    const isReferenced =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
    if (isReferenced) {
      return { error: "Alamat ini terpakai di riwayat order, tidak bisa dihapus." };
    }
    throw error;
  }

  // Kalau yang dihapus itu alamat utama, jadikan alamat lain (kalau ada) sebagai utama.
  if (address.isDefault) {
    const nextDefault = await db.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (nextDefault) {
      await db.address.update({ where: { id: nextDefault.id }, data: { isDefault: true } });
    }
  }

  revalidatePath("/account");
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(addressId: string) {
  const userId = await requireUserId();

  const address = await db.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    return { error: "Alamat tidak ditemukan." };
  }

  await db.$transaction([
    db.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    db.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account");
  revalidatePath("/account/addresses");
}
