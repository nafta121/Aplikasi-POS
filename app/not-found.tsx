import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center">
      <h2 className="text-3xl font-black mb-2 text-amber-400">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-slate-400 mb-6 max-w-sm">
        Halaman atau rute yang Anda cari tidak tersedia di sistem POS & Logistik.
      </p>
      <Link
        href="/login"
        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
      >
        Kembali ke Login
      </Link>
    </div>
  );
}
