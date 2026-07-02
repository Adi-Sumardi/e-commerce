import { CatalogService } from "@/server/services/catalog-service";
import { SiteHeaderClient, type CategoryNavItem } from "./site-header-client";

export { BottomNavBar } from "./site-header-client";

interface SiteHeaderProps {
  variant?: "default" | "compact";
}

export async function SiteHeader({ variant = "default" }: SiteHeaderProps) {
  const categories = await CatalogService.getHomeCategories();
  const navItems: CategoryNavItem[] = [
    { label: "Semua Produk", slug: "" },
    ...categories.map((c) => ({ label: c.name, slug: c.slug })),
  ];

  return <SiteHeaderClient variant={variant} categories={navItems} />;
}
