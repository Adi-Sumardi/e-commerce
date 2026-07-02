# Entity Relationship Diagram (ERD)
## Aplikasi E-Commerce Online Store

---

## 1. Diagram Relasi (Mermaid)

```mermaid
erDiagram
    USER ||--o{ ADDRESS : has
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--o{ CART : owns
    USER ||--o{ NOTIFICATION : receives
    USER }o--o| WAREHOUSE : "assigned to (staff gudang)"

    CATEGORY ||--o{ CATEGORY : "sub-category"
    CATEGORY ||--o{ PRODUCT : contains

    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT ||--o{ PRODUCT_IMAGE : has
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT }o--o| WAREHOUSE : "default fulfilled by"

    PRODUCT_VARIANT ||--o{ CART_ITEM : "referenced by"
    PRODUCT_VARIANT ||--o{ ORDER_ITEM : "referenced by"
    PRODUCT_VARIANT ||--o{ WAREHOUSE_STOCK : "stock per warehouse"

    WAREHOUSE ||--o{ WAREHOUSE_STOCK : stores
    WAREHOUSE ||--o{ SHIPMENT : "ships from"
    WAREHOUSE ||--o{ ORDER : "fulfilled by"

    CART ||--o{ CART_ITEM : contains

    ORDER ||--|{ ORDER_ITEM : contains
    ORDER ||--o{ PAYMENT : "has (1 utk reguler, 2 jika PO dgn DP)"
    ORDER ||--o| SHIPMENT : has
    ORDER }o--o| VOUCHER : uses
    ORDER ||--o{ ORDER_STATUS_HISTORY : logs
    ORDER }o--|| ADDRESS : "ships to"
    ORDER ||--o{ NOTIFICATION : triggers

    SHIPMENT ||--o{ SHIPMENT_TRACKING : logs

    PAYMENT ||--o{ PAYMENT_LOG : logs

    USER {
        uuid id PK
        string name
        string email UK
        string password_hash
        enum role "CUSTOMER, ADMIN, STAFF_GUDANG, CS"
        boolean is_active
        datetime created_at
    }

    ADDRESS {
        uuid id PK
        uuid user_id FK
        string label
        string recipient_name
        string phone
        string province
        string city
        string district
        string postal_code
        string full_address
        string biteship_area_id
        boolean is_default
    }

    CATEGORY {
        uuid id PK
        uuid parent_id FK
        string name
        string slug UK
    }

    PRODUCT {
        uuid id PK
        uuid category_id FK
        uuid warehouse_id FK "default warehouse asal produk"
        string name
        string slug UK
        text description
        decimal base_price
        decimal weight_grams
        decimal length_cm
        decimal width_cm
        decimal height_cm
        enum status "DRAFT, PUBLISHED, ARCHIVED"
        boolean is_preorder
        enum preorder_payment_type "FULL, DOWN_PAYMENT"
        decimal preorder_dp_percentage "diisi jika DOWN_PAYMENT"
        date preorder_estimated_date
        datetime created_at
    }

    PRODUCT_VARIANT {
        uuid id PK
        uuid product_id FK
        string sku UK
        string name "e.g. Merah / XL"
        decimal price
        int stock
    }

    PRODUCT_IMAGE {
        uuid id PK
        uuid product_id FK
        string url
        int sort_order
    }

    REVIEW {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        int rating
        text comment
        datetime created_at
    }

    CART {
        uuid id PK
        uuid user_id FK
        datetime updated_at
    }

    CART_ITEM {
        uuid id PK
        uuid cart_id FK
        uuid product_variant_id FK
        int quantity
    }

    VOUCHER {
        uuid id PK
        string code UK
        enum type "PERCENTAGE, FIXED"
        decimal value
        decimal min_purchase
        int quota
        datetime start_date
        datetime end_date
    }

    ORDER {
        uuid id PK
        string order_number UK
        uuid user_id FK
        uuid address_id FK
        uuid voucher_id FK
        uuid warehouse_id FK "gudang yang memproses & mengirim order ini"
        enum order_type "REGULAR, PRE_ORDER"
        decimal subtotal
        decimal shipping_cost
        decimal discount
        decimal total
        enum status "PENDING_PAYMENT, PAID, WAITING_STOCK, PROCESSING, SHIPPED, DELIVERED, CANCELLED, EXPIRED, REFUNDED"
        string courier_code
        string courier_service
        datetime created_at
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_variant_id FK
        string product_name_snapshot
        decimal price_snapshot
        int quantity
    }

    ORDER_STATUS_HISTORY {
        uuid id PK
        uuid order_id FK
        enum status
        string note
        datetime created_at
    }

    PAYMENT {
        uuid id PK
        uuid order_id FK
        string xendit_id UK
        enum method "VA, QRIS, EWALLET, INVOICE"
        string channel "e.g. BCA, OVO, DANA"
        enum stage "FULL, DOWN_PAYMENT, FINAL_PAYMENT"
        decimal amount
        enum status "PENDING, PAID, EXPIRED, FAILED, REFUNDED"
        string payment_url
        datetime expired_at
        datetime paid_at
    }

    PAYMENT_LOG {
        uuid id PK
        uuid payment_id FK
        string event_type
        jsonb raw_payload
        datetime created_at
    }

    SHIPMENT {
        uuid id PK
        uuid order_id FK
        string biteship_order_id UK
        string courier_code
        string courier_service
        string waybill_number
        string tracking_url
        enum status "CONFIRMED, ALLOCATED, PICKED_UP, ON_PROCESS, DELIVERED, CANCELLED, RETURNED"
        datetime created_at
    }

    SHIPMENT_TRACKING {
        uuid id PK
        uuid shipment_id FK
        string status
        string description
        datetime event_time
    }

    WAREHOUSE {
        uuid id PK
        string name
        string code UK "e.g. WH-JKT-01"
        string phone
        string province
        string city
        string district
        string postal_code
        string full_address
        string biteship_area_id "origin area utk cek ongkir"
        boolean is_active
        datetime created_at
    }

    WAREHOUSE_STOCK {
        uuid id PK
        uuid warehouse_id FK
        uuid product_variant_id FK
        int stock
    }

    NOTIFICATION {
        uuid id PK
        uuid user_id FK "penerima (staff gudang/admin)"
        uuid order_id FK
        uuid warehouse_id FK
        enum type "NEW_ORDER, ORDER_CANCELLED, STOCK_LOW"
        string title
        string message
        boolean is_read
        datetime created_at
    }
```

---

## 2. Deskripsi Entitas Kunci

| Entitas | Deskripsi |
|---|---|
| `USER` | Menyimpan customer & admin (dibedakan via `role`) |
| `ADDRESS` | Alamat pengiriman customer, menyimpan `biteship_area_id` untuk mempercepat pemanggilan Rate API |
| `PRODUCT` / `PRODUCT_VARIANT` | Produk induk & varian (ukuran/warna) dengan stok & harga masing-masing; berat/dimensi di level produk dipakai untuk hitung ongkir |
| `CART` / `CART_ITEM` | Keranjang belanja aktif per user |
| `ORDER` / `ORDER_ITEM` | Pesanan beserta snapshot harga & nama produk saat transaksi (agar histori tidak berubah jika produk diedit) |
| `ORDER_STATUS_HISTORY` | Audit trail perubahan status order |
| `PAYMENT` / `PAYMENT_LOG` | Data transaksi Xendit & log mentah webhook (untuk debugging/replay). `stage` membedakan pembayaran penuh, DP, atau pelunasan (untuk order Pre-Order) |
| `SHIPMENT` / `SHIPMENT_TRACKING` | Data pengiriman Biteship & histori tracking real-time |
| `VOUCHER` | Kupon diskon |
| `WAREHOUSE` | Data gudang (bisa banyak/multi-lokasi), dikelola Super Admin di menu **Data Gudang**; tiap gudang punya `biteship_area_id` sendiri sebagai titik asal (origin) perhitungan ongkir |
| `WAREHOUSE_STOCK` | Stok per varian produk, dipecah per gudang (menggantikan stok tunggal di `PRODUCT_VARIANT` jika multi-gudang aktif) |
| `NOTIFICATION` | Notifikasi in-app (mis. order baru masuk) yang dikirim ke staff gudang terkait saat ada order baru yang harus diproses |

---

## 3. Catatan Desain

- **Snapshot data** (`product_name_snapshot`, `price_snapshot`) dipakai di `ORDER_ITEM` supaya perubahan harga/nama produk di masa depan tidak mengubah histori order lama.
- **`PAYMENT_LOG`** dan **`SHIPMENT_TRACKING`** menyimpan raw payload webhook (`jsonb`) untuk audit & debugging idempotency.
- Semua **status** sebaiknya berupa Postgres `enum` (via Prisma `enum`) agar konsisten dan tervalidasi di level database.
- Index penting: `order_number`, `email` (unique), `sku` (unique), `xendit_id`, `biteship_order_id`.
- Relasi `ORDER -> SHIPMENT` bersifat 1-to-1 (opsional) pada MVP; bisa diubah ke 1-to-many jika mendukung multi-pengiriman per order di masa depan (split shipment).
- `ORDER -> PAYMENT` bersifat 1-to-many: order reguler/PO full payment hanya punya 1 `PAYMENT` (`stage = FULL`); order PO dengan skema DP punya 2 `PAYMENT` (`stage = DOWN_PAYMENT` lalu `FINAL_PAYMENT`).
- **Multi-gudang**: stok sebenarnya disimpan per gudang di `WAREHOUSE_STOCK` (bukan langsung di `PRODUCT_VARIANT.stock`). Field `stock` di `PRODUCT_VARIANT` bisa dijadikan kolom generated/computed (total dari semua gudang) untuk tampilan ringkas di katalog.
- Saat checkout, sistem menentukan `warehouse_id` order berdasarkan gudang dengan stok tersedia terdekat dari alamat customer (atau default 1 gudang jika toko baru punya 1 lokasi) — logika pemilihan gudang didetailkan di [SRS.md](./SRS.md) §3.12 (FR-13.4).
- Setiap order baru yang `paid` otomatis membuat baris `NOTIFICATION` untuk staff gudang yang terkait dengan `warehouse_id` order tersebut (real-time via Pusher/SSE — lihat [TECHSTACK.md](./TECHSTACK.md#8-notifikasi-real-time-order--dashboard-gudang)).
