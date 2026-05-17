import Link from "next/link";

// Static page — tidak ada Supabase call supaya tidak crash saat prerender
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🌿</div>
        <h1 className="text-6xl text-primary mb-4">404</h1>
        <h2 className="text-2xl mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-8">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            🏠 Kembali ke Homepage
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
          >
            🛍️ Lihat Produk
          </Link>
        </div>
      </div>
    </div>
  );
}
