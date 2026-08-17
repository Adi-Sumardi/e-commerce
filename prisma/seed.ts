import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // 1. Seed Roles & Users
  const adminPassword = await bcrypt.hash("Admin12345!", 10);
  const admin = await db.user.upsert({
    where: { email: "admin@pratamajaya.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@pratamajaya.com",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  const warehouse = await db.warehouse.upsert({
    where: { code: "WH-JKT-01" },
    update: {},
    create: {
      name: "Gudang Utama Jakarta",
      code: "WH-JKT-01",
      phone: "021-1234567",
      province: "DKI Jakarta",
      city: "Jakarta Pusat",
      district: "Gambir",
      postalCode: "10110",
      fullAddress: "Jl. Merdeka No. 1, Gambir, Jakarta Pusat",
      biteshipAreaId: "loc-12345", // Mock Area ID Biteship
    },
  });

  const staffPassword = await bcrypt.hash("Staff12345!", 10);
  const staff = await db.user.upsert({
    where: { email: "staff.gudang@pratamajaya.com" },
    update: {},
    create: {
      name: "Staff Gudang Jakarta",
      email: "staff.gudang@pratamajaya.com",
      passwordHash: staffPassword,
      role: "STAFF_GUDANG",
    },
  });

  await db.warehouseStaff.upsert({
    where: { warehouseId_userId: { warehouseId: warehouse.id, userId: staff.id } },
    update: {},
    create: { warehouseId: warehouse.id, userId: staff.id },
  });

  const customerPassword = await bcrypt.hash("Customer123!", 10);
  const customer = await db.user.upsert({
    where: { email: "customer@pratamajaya.com" },
    update: {
      name: "Budi Santoso", // Synchronize to memory docs
    },
    create: {
      name: "Budi Santoso",
      email: "customer@pratamajaya.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });

  // 2. Seed Customer Address
  const address = await db.address.upsert({
    where: { id: "addr-customer-1" },
    update: {},
    create: {
      id: "addr-customer-1",
      userId: customer.id,
      label: "Rumah Utama",
      recipientName: "Budi Santoso",
      phone: "081234567890",
      province: "DKI Jakarta",
      city: "Jakarta Pusat",
      district: "Menteng",
      postalCode: "10310",
      fullAddress: "Jl. Merdeka No.1, Menteng, Jakarta Pusat",
      biteshipAreaId: "loc-55555", // Mock Area ID customer
      isDefault: true,
    },
  });

  // 2b. Seed reviewer-only customers (untuk data ulasan yang realistis)
  const reviewerPassword = await bcrypt.hash("Reviewer123!", 10);
  const reviewerAndi = await db.user.upsert({
    where: { email: "andi.wijaya@example.com" },
    update: {},
    create: {
      name: "Andi Wijaya",
      email: "andi.wijaya@example.com",
      passwordHash: reviewerPassword,
      role: "CUSTOMER",
    },
  });
  const reviewerSiska = await db.user.upsert({
    where: { email: "siska.putri@example.com" },
    update: {},
    create: {
      name: "Siska Putri",
      email: "siska.putri@example.com",
      passwordHash: reviewerPassword,
      role: "CUSTOMER",
    },
  });

  // 3. Seed Categories
  const categoriesData = [
    { name: "Elektronik", slug: "elektronik" },
    { name: "Fashion", slug: "fashion" },
    { name: "Rumah Tangga", slug: "rumah-tangga" },
    { name: "Kecantikan", slug: "kecantikan" },
    { name: "Hobi & Gaming", slug: "hobi-gaming" },
    { name: "Sembako", slug: "sembako" },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const record = await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoriesMap[cat.slug] = record.id;
  }

  // 4. Seed Products, Variants, Images & Warehouse Stock
  const productsData = [
    {
      slug: "premium-wireless-headphones-v2",
      name: "Premium Wireless Headphones Noise Cancelling - Raven Black",
      categoryId: categoriesMap["elektronik"],
      description: "Nikmati kualitas audio kelas dunia dengan Pratama Jaya Headphones v2. Dirancang untuk para profesional dan pecinta musik yang tidak ingin berkompromi dengan kualitas. Dilengkapi dengan Active Noise Cancelling (ANC) tingkat lanjut yang mampu meredam kebisingan sekitar hingga 98%, memberikan Anda fokus total dalam setiap nada.",
      basePrice: 2499000,
      compareAtPrice: 3199000, // Diskon ~22%
      weightGrams: 300,
      lengthCm: 20,
      widthCm: 15,
      heightCm: 8,
      status: "PUBLISHED" as const,
      isPreorder: false,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=80",
      ],
      variants: [
        { sku: "HD-RAVEN-BLK", name: "Black", price: 2499000, stock: 100 },
        { sku: "HD-SILVER-WHT", name: "Silver", price: 2499000, stock: 42 },
      ],
      reviews: [
        {
          reviewer: "andi",
          rating: 5,
          comment:
            "Suaranya jernih banget, bass-nya dapet tapi nggak berlebihan. ANC-nya juara buat dipake di kantor yang berisik.",
          daysAgo: 2,
        },
        {
          reviewer: "siska",
          rating: 5,
          comment: "Barang original 100%, garansi resmi. Nyaman dipakai berjam-jam buat meeting.",
          daysAgo: 7,
        },
        {
          reviewer: "customer",
          rating: 4,
          comment: "Kualitas bagus sesuai harga, cuma casingnya agak gampang baret.",
          daysAgo: 14,
        },
      ],
    },
    {
      slug: "smartwatch-series-9",
      name: "Smartwatch Series 9 - 44mm AMOLED Display",
      categoryId: categoriesMap["elektronik"],
      description: "Smartwatch Series 9 dengan layar AMOLED 44mm yang jernih, pemantauan kesehatan detak jantung 24/7, SpO2, GPS internal, dan daya tahan baterai hingga 7 hari.",
      basePrice: 1150000,
      weightGrams: 150,
      lengthCm: 12,
      widthCm: 12,
      heightCm: 6,
      status: "PUBLISHED" as const,
      isPreorder: false,
      images: [
        "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80",
      ],
      variants: [
        { sku: "SW-SERIES9-BLK", name: "44mm Black", price: 1150000, stock: 50 },
      ],
      reviews: [
        {
          reviewer: "customer",
          rating: 5,
          comment: "Baterainya awet banget, GPS akurat buat lari pagi. Puas!",
          daysAgo: 4,
        },
        {
          reviewer: "andi",
          rating: 4,
          comment: "Layarnya jernih, tapi aplikasi pendampingnya kadang lag.",
          daysAgo: 10,
        },
      ],
    },
    {
      slug: "mechanical-keyboard-rgb-tkl",
      name: "Mechanical Keyboard RGB TKL - Blue Switch",
      categoryId: categoriesMap["hobi-gaming"],
      description: "Keyboard mekanis dengan layout Tenkeyless (TKL), backlight RGB dinamis dengan 18 efek pencahayaan, blue switch tactile, dan keycaps double-shot injection.",
      basePrice: 649000,
      compareAtPrice: 799000, // Diskon ~19%
      weightGrams: 800,
      lengthCm: 35,
      widthCm: 15,
      heightCm: 5,
      status: "PUBLISHED" as const,
      isPreorder: false,
      images: [
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=80",
      ],
      variants: [
        { sku: "KB-RGB-TKL-BLUE", name: "Blue Switch", price: 649000, stock: 30 },
      ],
      reviews: [
        {
          reviewer: "siska",
          rating: 5,
          comment: "Suara klik-nya memuaskan, RGB-nya cantik banget buat setup gaming.",
          daysAgo: 3,
        },
      ],
    },
    {
      slug: "ceramic-coffee-dripper-v60",
      name: "Ceramic Coffee Dripper Set V60 - Sand Matte",
      categoryId: categoriesMap["rumah-tangga"],
      description: "Set dripper kopi V60 keramik kualitas premium dengan finishing sand matte. Menjaga retensi panas secara optimal untuk ekstraksi rasa kopi yang sempurna.",
      basePrice: 285000,
      weightGrams: 400,
      lengthCm: 15,
      widthCm: 15,
      heightCm: 15,
      status: "PUBLISHED" as const,
      isPreorder: false,
      images: [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { sku: "CD-V60-SAND", name: "Sand Matte", price: 285000, stock: 15 },
      ],
      reviews: [
        {
          reviewer: "andi",
          rating: 5,
          comment: "Ekstraksinya rata, hasil seduhan lebih smooth dibanding dripper plastik lama saya.",
          daysAgo: 20,
        },
      ],
    },
    {
      slug: "ergochair-pro",
      name: "ErgoChair Pro - Full Mesh Ergonomic Support",
      categoryId: categoriesMap["rumah-tangga"],
      description: "Kursi kantor ergonomis dengan mesh penuh sirkulasi udara optimal. Mendukung postur punggung yang sehat dengan sandaran leher dan tangan yang dapat disesuaikan.",
      basePrice: 3450000,
      weightGrams: 15000,
      lengthCm: 60,
      widthCm: 60,
      heightCm: 120,
      status: "PUBLISHED" as const,
      isPreorder: false,
      images: [
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { sku: "EC-PRO-MESH", name: "Full Mesh", price: 3450000, stock: 10 },
      ],
      reviews: [
        {
          reviewer: "customer",
          rating: 5,
          comment: "Punggung jadi jauh lebih nyaman dipakai WFH 8 jam. Worth it!",
          daysAgo: 30,
        },
        {
          reviewer: "siska",
          rating: 4,
          comment: "Kokoh dan adjustable, tapi perakitannya lumayan lama (~45 menit).",
          daysAgo: 45,
        },
      ],
    },
    {
      slug: "preorder-keyboard-v3",
      name: "Pratama Jaya Mechanical Keyboard Pro V3 (Pre-Order)",
      categoryId: categoriesMap["hobi-gaming"],
      description: "Hanya pre-order: Keyboard mekanis pro generasi terbaru dengan gasket mount, brass plate, lubed stabilizer, hotswappable switch, dan sound dampening foam triple layer.",
      basePrice: 1500000,
      weightGrams: 1200,
      lengthCm: 40,
      widthCm: 18,
      heightCm: 6,
      status: "PUBLISHED" as const,
      isPreorder: true,
      preorderPaymentType: "DOWN_PAYMENT" as const,
      preorderDpPercentage: 30, // 30% Down Payment
      preorderEstimatedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      ],
      variants: [
        { sku: "KB-PROV3-PO", name: "Pro V3 Gasket", price: 1500000, stock: 50 },
      ],
    },
  ];

  const reviewerUsers: Record<string, { id: string }> = {
    customer,
    andi: reviewerAndi,
    siska: reviewerSiska,
  };

  for (const prod of productsData) {
    const { images, variants, reviews, ...prodData } = prod as typeof prod & {
      reviews?: { reviewer: keyof typeof reviewerUsers; rating: number; comment: string; daysAgo: number }[];
    };

    const record = await db.product.upsert({
      where: { slug: prod.slug },
      update: {
        ...prodData,
        warehouseId: warehouse.id,
      },
      create: {
        ...prodData,
        warehouseId: warehouse.id,
      },
    });

    // Clear and re-create images
    await db.productImage.deleteMany({ where: { productId: record.id } });
    for (let i = 0; i < images.length; i++) {
      await db.productImage.create({
        data: {
          productId: record.id,
          url: images[i],
          sortOrder: i,
        },
      });
    }

    // Seed variants & stock
    for (const v of variants) {
      const variantRecord = await db.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          productId: record.id,
          sku: v.sku,
          name: v.name,
          price: v.price,
          stock: v.stock,
        },
      });

      // Seed warehouse stocks
      await db.warehouseStock.upsert({
        where: {
          warehouseId_productVariantId: {
            warehouseId: warehouse.id,
            productVariantId: variantRecord.id,
          },
        },
        update: {
          stock: v.stock,
        },
        create: {
          warehouseId: warehouse.id,
          productVariantId: variantRecord.id,
          stock: v.stock,
        },
      });
    }

    // Seed reviews (hapus dulu biar re-run seed tidak duplikat)
    await db.review.deleteMany({ where: { productId: record.id } });
    for (const r of reviews ?? []) {
      const reviewer = reviewerUsers[r.reviewer];
      await db.review.create({
        data: {
          productId: record.id,
          userId: reviewer.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // 5. Seed Banner Homepage
  const bannersData = [
    {
      badgeText: "Flash Sale Juli",
      title: "Diskon Hingga 70% Audio Premium",
      subtitle: "Dapatkan headphone dan speaker impianmu dengan harga termurah. Gratis ongkir se-Indonesia!",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
      ctaLabel: "Belanja Sekarang",
      ctaLink: "/products?category=elektronik",
      sortOrder: 0,
      isActive: true,
    },
    {
      badgeText: "Gaming Gear",
      title: "Keyboard & Aksesoris Gaming Mulai 649rb",
      subtitle: null,
      imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80",
      ctaLabel: null,
      ctaLink: "/products?category=hobi-gaming",
      sortOrder: 1,
      isActive: true,
    },
    {
      badgeText: "New Arrival",
      title: "Smartwatch Series 9 AMOLED — Rp 1.150.000",
      subtitle: null,
      imageUrl: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80",
      ctaLabel: null,
      ctaLink: "/products/smartwatch-series-9",
      sortOrder: 2,
      isActive: true,
    },
  ];

  for (const banner of bannersData) {
    const existing = await db.banner.findFirst({ where: { title: banner.title } });
    if (existing) {
      await db.banner.update({ where: { id: existing.id }, data: banner });
    } else {
      await db.banner.create({ data: banner });
    }
  }

  // 6. Seed Rekening Transfer Manual (Xendit belum diaktifkan)
  const paymentChannelsData = [
    {
      type: "BANK_TRANSFER" as const,
      label: "BCA - Pratama Jaya",
      bankName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "PT Pratama Jaya Sejahtera",
      instructions: "Konfirmasi ke WhatsApp 0812-8586-9280 setelah transfer.",
      sortOrder: 0,
      isActive: true,
    },
    {
      type: "BANK_TRANSFER" as const,
      label: "Mandiri - Pratama Jaya",
      bankName: "Mandiri",
      accountNumber: "0987654321",
      accountHolder: "PT Pratama Jaya Sejahtera",
      instructions: null,
      sortOrder: 1,
      isActive: true,
    },
  ];

  for (const channel of paymentChannelsData) {
    const existing = await db.paymentChannel.findFirst({ where: { label: channel.label } });
    if (existing) {
      await db.paymentChannel.update({ where: { id: existing.id }, data: channel });
    } else {
      await db.paymentChannel.create({ data: channel });
    }
  }

  console.log("Seed selesai:");
  console.log("- Super Admin :", admin.email, "/ Admin12345!");
  console.log("- Staff Gudang:", staff.email, "/ Staff12345!");
  console.log("- Customer    :", customer.email, "/ Customer123!");
  console.log("- Alamat Customer di-seed");
  console.log("- Kategori & Produk di-seed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
