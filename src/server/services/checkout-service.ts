import { AddressRepository } from "@/server/repositories/address-repository";
import { OrderRepository } from "@/server/repositories/order-repository";
import { ProductRepository } from "@/server/repositories/product-repository";
import { db } from "@/lib/db";
import { getBiteshipRates, BiteshipRateItem } from "@/lib/biteship";
import { calculateDiscountedShippingCost } from "@/lib/shipping";
import { xenditClient } from "@/lib/xendit";
import { PaymentMethod, PaymentStage, OrderType, OrderStatus } from "@prisma/client";

export class CheckoutService {
  static async getActivePaymentChannels() {
    return db.paymentChannel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getCheckoutData(userId: string, items: { productVariantId: string; quantity: number }[]) {
    const paymentChannels = await this.getActivePaymentChannels();

    // 1. Fetch user default address
    const defaultAddress = await AddressRepository.findDefaultByUserId(userId);
    if (!defaultAddress) {
      return {
        address: null,
        shippingOptions: [],
        paymentChannels,
      };
    }

    // 2. Prepare items for Biteship, dan tentukan gudang asal dari produk itu sendiri
    //    (bukan hardcode WH-JKT-01 lagi — tiap produk wajib punya warehouseId sendiri
    //    sejak form produk admin mewajibkan pemilihan gudang).
    const biteshipItems: BiteshipRateItem[] = [];
    let totalWeight = 0;
    let originWarehouseId: string | null = null;
    const distinctWarehouseIds = new Set<string>();

    for (const item of items) {
      const variant = await ProductRepository.findVariantById(item.productVariantId);
      if (!variant) continue;
      const weight = Number(variant.product.weightGrams) || 200;
      totalWeight += weight * item.quantity;

      if (variant.product.warehouseId) {
        distinctWarehouseIds.add(variant.product.warehouseId);
        if (!originWarehouseId) originWarehouseId = variant.product.warehouseId;
      }

      biteshipItems.push({
        name: `${variant.product.name} - ${variant.name}`,
        value: Number(variant.price ?? variant.product.basePrice),
        weight,
        quantity: item.quantity,
      } as any); // cast safely
    }

    if (distinctWarehouseIds.size > 1) {
      // Keranjang campur produk dari beberapa gudang — order masih dikirim dari satu
      // titik saja (Order.warehouseId tunggal), jadi ongkir dihitung dari gudang produk
      // pertama di keranjang. Split pengiriman per gudang belum didukung.
      console.warn(
        `Checkout: keranjang berisi produk dari ${distinctWarehouseIds.size} gudang berbeda, ongkir dihitung dari gudang produk pertama.`
      );
    }

    const warehouse = originWarehouseId
      ? await db.warehouse.findUnique({ where: { id: originWarehouseId } })
      : await db.warehouse.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" } });

    if (!warehouse || !warehouse.biteshipAreaId || !defaultAddress.biteshipAreaId) {
      return {
        address: defaultAddress,
        shippingOptions: this.getMockShippingOptions(defaultAddress),
        paymentChannels,
      };
    }

    try {
      // If we don't have api key, throw to use mock
      if (!process.env.BITESHIP_API_KEY) {
        throw new Error("No Biteship API Key");
      }

      const ratesResult = await getBiteshipRates({
        originAreaId: warehouse.biteshipAreaId,
        destinationAreaId: defaultAddress.biteshipAreaId,
        items: biteshipItems as any,
        couriers: "jne,jnt,sicepat",
      });

      if (ratesResult && ratesResult.pricing) {
        return {
          address: defaultAddress,
          shippingOptions: ratesResult.pricing.map((price: any) => {
            const rawPrice = Number(price.price) || 0;
            const discounted = calculateDiscountedShippingCost(
              rawPrice,
              defaultAddress.province,
              defaultAddress.city,
              defaultAddress.district
            );
            return {
              id: `${price.courier_code}_${price.courier_service}`,
              name: `${price.courier_name} (${price.courier_service})`,
              eta: price.duration || "Estimasi 2-3 Hari",
              price: discounted.discountedPrice,
              originalPrice: discounted.originalPrice,
              isFreeShipping: discounted.isFreeShipping,
            };
          }),
          paymentChannels,
        };
      }

      throw new Error("Biteship pricing format invalid");
    } catch (error) {
      console.warn("Biteship API failed, falling back to mock options:", error);
      return {
        address: defaultAddress,
        shippingOptions: this.getMockShippingOptions(defaultAddress),
        paymentChannels,
      };
    }
  }

  private static getMockShippingOptions(address?: any) {
    const rawOptions = [
      { id: "jne_reg", name: "JNE Reguler", eta: "Estimasi 2-3 Hari", price: 18000 },
      { id: "jnt_ez", name: "J&T Express", eta: "Estimasi 1-2 Hari", price: 22000 },
      { id: "sicepat_reg", name: "SiCepat REG", eta: "Estimasi 2-4 Hari", price: 17500 },
    ];

    if (!address) return rawOptions;

    return rawOptions.map((opt) => {
      const discounted = calculateDiscountedShippingCost(
        opt.price,
        address.province,
        address.city,
        address.district
      );
      return {
        ...opt,
        price: discounted.discountedPrice,
        originalPrice: discounted.originalPrice,
        isFreeShipping: discounted.isFreeShipping,
      };
    });
  }

  static async placeOrder(params: {
    userId: string;
    addressId: string;
    courierId: string; // e.g. "jne_reg"
    courierName: string; // e.g. "JNE Reguler"
    courierPrice: number;
    paymentMethod: "va" | "qris" | "gopay" | "manual_transfer";
    paymentChannelId?: string | null;
    preorderScheme: "full" | "dp";
    items: { productVariantId: string; quantity: number }[];
    email: string;
    voucherId?: string | null;
    discount?: number;
  }) {
    // 1. Fetch default address & products to check stock and calculate subtotal
    const address = await AddressRepository.findById(params.addressId);
    if (!address) throw new Error("Alamat pengiriman tidak ditemukan.");

    let subtotal = 0;
    const orderItemsInput: any[] = [];
    let isPreorder = false;
    // Gudang tujuan pengiriman order ditentukan dari gudang produk pertama di
    // keranjang (bukan hardcode WH-JKT-01 lagi) — lihat catatan split-gudang di
    // getCheckoutData di atas kalau keranjang berisi produk dari beberapa gudang.
    let warehouseId: string | null = null;

    for (const cartItem of params.items) {
      const variant = await ProductRepository.findVariantById(cartItem.productVariantId);
      if (!variant) throw new Error(`Varian produk ${cartItem.productVariantId} tidak ditemukan.`);

      if (variant.product.isPreorder) {
        isPreorder = true;
      }
      if (!warehouseId && variant.product.warehouseId) {
        warehouseId = variant.product.warehouseId;
      }

      const price = Number(variant.price);
      subtotal += price * cartItem.quantity;

      orderItemsInput.push({
        productVariantId: variant.id,
        productNameSnapshot: `${variant.product.name} (${variant.name})`,
        priceSnapshot: price,
        quantity: cartItem.quantity,
      });
    }

    const shippingCost = params.courierPrice;
    const discount = params.discount ?? 0;
    const total = Math.max(0, subtotal + shippingCost - discount);

    // Preorder payment amount calculations
    let paymentAmount = total;
    let paymentStage: PaymentStage = PaymentStage.FULL;

    if (isPreorder && params.preorderScheme === "dp") {
      // DP 30% of total
      paymentAmount = Math.round(total * 0.3);
      paymentStage = PaymentStage.DOWN_PAYMENT;
    }

    // Create Order Number placeholder
    const orderNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    let method: PaymentMethod;
    let channelLabel: string | null = null;
    let xenditInvoiceId: string | undefined;
    let paymentUrl: string = "";
    let expiredAt: Date | undefined;

    if (params.paymentMethod === "manual_transfer") {
      // Xendit belum diaktifkan (lihat docs/MEMORY.md) — pembayaran diverifikasi manual
      // oleh admin lewat rekening/QRIS yang dikelola di /admin/settings.
      if (!params.paymentChannelId) {
        throw new Error("Silakan pilih rekening/QRIS tujuan transfer.");
      }
      const channel = await db.paymentChannel.findUnique({ where: { id: params.paymentChannelId } });
      if (!channel || !channel.isActive) {
        throw new Error("Metode pembayaran yang dipilih tidak tersedia.");
      }
      method = PaymentMethod.MANUAL_TRANSFER;
      channelLabel = channel.label;
      // paymentUrl diisi setelah order dibuat (butuh order.id), lihat di bawah.
    } else {
      // Jalur Xendit (VA/QRIS/E-Wallet) — dormant sampai XENDIT_SECRET_KEY dikonfigurasi,
      // fallback ke mock-payment kalau belum ada key/gagal panggil API.
      method = PaymentMethod.VA;
      if (params.paymentMethod === "qris") method = PaymentMethod.QRIS;
      else if (params.paymentMethod === "gopay") method = PaymentMethod.EWALLET;

      xenditInvoiceId = `mock-xendit-${Date.now()}`;
      paymentUrl = `/checkout/mock-payment?order_number=${orderNumber}&amount=${paymentAmount}`;
      expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

      if (process.env.XENDIT_SECRET_KEY) {
        try {
          const response = await xenditClient.Invoice.createInvoice({
            data: {
              externalId: orderNumber,
              amount: paymentAmount,
              payerEmail: params.email,
              description: `Pembayaran Pratama Jaya - ${orderNumber}`,
              successRedirectUrl: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/track-order-success?order_number=${orderNumber}`,
              failureRedirectUrl: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/checkout`,
            },
          });

          if (response && response.id && response.invoiceUrl) {
            xenditInvoiceId = response.id;
            paymentUrl = response.invoiceUrl;
            if (response.expiryDate) {
              expiredAt = new Date(response.expiryDate);
            }
          }
        } catch (err) {
          console.warn("Xendit API creation failed, using mock payment URL:", err);
        }
      }
    }

    // Save to Database
    const { order, payment } = await OrderRepository.createOrder({
      userId: params.userId,
      addressId: params.addressId,
      warehouseId,
      orderType: isPreorder ? OrderType.PRE_ORDER : OrderType.REGULAR,
      subtotal,
      shippingCost,
      discount,
      total,
      courierCode: params.courierId.split("_")[0] || "jne",
      courierService: params.courierId.split("_")[1] || "reg",
      voucherId: params.voucherId,
      items: orderItemsInput,
      payment: {
        method,
        channel: channelLabel,
        paymentChannelId: params.paymentMethod === "manual_transfer" ? params.paymentChannelId : null,
        amount: paymentAmount,
        stage: paymentStage,
        xenditId: xenditInvoiceId,
        paymentUrl,
        expiredAt,
      } as any,
    });

    if (params.paymentMethod === "manual_transfer") {
      // Instruksi pembayaran & upload bukti transfer ada di halaman detail order.
      paymentUrl = `/orders/${order.id}`;
      await db.payment.update({ where: { id: payment.id }, data: { paymentUrl } });
    } else if (paymentUrl?.startsWith("/checkout/mock-payment")) {
      // Make sure we update the payment URL with the real payment ID if it's mock
      paymentUrl = `${paymentUrl}&payment_id=${payment.id}`;
      await db.payment.update({
        where: { id: payment.id },
        data: { paymentUrl },
      });
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl,
    };
  }
}
