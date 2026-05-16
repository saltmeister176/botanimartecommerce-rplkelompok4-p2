"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package, Clock, CheckCircle, LogOut, Truck, RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800";
    case "shipping": return "bg-blue-100 text-blue-800";
    case "processing": return "bg-yellow-100 text-yellow-800";
    case "payment_verification": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed": return "Selesai";
    case "shipping": return "Dikirim";
    case "processing": return "Diproses";
    case "payment_verification": return "Verifikasi Pembayaran";
    case "pending": return "Menunggu";
    default: return status;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed": return <CheckCircle className="h-4 w-4" />;
    case "shipping": return <Truck className="h-4 w-4" />;
    case "processing": return <Package className="h-4 w-4" />;
    case "payment_verification": return <RefreshCw className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Fetch orders
      const res = await fetch("/api/orders");
      if (res.ok) {
        const ordersData = await res.json();
        setOrders(ordersData);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await supabase.auth.signOut();
    toast.success("Berhasil logout");
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2 text-sm mb-2">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span>Pesanan Saya</span>
            </div>
            <h1 className="text-3xl mb-2">
              Selamat Datang, {profile?.name || user?.email}! 👋
            </h1>
            <p className="opacity-80">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-primary rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistik */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Clock className="h-6 w-6" />} label="Pending"
            value={orders.filter(o => o.status === "pending").length} />
          <StatCard icon={<RefreshCw className="h-6 w-6" />} label="Verifying"
            value={orders.filter(o => o.status === "payment_verification").length} />
          <StatCard icon={<Package className="h-6 w-6" />} label="Diproses"
            value={orders.filter(o => o.status === "processing" || o.status === "shipping").length} />
          <StatCard icon={<CheckCircle className="h-6 w-6" />} label="Selesai"
            value={orders.filter(o => o.status === "completed").length} />
        </div>

        {/* Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl">📦 Riwayat Pesanan</h2>
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Kembali Belanja
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Belum ada pesanan.{" "}
              <Link href="/products" className="text-primary hover:underline">
                Mulai belanja sekarang →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs uppercase">Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 text-sm font-mono">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.order_items?.length ?? 0} item
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {order.payment_status === "paid" ? "Lunas" : "Belum Bayar"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center space-x-3">
        <div className="bg-muted p-3 rounded-lg">{icon}</div>
        <div>
          <p className="text-2xl">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
