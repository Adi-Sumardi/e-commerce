import { exec } from "node:child_process";

// Hosting Node.js (LiteSpeed Node App Manager, lihat docs/DEPLOYMENT.md)
// kadang spawn instance `next-server` baru per beberapa request tanpa
// mematikan yang lama, sampai proses numpuk dan kena limit NPROC akun
// (crash-loop -> 503). Tidak ada akses cron di hosting ini, jadi watchdog
// ini jalan sebagai bagian dari app itu sendiri: tiap beberapa menit,
// kalau instance next-server kebanyakan, matikan yang paling lama.
export function registerReapWatchdog() {
  if (process.env.NODE_ENV !== "production") return;

  const KEEP = 3;
  const THRESHOLD = 6;
  const INTERVAL_MS = 3 * 60 * 1000;

  const reap = () => {
    exec(
      `ps -eo pid,etimes,cmd | grep '[n]ext-server' | sort -k2 -n | awk '{print $1}'`,
      (err, stdout) => {
        if (err) return;
        const pids = stdout.trim().split("\n").filter(Boolean);
        if (pids.length <= THRESHOLD) return;
        const toKill = pids.slice(0, pids.length - KEEP);
        for (const pid of toKill) {
          if (pid === String(process.pid)) continue;
          exec(`kill -9 ${pid}`);
        }
        console.warn(
          `[reap-watchdog] ${pids.length} next-server instances ditemukan, kill ${toKill.length} yang tertua`
        );
      }
    );
  };

  setInterval(reap, INTERVAL_MS).unref();
}
