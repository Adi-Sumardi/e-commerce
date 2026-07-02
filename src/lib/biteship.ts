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

export interface BiteshipRateItem {
  name: string;
  value: number;
  weight: number;
  quantity: number;
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
