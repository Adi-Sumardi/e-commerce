"use client";

import { useEffect, useState } from "react";
import { CircleAlert, X } from "lucide-react";
import { toast } from "sonner";

interface NotificationBannerProps {
  warehouseId: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export function NotificationBanner({ warehouseId }: NotificationBannerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/admin/notifications?warehouseId=${warehouseId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setNotifications(data);
            setBannerOpen(true);

            // If a new notification has arrived, trigger a Toast and sound alert (if possible)
            if (data.length > lastCount) {
              const latest = data[0];
              toast.info(`🔔 ${latest.title}`, {
                description: latest.message,
                duration: 6000,
              });
              setLastCount(data.length);
            }
          } else {
            setNotifications([]);
            setBannerOpen(false);
            setLastCount(0);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [warehouseId, lastCount]);

  const handleDismiss = async () => {
    setBannerOpen(false);
    const ids = notifications.map((n) => n.id);
    if (ids.length > 0) {
      try {
        const res = await fetch("/api/admin/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationIds: ids }),
        });
        if (res.ok) {
          setNotifications([]);
          setLastCount(0);
        }
      } catch (err) {
        console.warn("Failed to mark notifications as read:", err);
      }
    }
  };

  if (!bannerOpen || notifications.length === 0) {
    return null;
  }

  const latest = notifications[0];

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-4">
        <CircleAlert className="size-5 text-primary shrink-0" />
        <p className="text-sm">
          <strong>{latest.title}:</strong> {latest.message}{" "}
          {notifications.length > 1 && (
            <span className="text-xs font-semibold text-primary ml-1">
              (+{notifications.length - 1} order baru lainnya)
            </span>
          )}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground cursor-pointer rounded p-1 hover:bg-muted"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
