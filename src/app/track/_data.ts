// Mock/static order tracking data. Real Prisma/Biteship tracking data comes later.

export interface TrackingStep {
  label: string;
  date: string;
  icon: "check" | "payment" | "package" | "shipping" | "home";
  done: boolean;
}

export interface TrackingLogEntry {
  title: string;
  description: string;
  time: string;
  done: boolean;
}

export const mockTracking = {
  orderNumber: "INV-20260701-001",
  courierName: "JNE Reguler",
  waybill: "JNE12345678",
  estimatedArrival: "5 Juli 2026",
  currentStatus: "Dalam Perjalanan - Sorting Center",
  steps: [
    { label: "Dibuat", date: "01 Jul 09:00", icon: "check", done: true },
    { label: "Dibayar", date: "01 Jul 09:05", icon: "payment", done: true },
    { label: "Diproses", date: "02 Jul 08:00", icon: "package", done: true },
    { label: "Dikirim", date: "02 Jul 14:00", icon: "shipping", done: true },
    { label: "Diterima", date: "Menunggu", icon: "home", done: false },
  ] satisfies TrackingStep[],
  progressPercent: 75,
  log: [
    {
      title: "Berangkat dari Sorting Center - Jakarta Hub",
      description: "Paket dalam perjalanan menuju kota tujuan.",
      time: "Hari ini, 04:30",
      done: true,
    },
    {
      title: "Tiba di Sorting Center - Jakarta Hub",
      description: "Paket diterima di fasilitas sortir utama.",
      time: "02 Jul, 23:15",
      done: true,
    },
    {
      title: "Diambil oleh Kurir JNE",
      description: "Paket diserahkan oleh penjual Pratama Jaya ke kurir.",
      time: "02 Jul, 18:45",
      done: true,
    },
    {
      title: "Penjual telah memproses pesanan",
      description: "Pesanan sedang dikemas dan disiapkan untuk pengiriman.",
      time: "02 Jul, 09:15",
      done: true,
    },
  ] satisfies TrackingLogEntry[],
  seller: {
    name: "Pratama Jaya",
    rating: "4.9 (2.1k ulasan)",
  },
  deliveryAddress: {
    name: "Budi Sudarsono",
    lines: ["Jl. Kemang Raya No. 12, Unit 4B", "Mampang Prapatan, Jakarta Selatan", "DKI Jakarta, 12730"],
  },
};
