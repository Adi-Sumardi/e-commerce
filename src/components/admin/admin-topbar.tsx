"use client";

import Image from "next/image";
import { ChevronDown, Menu, Search, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminNotificationBell } from "./admin-notification-bell";
import { useAdminUiStore } from "@/store/admin-ui-store";

export function AdminTopbar() {
  const { data: session } = useSession();
  const toggleMobileSidebar = useAdminUiStore((state) => state.toggleMobileSidebar);
  const user = session?.user as { name?: string; email?: string; role?: string } | undefined;
  const name = user?.name ?? "Admin";
  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "STAFF_GUDANG"
        ? "Staff Gudang"
        : user?.role === "CS"
          ? "Customer Service"
          : "Admin";

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border/20 bg-card px-4 shadow-sm lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Buka menu"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted md:hidden"
        >
          <Menu className="size-5" />
        </button>
        <Image
          src="/logo/pratama-jaya.png"
          alt="Pratama Jaya"
          width={780}
          height={224}
          unoptimized
          className="h-7 w-auto md:hidden"
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden w-80 items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 lg:flex">
          <Search className="size-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari transaksi atau produk..."
            className="h-auto border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          {user?.role === "SUPER_ADMIN" && <AdminNotificationBell />}
          <div className="h-6 w-px bg-border" />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-primary">
                  <span>{name}</span>
                  <ChevronDown className="size-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{roleLabel}</span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={
                  <a href="/admin/settings" className="cursor-pointer">
                    <User className="size-4" />
                    Pengaturan Akun
                  </a>
                }
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ callbackUrl: "/login?logout=success" })}
                className="cursor-pointer"
              >
                <LogOut className="size-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
