import path from "path";

// Direktori tempat file upload disimpan. Di produksi ini WAJIB diarahkan
// (via env var UPLOAD_DIR) ke folder di luar tree yang di-overwrite tiap
// deploy (public/ ikut ter-replace penuh oleh proses git-deploy Hostinger,
// jadi apa pun yang diupload runtime akan hilang tiap update kalau
// disimpan di public/uploads). Default di bawah cuma dipakai untuk dev lokal.
export function getUploadDir() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}
