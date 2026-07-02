"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AuthToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const login = searchParams.get("login");
    const logout = searchParams.get("logout");
    if (!login && !logout) return;

    if (login === "success") {
      toast.success("Berhasil masuk. Selamat datang kembali!");
    }
    if (logout === "success") {
      toast.success("Berhasil keluar. Sampai jumpa lagi!");
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    params.delete("logout");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
