import { Xendit } from "xendit-node";

if (!process.env.XENDIT_SECRET_KEY) {
  console.warn("XENDIT_SECRET_KEY belum di-set — panggilan Xendit API akan gagal.");
}

export const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY ?? "",
});

// Verifikasi header `x-callback-token` pada webhook Xendit.
// https://developers.xendit.co/api-reference/#callbacks
export function verifyXenditCallbackToken(token: string | null): boolean {
  if (!process.env.XENDIT_WEBHOOK_TOKEN) return false;
  return token === process.env.XENDIT_WEBHOOK_TOKEN;
}
