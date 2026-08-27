"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    await signOut({ callbackUrl: "/login?logout=success" });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-destructive hover:bg-destructive/5 transition-colors cursor-pointer disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      <span className="flex-1 text-left font-medium">
        {isPending ? "Sedang keluar..." : "Keluar"}
      </span>
    </button>
  );
}
