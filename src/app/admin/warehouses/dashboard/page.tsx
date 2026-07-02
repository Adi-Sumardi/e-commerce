import Image from "next/image";
import { redirect } from "next/navigation";
import {
  CircleAlert,
  ClipboardCheck,
  MapPin,
  Package,
  PackagePlus,
  Plane,
  Printer,
  Truck,
  Bike,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderRepository } from "@/server/repositories/order-repository";
import { OrderStatus } from "@prisma/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Badge } from "@/components/ui/badge";
import { NotificationBanner } from "./notification-banner";
import { OrderCardButtons } from "./order-card-buttons";

const COURIER_ICONS = {
  truck: Truck,
  motorcycle: Bike,
  plane: Plane,
  cargo: Package,
} as const;

export default async function WarehouseDashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;
  if (!user.id) {
    redirect("/login");
  }

  // 1. Fetch user warehouse
  let staffRelation = await db.warehouseStaff.findFirst({
    where: { userId: user.id },
    include: { warehouse: true },
  });

  let warehouse = staffRelation?.warehouse;

  // Fallback to the first warehouse if none is assigned (e.g. for Super Admin testing)
  if (!warehouse && user.role === "SUPER_ADMIN") {
    warehouse = (await db.warehouse.findFirst()) || undefined;
  }

  if (!warehouse) {
    return (
      <>
        <AdminTopbar />
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-8 text-center">
          <CircleAlert className="size-16 text-muted-foreground/30 animate-pulse" />
          <h1 className="text-2xl font-bold text-foreground">Tidak Ada Gudang Ditugaskan</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Akun Anda belum ditugaskan ke salah satu gudang terdaftar. Hubungi Super Admin untuk penugasan gudang.
          </p>
        </div>
      </>
    );
  }

  // 2. Fetch order queue
  const orders = await OrderRepository.findQueueByWarehouseId(warehouse.id);

  // 3. Calculate statistics
  const newOrdersCount = orders.filter((o) => o.status === OrderStatus.PAID).length;
  const processingCount = orders.filter(
    (o) => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.WAITING_STOCK
  ).length;

  return (
    <>
      <AdminTopbar />
      <div className="relative flex-1 space-y-8 overflow-y-auto p-4 lg:p-8">
        {/* Header stats & info */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span className="text-xs tracking-widest uppercase font-bold text-primary">
                {warehouse.name} - {warehouse.code}
              </span>
            </div>
            <h1 className="text-3xl font-semibold">Antrean Pemrosesan Order</h1>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center rounded-xl border border-border bg-muted px-4 py-2 min-w-[80px]">
              <span className="text-sm font-bold text-primary">{newOrdersCount}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Order Baru</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-border bg-muted px-4 py-2 min-w-[80px]">
              <span className="text-sm font-bold text-secondary">{processingCount}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Diproses</span>
            </div>
          </div>
        </div>

        {/* Real-time notification banner */}
        <NotificationBanner warehouseId={warehouse.id} />

        {/* Order queue grid */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-24 text-center">
            <Package className="mb-4 size-16 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold text-muted-foreground">Antrean Bersih</h2>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Semua order telah diproses. Belum ada order baru masuk di gudang ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => {
              const isNew = order.status === OrderStatus.PAID;
              const statusLabel = isNew ? "Order Baru" : "Diproses";
              const actionLabel = isNew ? "Proses & Buat Pengiriman" : "Cetak Label Pengiriman";

              // Pick courier icon mapping
              let courierIcon: "truck" | "motorcycle" | "plane" | "cargo" = "truck";
              const lowerCourier = order.courierCode?.toLowerCase() || "";
              if (lowerCourier.includes("gosend") || lowerCourier.includes("grab")) {
                courierIcon = "motorcycle";
              } else if (lowerCourier.includes("cargo")) {
                courierIcon = "cargo";
              }

              const CourierIcon = COURIER_ICONS[courierIcon];

              return (
                <div
                  key={order.id}
                  className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 transition-transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <Badge
                      className={
                        isNew
                          ? "bg-primary/10 hover:bg-primary/10 text-[10px] font-bold text-primary uppercase"
                          : "bg-secondary/10 hover:bg-secondary/10 text-[10px] font-bold text-secondary uppercase"
                      }
                    >
                      {statusLabel}
                    </Badge>
                  </div>

                  <div className="space-y-2 border-y border-border/30 py-2 flex-1">
                    {order.items.map((item) => {
                      const variant = item.productVariant;
                      const image =
                        variant?.product?.images[0]?.url ??
                        "https://placehold.co/96x96/e2e8f0/64748b/png?text=Product";
                      return (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                            <Image
                              src={image}
                              alt={item.productNameSnapshot}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-sm text-foreground">
                              {item.productNameSnapshot}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} x {variant?.name || "Standard Varian"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                      <Truck className="size-4 shrink-0" />
                      <span className="truncate">
                        Tujuan: <strong>{order.address.city}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <CourierIcon className="size-4 text-secondary" />
                      <span className="font-bold text-secondary uppercase text-[10px]">
                        {order.courierCode} {order.courierService}
                      </span>
                    </div>
                  </div>

                  <OrderCardButtons
                    orderId={order.id}
                    status={order.status}
                    actionLabel={actionLabel}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="border-t border-border bg-accent px-4 py-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 Pratama Jaya Indonesia. Warehouse Management System v2.4.1
          </p>
          <div className="flex gap-6">
            <a className="text-xs text-muted-foreground underline hover:text-primary" href="#">
              Panduan Logistik
            </a>
            <a className="text-xs text-muted-foreground underline hover:text-primary" href="#">
              Dukungan
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
