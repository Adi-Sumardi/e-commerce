// Mock/static data for the storefront homepage. Real data fetching (Prisma) comes later.

export interface HomeCategory {
  name: string;
  icon:
    | "laptop"
    | "shirt"
    | "chair"
    | "sparkles"
    | "gamepad"
    | "shopping-basket";
}

export const homeCategories: HomeCategory[] = [
  { name: "Elektronik", icon: "laptop" },
  { name: "Fashion", icon: "shirt" },
  { name: "Rumah Tangga", icon: "chair" },
  { name: "Kecantikan", icon: "sparkles" },
  { name: "Hobi & Gaming", icon: "gamepad" },
  { name: "Sembako", icon: "shopping-basket" },
];

export interface HomeProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  soldLabel: string;
  image: string;
}

export const bestSellerProducts: HomeProduct[] = [
  {
    slug: "premium-wireless-headphones-v2",
    name: "Premium Wireless Headphones Noise Cancelling - Raven Black",
    category: "Elektronik",
    price: 2499000,
    originalPrice: 3199000,
    rating: 4.9,
    soldLabel: "Terjual 1rb+",
    image: "https://placehold.co/400x400/e2e8f0/64748b/png?text=Headphones",
  },
  {
    slug: "smartwatch-series-9",
    name: "Smartwatch Series 9 - 44mm AMOLED Display",
    category: "Gadget",
    price: 1150000,
    rating: 4.8,
    soldLabel: "Terjual 500+",
    image: "https://placehold.co/400x400/e2e8f0/64748b/png?text=Smartwatch",
  },
  {
    slug: "mechanical-keyboard-rgb-tkl",
    name: "Mechanical Keyboard RGB TKL - Blue Switch",
    category: "Gaming",
    price: 649000,
    rating: 4.7,
    soldLabel: "Terjual 300+",
    image: "https://placehold.co/400x400/e2e8f0/64748b/png?text=Keyboard",
  },
  {
    slug: "ceramic-coffee-dripper-v60",
    name: "Ceramic Coffee Dripper Set V60 - Sand Matte",
    category: "Home",
    price: 285000,
    rating: 5.0,
    soldLabel: "Terjual 100+",
    image: "https://placehold.co/400x400/e2e8f0/64748b/png?text=Coffee+Dripper",
  },
  {
    slug: "ergochair-pro",
    name: "ErgoChair Pro - Full Mesh Ergonomic Support",
    category: "Office",
    price: 3450000,
    rating: 4.9,
    soldLabel: "Terjual 250+",
    image: "https://placehold.co/400x400/e2e8f0/64748b/png?text=Ergo+Chair",
  },
];

export function formatIDR(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}
