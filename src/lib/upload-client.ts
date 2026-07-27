// Dipakai di sisi client (form upload gambar) — dipisah dari komponen supaya
// penanganan response non-JSON (mis. halaman error HTML dari proxy/WAF saat
// timeout atau payload kegedean) konsisten di semua tempat upload.
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      res.status === 413
        ? "Ukuran file terlalu besar untuk diupload."
        : "Gagal upload — server tidak merespons dengan benar. Coba lagi beberapa saat."
    );
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal upload file.");
  }

  return data.url as string;
}
