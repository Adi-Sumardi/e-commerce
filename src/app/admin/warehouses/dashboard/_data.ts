// Mock/static warehouse staff dashboard data.
// Real data comes from Prisma (Order/Warehouse/Notification) plus a
// Pusher/SSE feed for real-time updates (docs/ERD.md, docs/UIUX.md §4.6).

export type QueueOrderStatus = "Order Baru" | "Diproses";

export interface QueueItemLine {
  name: string;
  variant: string;
  image: string;
}

export interface QueueOrder {
  id: string;
  createdAt: string;
  status: QueueOrderStatus;
  items: QueueItemLine[];
  destination: string;
  courier: string;
  courierIcon: "truck" | "motorcycle" | "plane" | "cargo";
  actionLabel: string;
}

export const warehouseInfo = {
  name: "Gudang Utama",
  code: "WH-JKT-01",
  newOrdersCount: 24,
  processingCount: 12,
};

export const queueOrders: QueueOrder[] = [
  {
    id: "TK-90210-JKT",
    createdAt: "Hari ini, 09:41",
    status: "Order Baru",
    items: [
      {
        name: "Keychron K2 Mechanical Keyboard",
        variant: "1 x Blue Switch Variant",
        image: "https://placehold.co/96x96/e2e8f0/64748b/png?text=Keyboard",
      },
      {
        name: "Premium Braided USB-C Cable",
        variant: "2 x 2.0m Midnight Blue",
        image: "https://placehold.co/96x96/e2e8f0/64748b/png?text=Cable",
      },
    ],
    destination: "Bandung, Jawa Barat",
    courier: "JNE Reg",
    courierIcon: "truck",
    actionLabel: "Proses & Buat Pengiriman",
  },
  {
    id: "TK-90211-JKT",
    createdAt: "Hari ini, 09:45",
    status: "Diproses",
    items: [
      {
        name: "X-Phone 15 Pro Max",
        variant: "1 x 512GB Emerald Green",
        image: "https://placehold.co/96x96/e2e8f0/64748b/png?text=Phone",
      },
    ],
    destination: "Surabaya, Jawa Timur",
    courier: "GoSend Instant",
    courierIcon: "motorcycle",
    actionLabel: "Cetak Label Pengiriman",
  },
  {
    id: "TK-90212-JKT",
    createdAt: "Hari ini, 10:02",
    status: "Order Baru",
    items: [
      {
        name: "Audio-Zen Studio Monitors",
        variant: "1 x Wired Professional",
        image: "https://placehold.co/96x96/e2e8f0/64748b/png?text=Studio+Monitor",
      },
    ],
    destination: "Medan, Sumatera Utara",
    courier: "SiCepat Best",
    courierIcon: "plane",
    actionLabel: "Proses & Buat Pengiriman",
  },
  {
    id: "TK-90215-JKT",
    createdAt: "Hari ini, 10:15",
    status: "Order Baru",
    items: [
      {
        name: "ErgoFlex Office Chair v2",
        variant: "1 x Space Grey Mesh",
        image: "https://placehold.co/96x96/e2e8f0/64748b/png?text=Office+Chair",
      },
    ],
    destination: "Denpasar, Bali",
    courier: "J&T Cargo",
    courierIcon: "cargo",
    actionLabel: "Proses & Buat Pengiriman",
  },
];
