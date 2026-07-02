import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Halaman transaksional/privat tidak berguna di hasil pencarian.
      disallow: [
        "/admin",
        "/api",
        "/account",
        "/cart",
        "/checkout",
        "/orders",
        "/login",
        "/register",
        "/track",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
