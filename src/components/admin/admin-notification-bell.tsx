"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  orderId: string | null;
  createdAt: string;
}

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastCount, setLastCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok || cancelled) return;
        const data: NotificationItem[] = await res.json();

        if (data.length > lastCount && lastCount > 0) {
          toast.info(`🔔 ${data[0].title}`, { description: data[0].message, duration: 6000 });
        }
        setNotifications(data);
        setLastCount(data.length);
      } catch {
        // Diamkan — polling akan retry otomatis di interval berikutnya.
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOpenNotification(notification: NotificationItem) {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notification.id] }),
      });
    } catch {
      // Abaikan — statusnya masih akan ke-refresh polling berikutnya.
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    router.push("/admin/orders");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button aria-label="Notifikasi" className="relative cursor-pointer transition-colors hover:text-primary">
            <Bell className="size-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border-2 border-card bg-destructive text-[9px] font-bold text-white">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">Tidak ada notifikasi baru.</p>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleOpenNotification(notification)}
              className="flex-col items-start gap-0.5 whitespace-normal py-2 cursor-pointer"
            >
              <span className="font-semibold">{notification.title}</span>
              <span className="text-xs text-muted-foreground">{notification.message}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
