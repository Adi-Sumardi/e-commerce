// Mock/static admin dashboard data. Real Prisma aggregation queries come later.

export const kpiCards = {
  totalSales: { value: 142450000, changeLabel: "+12%", trend: "up" as const },
  newOrders: { value: 1204, todayLabel: "48 Hari ini" },
  newCustomers: { value: 156, changeLabel: "+8%", trend: "up" as const },
  lowStock: { value: 12, label: "Perlu Tindakan" },
};

export const salesChart = [40, 60, 35, 75, 55, 90, 65, 45, 80, 70];

export const courierPerformance = [
  { name: "JNE Express", percent: 45, colorVar: "primary" as const },
  { name: "GoSend", percent: 32, colorVar: "secondary" as const },
];

export type OrderStatus = "Dikirim" | "Selesai" | "Pending" | "Dibatalkan";

export interface RecentOrder {
  id: string;
  customer: string;
  city: string;
  status: OrderStatus;
  total: number;
}

export const recentOrders: RecentOrder[] = [
  { id: "TK-99281", customer: "Budi Santoso", city: "Jakarta Selatan", status: "Dikirim", total: 1250000 },
  { id: "TK-99280", customer: "Siti Aminah", city: "Surabaya", status: "Selesai", total: 450000 },
  { id: "TK-99279", customer: "Andi Wijaya", city: "Bandung", status: "Pending", total: 3820000 },
  { id: "TK-99278", customer: "Rina Melati", city: "Medan", status: "Dibatalkan", total: 89000 },
];

export function formatIDR(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}
