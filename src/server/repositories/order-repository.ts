import { db } from "@/lib/db";
import { OrderStatus, PaymentMethod, PaymentStage, PaymentStatus, OrderType } from "@prisma/client";

export interface CreateOrderInput {
  userId: string;
  addressId: string;
  warehouseId: string | null;
  orderType: OrderType;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  courierCode: string;
  courierService: string;
  voucherId?: string | null;
  items: {
    productVariantId: string;
    productNameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
  }[];
  payment: {
    method: PaymentMethod;
    amount: number;
    stage: PaymentStage;
    xenditId?: string;
    paymentUrl?: string;
    expiredAt?: Date;
    paymentChannelId?: string | null;
  };
}

export class OrderRepository {
  static async createOrder(input: CreateOrderInput) {
    const orderNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    return db.$transaction(async (tx) => {
      // If a voucher is used, decrement its quota
      if (input.voucherId) {
        const voucher = await tx.voucher.findUnique({
          where: { id: input.voucherId },
        });
        if (voucher) {
          if (voucher.quota <= 0) {
            throw new Error("Kuota voucher ini sudah habis.");
          }
          await tx.voucher.update({
            where: { id: input.voucherId },
            data: { quota: { decrement: 1 } },
          });
        }
      }

      // 1. Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: input.userId,
          addressId: input.addressId,
          warehouseId: input.warehouseId,
          voucherId: input.voucherId || null,
          orderType: input.orderType,
          subtotal: input.subtotal,
          shippingCost: input.shippingCost,
          discount: input.discount,
          total: input.total,
          status: OrderStatus.PENDING_PAYMENT,
          courierCode: input.courierCode,
          courierService: input.courierService,
          items: {
            create: input.items.map((item) => ({
              productVariantId: item.productVariantId,
              productNameSnapshot: item.productNameSnapshot,
              priceSnapshot: item.priceSnapshot,
              quantity: item.quantity,
            })),
          },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING_PAYMENT,
              note: "Pesanan dibuat, menunggu pembayaran.",
            },
          },
        },
      });

      // 2. Create the payment record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          method: input.payment.method,
          amount: input.payment.amount,
          stage: input.payment.stage,
          paymentChannelId: input.payment.paymentChannelId || null,
          status: PaymentStatus.PENDING,
          xenditId: input.payment.xenditId,
          paymentUrl: input.payment.paymentUrl,
          expiredAt: input.payment.expiredAt,
        },
      });

      return { order, payment };
    });
  }

  static async findById(id: string) {
    return db.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: "desc" },
          include: { paymentChannel: true },
        },
        shipment: {
          include: {
            tracking: {
              orderBy: { eventTime: "desc" },
            },
          },
        },
        address: true,
        user: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async findByUserId(userId: string) {
    return db.order.findMany({
      where: { userId },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findQueueByWarehouseId(warehouseId: string) {
    return db.order.findMany({
      where: {
        warehouseId,
        status: {
          in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.WAITING_STOCK],
        },
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: { sortOrder: "asc" },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
