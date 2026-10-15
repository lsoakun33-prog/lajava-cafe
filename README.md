# ☕ NOIR F&B — Real-Time Self-Order System with QR Code Integration

Sistem pemesanan mandiri (*Self-Order Kiosk & Table Ordering*) untuk industri F&B (Food & Beverages) modern dengan arsitektur **Real-Time WebSockets**, integrasi **Dynamic QR Code Generator & Scanner**, dan antarmuka bertema **Monokrom Hitam-Putih (Noir Luxury Minimalist)** yang bersih, responsif, dan siap di-*deploy* ke *production*.

---

## 🌟 Fitur Utama

### 1. 📱 Role Pelanggan (Customer / User View)
* **Integrasi QR Code Meja**:
  * Pindai QR Code di meja menggunakan kamera (*built-in web camera QR scanner*) atau URL otomatis: `/?table=Meja%2001`.
  * Informasi nomor meja langsung terkunci pada saat memesan.
* **Katalog Menu Interaktif**:
  * Filter kategori: *Coffee & Espresso*, *Non-Coffee & Tea*, *Artisan Bakery & Pastry*, *Signature Mains & Bites*.
  * Pencarian instan berdasarkan nama menu atau deskripsi rasa.
  * Status stok *real-time* (Tersedia / Habis) yang tersinkronisasi langsung saat admin mengubah stok di dapur.
* **Kustomisasi & Catatan Pesanan**:
  * Modal detail item dengan pengatur jumlah (*quantity*) dan *special notes* (contoh: *"Less sugar, es sedikit"* atau *"Jangan pedas"*).
* **Keranjang & Checkout**:
  * Input nama pemesan dan catatan umum ke kasir/dapur.
  * Pilihan metode pembayaran: **Bayar di Kasir (Cash / Debit)** atau **QRIS Instant (Simulasi scan QR real-time)**.
  * Penghitungan otomatis Subtotal + Pajak Resto PB1 (10%) + Total Bayar.
* **Pelacakan Status Pesanan Real-Time (Live Order Stepper)**:
  * Pembaruan status instan via WebSockets tanpa perlu refresh:
    1. **Menunggu Konfirmasi** (Pending)
    2. **Sedang Dimasak** (Preparing)
    3. **Siap Disajikan / Diantar** (Ready) — dilengkapi efek perayaan *confetti*
    4. **Selesai** (Completed)
* **Cetak Struk Pembelian**:
  * Fitur cetak struk berformat kasir *thermal printer* monochrome dengan tombol *Print*.

---

### 2. 👨‍🍳 Role Admin & Dapur (Kitchen Display System / KDS)
* **Autentikasi Terproteksi**:
  * Login admin aman berbasis JWT (*JSON Web Token*) dan *bcrypt password hashing*.
  * Akun Default: `admin` / `admin123`.
* **Live Orders Board (Kitchen Display System)**:
  * Begitu pelanggan mengirim pesanan di meja, kartu pesanan langsung muncul seketika di layar dapur dengan **Audio Chime Alert** (suara bel *synthesizer* Web Audio API).
  * Filter status: *Semua*, *Menunggu*, *Dimasak*, *Siap Saji*, *Selesai*, *Dibatalkan*.
  * Aksi satu klik: *"Terima & Masak"*, *"Tandai Siap"*, *"Selesaikan"*, *"Batalkan"*, *"Cetak Struk"*.
  * *Quick toggle* status pembayaran: Lunas (PAID) / Belum Lunas (UNPAID).
* **Manajemen Menu & Stok F&B (CRUD)**:
  * Tambah menu baru lengkap dengan kategori, harga, estimasi waktu masak (*prep time*), deskripsi, dan foto (tersedia pilihan *photo presets* berkualitas tinggi).
  * Edit data menu & hapus menu.
  * **Instant Stock Toggle**: Saklar satu klik *"Tersedia"* $\leftrightarrow$ *"Habis"* yang langsung mengubah status menu di layar seluruh pelanggan yang sedang membuka web secara *real-time*.
* **Generator QR Code Meja (Table Management)**:
  * Kelola meja restoran (Meja 01 s/d Meja 10, VIP Room, dsb.).
  * Setiap meja memiliki QR Code unik yang ter-*generate* otomatis sebagai gambar beresolusi tinggi.
  * Fitur **Unduh PNG** dan **Cetak Kartu Meja (Print Layout)** siap tempel di atas meja pelanggan.
  * Fitur *Direct Order Link* untuk simulasi cepat tanpa kamera.
* **Analitik & Laporan Penjualan**:
  * Ringkasan KPI: *Total Pendapatan*, *Pesanan Hari Ini*, *Pesanan Aktif*, *Pesanan Selesai*.
  * *Leaderboard* Top 5 Menu Paling Laris berdasarkan kuantitas porsi dan pendapatan.

---

### 3. 🎨 Tema UI/UX: Hitam Putih (Noir Monochrome Minimalist)
* Palet warna eksklusif: *Deep Pitch Black* (`#000000`, `#09090b`), *High-Contrast White* (`#ffffff`), aksen *Subtle Zinc* (`#27272a`, `#52525b`, `#a1a1aa`).
* Tipografi modern menggunakan *Plus Jakarta Sans* dan *JetBrains Mono*.
* *Mobile-first responsive layout* untuk pelanggan smartphone dan *fluid grid responsive* untuk tablet/desktop kasir dan dapur.

---

## 🏗️ Arsitektur Teknologi

```
┌────────────────────────────────────────────────────────┐
│                      CLIENT (FRONTEND)                 │
│   React 19 + Vite + Tailwind CSS v4 + Lucide Icons     │
│   Socket.IO Client + Web Audio API + HTML5 QR Code     │
└───────────────────────────┬────────────────────────────┘
                            │  HTTP REST / WebSocket (Real-Time)
┌───────────────────────────▼────────────────────────────┐
│                      SERVER (BACKEND)                  │
│       Node.js + Express 5 + Socket.IO + QRCode         │
│          JWT Auth + Bcrypt + SQLite Engine             │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    DATABASE (SQLITE)                   │
│      better-sqlite3 (WAL Mode, Transactions, Foreign Keys)
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Panduan Menjalankan di Lokal (Local Development)

### 1. Prasyarat
* Node.js versi 18 atau lebih baru.
* npm (sudah bawaan dari Node.js).

### 2. Instalasi Dependensi
Cukup jalankan satu perintah di folder utama proyek:
```bash
npm run postinstall
```
*Perintah di atas akan memastikan dependensi client dan server terinstal sempurna.*

### 3. Jalankan Aplikasi (Fullstack Mode)
Jalankan satu perintah untuk menyalakan Backend & Frontend secara bersamaan:
```bash
npm run dev
```

Terminal akan membuka:
* 🌐 **Server Backend & WebSocket**: `http://localhost:5000`
* 💻 **Client Web (Vite Dev)**: `http://localhost:5173`

---

## 🧪 Skenario Pengujian (Testing Roles)

1. **Buka Tampilan Pelanggan**:
   * Kunjungi `http://localhost:5173/?table=Meja%2001` di browser atau HP Anda.
   * Pilih beberapa menu (misal *Monochrome Charcoal Latte* dan *Black Angus Truffle Burger*).
   * Tambahkan catatan khusus dan lakukan *Checkout*.
2. **Buka Tampilan Admin di Tab / Jendela Terpisah**:
   * Kunjungi `http://localhost:5173/#admin` atau klik ikon perisai di pojok kanan atas.
   * Login dengan kredensial:
     * **Username**: `admin`
     * **Password**: `admin123`
3. **Uji Real-Time**:
   * Saat pelanggan menekan *"Kirim Pesanan Sekarang"*, tab Admin seketika membunyikan suara bel *"Ting!"* dan menampilkan kartu pesanan baru tanpa perlu me-refresh halaman!
   * Di tab Admin, klik *"Terima & Masak"*, lalu *"Tandai Siap"*.
   * Lihat pada tab Pelanggan: status *stepper progress* langsung berpindah secara *real-time* dan merayakan dengan efek *confetti*!
   * Di tab Admin, coba matikan stok salah satu kopi di tab *"Kelola Menu"*: di tab Pelanggan menu tersebut langsung berstatus *"Habis"* secara instan.

---

## 🌐 Panduan Publikasi / Deploy ke Server (Production)

Proyek ini dirancang agar dapat di-deploy dengan sangat mudah ke platform seperti **Render**, **Railway**, atau **VPS (Virtual Private Server)**:

### Opsi A: Deploy 1-Service (Render / Railway / Fly.io)
Karena backend Express sudah dikonfigurasi untuk menyajikan *static build* frontend secara otomatis dari folder `client/dist`, Anda hanya perlu 1 layanan:
1. Hubungkan repository GitHub Anda ke [Render.com](https://render.com) atau [Railway.app](https://railway.app).
2. Tentukan pengaturan *Build & Start Command*:
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
3. Variabel Lingkungan (*Environment Variables*):
   * `PORT`: `5000` (atau port otomatis penyedia)
   * `JWT_SECRET`: `rahasia_jwt_produksi_anda`
   * `NODE_ENV`: `production`

---

## 📚 Struktur Direktori Proyek

```
website-dengan-integrasi-qr-code/
├── client/                      # Frontend React + Vite
│   ├── src/
│   │   ├── components/          # Komponen UI Pelanggan & Umum
│   │   │   ├── Header.jsx
│   │   │   ├── CategoryFilter.jsx
│   │   │   ├── MenuItemCard.jsx
│   │   │   ├── ItemModal.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── OrderStatusModal.jsx
│   │   │   ├── QRScannerModal.jsx
│   │   │   └── ReceiptModal.jsx
│   │   ├── components/admin/    # Komponen Khusus Admin & KDS
│   │   │   ├── AdminHeader.jsx
│   │   │   ├── OrdersTab.jsx
│   │   │   ├── MenuTab.jsx
│   │   │   ├── TablesTab.jsx
│   │   │   ├── AnalyticsTab.jsx
│   │   │   ├── MenuItemFormModal.jsx
│   │   │   └── TableFormModal.jsx
│   │   ├── views/               # Tampilan Utama (CustomerView & AdminView)
│   │   ├── utils/               # Audio Synthesizer, Formatter Rupiah, Tanggal
│   │   ├── api.js               # Client API Wrapper
│   │   ├── socket.js            # Client Socket.IO Instance
│   │   ├── App.jsx              # Hash Router & Root State
│   │   └── main.jsx
│   └── package.json
├── server/                      # Backend Node.js + Express
│   ├── routes/                  # REST API Endpoints
│   │   ├── auth.js              # Login Admin & JWT Verification
│   │   ├── menu.js              # Kategori & Item Menu CRUD
│   │   ├── tables.js            # Generator QR Meja & Tables API
│   │   └── orders.js            # Pemesanan, Pelacakan Real-time & Analitik
│   ├── db.js                    # SQLite Database & Seeding Data Awal
│   ├── socket.js                # Server Socket.IO Event Engine
│   └── index.js                 # Entry Point Server Express 5
├── package.json                 # Unified Scripts (npm run dev, build, start)
└── README.md                    # Dokumentasi Proyek
```
