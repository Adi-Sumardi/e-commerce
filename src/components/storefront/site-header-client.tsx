"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  ChevronDown,
  Grid2x2,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart-store";
import { useSession } from "next-auth/react";

export interface CategoryNavItem {
  label: string;
  slug: string;
}

interface SiteHeaderProps {
  variant?: "default" | "compact";
  categories: CategoryNavItem[];
}

function UserNavButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="size-9 animate-pulse rounded-full bg-muted" />;
  }

  if (session?.user) {
    const name = (session.user as any).name ?? "User";
    const initial = name[0].toUpperCase();
    const role = (session.user as any).role;
    const dashboardHref =
      role === "SUPER_ADMIN" || role === "STAFF_GUDANG" || role === "CS"
        ? role === "STAFF_GUDANG"
          ? "/admin/warehouses/dashboard"
          : "/admin/dashboard"
        : "/account";

    return (
      <Link
        href={dashboardHref}
        className="flex items-center gap-2 p-1 text-muted-foreground hover:text-primary"
        aria-label="Profil saya"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initial}
        </div>
        <span className="hidden max-w-24 truncate text-sm font-medium lg:block">{name}</span>
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="flex items-center gap-2 p-2 text-muted-foreground hover:text-primary"
      >
        <User className="size-5" />
        <span className="hidden text-sm text-muted-foreground lg:block">Masuk</span>
      </Link>
      <Link href="/register">
        <Button className="hidden lg:inline-flex cursor-pointer">Daftar</Button>
      </Link>
    </>
  );
}



// Inner component that safely uses useSearchParams — must be wrapped in Suspense
function CategorySubNav({
  activeCategory,
  categories,
}: {
  activeCategory: string;
  categories: CategoryNavItem[];
}) {
  return (
    <div className="hidden border-t border-border/10 bg-card md:block">
      <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((item) => (
          <Link
            key={item.slug + item.label}
            href={item.slug ? `/products?category=${item.slug}` : "/products"}
            className={
              activeCategory === item.slug
                ? "whitespace-nowrap text-sm font-bold text-primary"
                : "whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-primary"
            }
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function KategoriDropdown({
  activeCategory,
  categories,
}: {
  activeCategory: string;
  categories: CategoryNavItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-muted-foreground transition-colors hover:bg-accent cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        <Grid2x2 className="size-5" />
        <span className="text-sm font-semibold">Kategori</span>
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg z-50">
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={item.slug ? `/products?category=${item.slug}` : "/products"}
              className={`block rounded-lg px-4 py-2.5 text-sm transition-colors hover:bg-accent ${
                activeCategory === item.slug
                  ? "font-bold text-primary bg-primary/5"
                  : "text-foreground"
              }`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// This component uses useSearchParams — must be in Suspense
function HeaderSearchParamsConsumer({
  variant,
  categories,
}: {
  variant: "default" | "compact";
  categories: CategoryNavItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCartCount = mounted
    ? cartItems.reduce((acc, curr) => acc + curr.quantity, 0)
    : 0;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleMobileSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    setMobileNavOpen(false);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <>
      {/* Main topbar */}
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 lg:px-8">
        <div className="flex flex-1 items-center gap-6">
          <Link href="/" className="whitespace-nowrap text-2xl font-bold text-primary">
            Pratama Jaya
          </Link>
          {variant === "default" && (
            <div className="hidden max-w-3xl flex-1 items-center gap-4 md:flex">
              <KategoriDropdown activeCategory={activeCategory} categories={categories} />
              <form onSubmit={handleSearchSubmit} className="relative flex flex-1 items-center">
                <Input
                  type="text"
                  placeholder="Cari produk, merek, atau kategori..."
                  className="w-full rounded-xl bg-muted pr-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  aria-label="Cari"
                  className="absolute right-1 rounded-lg bg-primary p-1.5 text-primary-foreground cursor-pointer"
                >
                  <Search className="size-5" />
                </button>
              </form>
            </div>
          )}
        </div>
        <nav className="flex items-center gap-2">
          <button
            aria-label="Wishlist"
            className="relative p-2 text-muted-foreground hover:text-primary hidden sm:flex cursor-pointer"
          >
            <Heart className="size-5" />
          </button>
          <Link
            href="/cart"
            aria-label="Keranjang"
            className="relative p-2 text-muted-foreground hover:text-primary cursor-pointer"
          >
            <ShoppingCart className="size-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                {totalCartCount}
              </span>
            )}
          </Link>
          <UserNavButton />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </nav>
      </div>

      {/* Category sub-nav */}
      {variant === "default" && <CategorySubNav activeCategory={activeCategory} categories={categories} />}

      {/* Mobile nav */}
      {mobileNavOpen && (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          <form onSubmit={handleMobileSearchSubmit} className="relative mb-3 flex items-center">
            <Input
              type="text"
              placeholder="Cari produk..."
              className="w-full rounded-xl bg-muted pr-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              aria-label="Cari"
              className="absolute right-1 rounded-lg bg-primary p-1.5 text-primary-foreground cursor-pointer"
            >
              <Search className="size-5" />
            </button>
          </form>
          <div className="flex flex-col gap-2">
            {categories.map((item) => (
              <Link
                key={item.slug + item.label}
                href={item.slug ? `/products?category=${item.slug}` : "/products"}
                className={`py-1 text-sm transition-colors hover:text-primary ${
                  activeCategory === item.slug
                    ? "font-bold text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMobileNavOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function SiteHeaderClient({ variant = "default", categories }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex flex-col bg-card shadow-sm">
      <Suspense
        fallback={
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 lg:px-8">
            <Link href="/" className="whitespace-nowrap text-2xl font-bold text-primary">
              Pratama Jaya
            </Link>
          </div>
        }
      >
        <HeaderSearchParamsConsumer variant={variant} categories={categories} />
      </Suspense>
    </header>
  );
}

export function BottomNavBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around bg-card shadow-[0_-1px_10px_rgba(0,0,0,0.05)] md:hidden">
      <Link href="/" className="flex flex-col items-center gap-1 text-primary">
        <Grid2x2 className="size-5" />
        <span className="text-[10px]">Home</span>
      </Link>
      <Link
        href="/products?category=elektronik"
        className="flex flex-col items-center gap-1 text-muted-foreground"
      >
        <Search className="size-5" />
        <span className="text-[10px]">Explore</span>
      </Link>
      <Link href="/cart" className="flex flex-col items-center gap-1 text-muted-foreground">
        <ShoppingCart className="size-5" />
        <span className="text-[10px]">Keranjang</span>
      </Link>
      <Link href="/account" className="flex flex-col items-center gap-1 text-muted-foreground">
        <User className="size-5" />
        <span className="text-[10px]">Akun</span>
      </Link>
    </nav>
  );
}
