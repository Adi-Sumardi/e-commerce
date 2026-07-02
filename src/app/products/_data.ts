// Mock/static product data used for the product detail page.
// Real data fetching (Prisma) will replace this once the products module is wired up.

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductReview {
  name: string;
  initial: string;
  rating: number;
  timeAgo: string;
  comment: string;
  photo?: string;
}

export interface ProductDetail {
  slug: string;
  name: string;
  storeName: string;
  rating: number;
  reviewCount: string;
  soldLabel: string;
  price: number;
  originalPrice: number;
  discountLabel: string;
  colors: { name: string; hex: string }[];
  stock: number;
  images: ProductImage[];
  description: string;
  specs: { icon: "battery" | "bluetooth"; title: string; detail: string }[];
  reviews: ProductReview[];
  isPreorder: boolean;
}

export const mockProduct: ProductDetail = {
  slug: "premium-wireless-headphones-v2",
  name: "Premium Wireless Headphones v2",
  storeName: "Pratama Jaya",
  rating: 4.9,
  reviewCount: "2.1k Reviews",
  soldLabel: "Terjual 5.4k+",
  price: 2499000,
  originalPrice: 2940000,
  discountLabel: "15% OFF",
  colors: [
    { name: "Black", hex: "#191B23" },
    { name: "Silver", hex: "#E2E8F0" },
  ],
  stock: 142,
  images: [
    {
      url: "https://placehold.co/800x800/191b23/ffffff/png?text=Headphones+Utama",
      alt: "Foto utama headphone nirkabel premium warna hitam matte",
    },
    {
      url: "https://placehold.co/200x200/e2e8f0/64748b/png?text=Detail+1",
      alt: "Detail bantalan telinga headphone",
    },
    {
      url: "https://placehold.co/200x200/e2e8f0/64748b/png?text=Detail+2",
      alt: "Headphone dilipat dalam travel case",
    },
    {
      url: "https://placehold.co/200x200/e2e8f0/64748b/png?text=Detail+3",
      alt: "Tampilan tombol kontrol headphone",
    },
    {
      url: "https://placehold.co/200x200/e2e8f0/64748b/png?text=Detail+4",
      alt: "Headphone di atas stand aluminium dekat laptop",
    },
  ],
  description:
    "Nikmati kualitas audio kelas dunia dengan Pratama Jaya Headphones v2. Dirancang untuk para profesional dan pecinta musik yang tidak ingin berkompromi dengan kualitas. Dilengkapi dengan Active Noise Cancelling (ANC) tingkat lanjut yang mampu meredam kebisingan sekitar hingga 98%, memberikan Anda fokus total dalam setiap nada.",
  specs: [
    { icon: "battery", title: "Battery Life", detail: "Hingga 40 jam pemakaian terus menerus." },
    { icon: "bluetooth", title: "Konektivitas", detail: "Bluetooth 5.2 dengan multipoint connection." },
  ],
  reviews: [
    {
      name: "Andi Wijaya",
      initial: "A",
      rating: 5,
      timeAgo: "2 hari yang lalu",
      comment:
        "Suaranya jernih banget, bass-nya dapet tapi nggak berlebihan. ANC-nya juara buat dipake di kantor yang berisik. Seller juga responsif banget!",
      photo: "https://placehold.co/160x160/e2e8f0/64748b/png?text=Unboxing",
    },
    {
      name: "Siska Putri",
      initial: "S",
      rating: 5,
      timeAgo: "Seminggu yang lalu",
      comment:
        "Barang original 100%, garansi resmi. Udah dicoba buat meeting zoom berjam-jam tetep nyaman di telinga.",
    },
  ],
  isPreorder: false,
};
