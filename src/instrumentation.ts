export async function register() {
  // instrumentation.ts di-bundle untuk Edge runtime juga — logic watchdog
  // pakai node:child_process jadi harus di file terpisah (instrumentation.node.ts)
  // dan cuma di-require lewat require() dinamis di sini, biar bundler Edge
  // tidak ikut mencoba resolve node:child_process.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerReapWatchdog } = await import("./instrumentation.node");
    registerReapWatchdog();
  }
}
