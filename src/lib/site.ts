// URL kanonik situs untuk metadata SEO (canonical, Open Graph, sitemap, robots).
// Di production diambil dari NEXTAUTH_URL yang sudah wajib di-set untuk auth.
export const SITE_URL = process.env.NEXTAUTH_URL ?? "https://pratamajaya.id";

export const SITE_NAME = "Pratama Jaya";

export const SITE_DESCRIPTION =
  "Belanja online aman dan terpercaya di Pratama Jaya. Elektronik, fashion, rumah tangga, dan kebutuhan harian dengan pengiriman cepat ke seluruh Indonesia.";
