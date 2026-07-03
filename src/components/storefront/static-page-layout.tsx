import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";

interface StaticPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function StaticPageLayout({ title, subtitle, children }: StaticPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="prose prose-sm mt-8 max-w-none space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
