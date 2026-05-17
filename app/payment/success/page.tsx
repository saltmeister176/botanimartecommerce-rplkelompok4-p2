"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const total = searchParams.get("total");

  useEffect(() => {
    if (!orderId || !total) {
      router.push("/");
    }
  }, [orderId, total, router]);

  if (!orderId || !total) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <div className="bg-secondary/10 text-secondary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h1 className="text-2xl text-foreground mb-2">✓ Pembayaran Berhasil!</h1>
          <p className="text-muted-foreground mb-6">Pesanan Anda telah berhasil diproses</p>
          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="text-foreground">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Paid</span>
              <span className="text-xl text-primary">{formatPrice(Number(total))}</span>
            </div>
          </div>
          <div className="bg-accent/20 border border-accent/30 p-4 rounded-lg mb-6">
            <p className="text-sm">
              Kami akan memverifikasi pembayaran dan memproses pesanan Anda dalam waktu 24 jam.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <Link href="/dashboard"
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all">
              <ShoppingBag className="h-5 w-5" />
              <span>📦 Lihat Pesanan Saya</span>
            </Link>
            <Link href="/"
              className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-colors">
              <Home className="h-5 w-5" />
              <span>🏠 Kembali ke Homepage</span>
            </Link>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Need help? Contact us at{" "}
          <a href="tel:+6281234567890" className="text-primary hover:underline">
            +62 812-3456-7890
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}