export function isJabodetabekAddress(
  province?: string | null,
  city?: string | null,
  district?: string | null
): boolean {
  const text = `${province ?? ""} ${city ?? ""} ${district ?? ""}`.toLowerCase();
  return /jakarta|bogor|depok|tangerang|bekasi/.test(text);
}

export function calculateDiscountedShippingCost(
  originalPrice: number,
  province?: string | null,
  city?: string | null,
  district?: string | null
) {
  const isJabodetabek = isJabodetabekAddress(province, city, district);
  let discountedPrice = originalPrice;
  let discountAmount = 0;

  if (isJabodetabek) {
    // Gratis Ongkir Jabodetabek (100% discount)
    discountAmount = originalPrice;
    discountedPrice = 0;
  } else {
    // Potong Ongkir Rp30.000 untuk Luar Jabodetabek
    discountAmount = Math.min(originalPrice, 30000);
    discountedPrice = Math.max(0, originalPrice - 30000);
  }

  return {
    discountedPrice,
    originalPrice: discountAmount > 0 ? originalPrice : null,
    isFreeShipping: discountedPrice === 0,
    discountAmount,
    isJabodetabek,
  };
}
