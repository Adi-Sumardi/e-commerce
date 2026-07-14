// Saung WA tidak menyediakan SDK Node resmi — wrapper tipis di atas fetch.
// Dokumentasi: https://app.saungwa.com/api/create-message (multipart/form-data)

const SAUNGWA_URL = "https://app.saungwa.com/api/create-message";

function normalizeIndonesianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

// Fire-and-forget dari pemanggil (dibungkus try/catch) — kegagalan kirim WA
// tidak boleh menggagalkan alur order/pembayaran.
export async function sendWhatsappMessage(phone: string, message: string): Promise<void> {
  const appkey = process.env.SAUNGWA_APP_KEY;
  const authkey = process.env.SAUNGWA_AUTH_KEY;

  if (!appkey || !authkey) {
    console.warn("SAUNGWA_APP_KEY/SAUNGWA_AUTH_KEY belum di-set — notifikasi WhatsApp dilewati.");
    return;
  }

  const form = new FormData();
  form.append("appkey", appkey);
  form.append("authkey", authkey);
  form.append("to", normalizeIndonesianPhone(phone));
  form.append("message", message);

  const res = await fetch(SAUNGWA_URL, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Saung WA API error: ${res.status} ${await res.text()}`);
  }
}
