// Biteship tidak menyediakan SDK Node resmi — wrapper tipis di atas fetch.
// Dokumentasi: https://biteship.com/id/docs

const BITESHIP_BASE_URL = "https://api.biteship.com/v1";

function biteshipHeaders() {
  if (!process.env.BITESHIP_API_KEY) {
    console.warn("BITESHIP_API_KEY belum di-set — panggilan Biteship API akan gagal.");
  }
  return {
    Authorization: process.env.BITESHIP_API_KEY ?? "",
    "Content-Type": "application/json",
  };
}

export interface BiteshipArea {
  id: string;
  name: string;
  country_name: string;
  administrative_division_level_1_name: string;
  administrative_division_level_2_name: string;
  administrative_division_level_3_name: string | null;
  postal_code: number;
}

// Pencarian area (kota/kecamatan/kode pos) untuk resolve area_id asli —
// dipakai form alamat customer, form gudang, dan halaman cek ongkir admin.
export async function searchBiteshipAreas(query: string): Promise<BiteshipArea[]> {
  if (!query || query.trim().length < 3) return [];

  const url = new URL(`${BITESHIP_BASE_URL}/maps/areas`);
  url.searchParams.set("countries", "ID");
  url.searchParams.set("input", query.trim());
  url.searchParams.set("type", "single");

  const res = await fetch(url.toString(), { headers: biteshipHeaders() });
  if (!res.ok) {
    throw new Error(`Biteship area search error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.areas ?? [];
}

export interface BiteshipRateItem {
  name: string;
  value: number;
  weight: number;
  quantity: number;
}

export interface BiteshipPricing {
  available_for_cash_on_delivery?: boolean;
  available_for_proof_of_delivery?: boolean;
  available_for_instant_waybill_id?: boolean;
  available_for_insurance?: boolean;
  company?: string;
  courier_name?: string;
  courier_code?: string;
  courier_service_name?: string;
  courier_service_code?: string;
  description?: string;
  duration?: string;
  shipment_duration_range?: string;
  shipment_duration_unit?: string;
  service_type?: string;
  shipping_type?: string;
  price?: number;
  type?: string;
}

export interface BiteshipRatesResponse {
  success?: boolean;
  object?: string;
  message?: string;
  code?: number;
  pricing?: BiteshipPricing[];
}

export async function getBiteshipRates(params: {
  originAreaId: string;
  destinationAreaId: string;
  items: BiteshipRateItem[];
  couriers: string; // e.g. "jne,jnt,sicepat,anteraja"
}) {
  const res = await fetch(`${BITESHIP_BASE_URL}/rates/couriers`, {
    method: "POST",
    headers: biteshipHeaders(),
    body: JSON.stringify({
      origin_area_id: params.originAreaId,
      destination_area_id: params.destinationAreaId,
      couriers: params.couriers,
      items: params.items,
    }),
  });

  if (!res.ok) {
    throw new Error(`Biteship rates API error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function createBiteshipOrder(payload: Record<string, unknown>) {
  const res = await fetch(`${BITESHIP_BASE_URL}/orders`, {
    method: "POST",
    headers: biteshipHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Biteship create order error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

// Verifikasi secret header pada webhook Biteship sebelum memproses payload.
export function verifyBiteshipWebhookSecret(secret: string | null): boolean {
  if (!process.env.BITESHIP_WEBHOOK_SECRET) return false;
  return secret === process.env.BITESHIP_WEBHOOK_SECRET;
}
