# AI Coding Agent Rules

Ketika Anda diminta untuk menulis atau merefaktor kode, ikuti aturan ketat berikut:

1. **Gunakan Server Actions untuk Mutasi:**
   Untuk operasi penulisan ke database (INSERT/UPDATE/DELETE), jangan buat API Routes (`/api/...`). Gunakan Next.js Server Actions (`'use server'`) di file `actions.ts`.

2. **Data Fetching:**
   Gunakan Server Components (`async function Page()`) sebisa mungkin untuk memuat data awal dari Supabase. Gunakan Client Components (`"use client"`) hanya untuk interaksi user (misal: state keranjang belanja, form input, kalkulasi kembalian).

3. **Penanganan Status Loading & Error:**
   Selalu gunakan hooks `useFormStatus` atau `useActionState` (React 19) untuk tombol submit agar UI memberikan *feedback* saat transaksi sedang diproses.

4. **Jangan Sentuh Logika Pengurangan Stok:**
   Stok di-handle oleh database trigger. Tugas Anda di kode aplikasi hanyalah memastikan `transaction_items` menerima data `quantity` dan `conversion_multiplier` yang valid saat checkout.

5. **Responsif Sesuai Role:**
   Jika Anda memodifikasi file di dalam folder `(kasir)`, pastikan komponen tersebut dioptimalkan untuk sentuhan jari (Touch UI) dan menggunakan layout `max-w-md` (mobile). Jika di folder `(admin)`, optimalkan untuk layar lebar desktop.
