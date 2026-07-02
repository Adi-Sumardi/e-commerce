// Mock/static checkout data. No server actions / Prisma queries here yet.

export interface CourierOption {
  id: string;
  name: string;
  eta: string;
  price: number;
}

export const courierOptions: CourierOption[] = [
  { id: "jne", name: "JNE Reguler", eta: "Estimasi 2-3 Hari", price: 18000 },
  { id: "jnt", name: "J&T Express", eta: "Estimasi 1-2 Hari", price: 22000 },
  { id: "sicepat", name: "SiCepat REG", eta: "Estimasi 2-4 Hari", price: 17500 },
];

export interface VaBank {
  id: string;
  name: string;
}

export const vaBanks: VaBank[] = [
  { id: "bca", name: "BCA" },
  { id: "mandiri", name: "Mandiri" },
  { id: "bni", name: "BNI" },
];

export const orderSummary = {
  itemCount: 3,
  subtotal: 2480000,
  shippingCost: 18000,
  insurance: 16000,
  serviceFee: 1000,
  total: 2514000,
};

// Pre-Order payment scheme mock data (docs/UIUX.md §4.7)
export const preorderInfo = {
  hasPreorderItem: true,
  estimatedShipDate: "15 Agustus 2026",
  fullPaymentAmount: 500000,
  dpPercentage: 30,
  dpAmount: 150000,
  remainingAmount: 350000,
};
