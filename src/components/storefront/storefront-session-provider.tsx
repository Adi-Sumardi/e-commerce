"use client";

import { SessionProvider } from "next-auth/react";

export function StorefrontSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
