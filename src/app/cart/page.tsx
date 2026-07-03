import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { CartContent } from "./cart-content";

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <CartContent />
      <SiteFooter />
    </div>
  );
}
