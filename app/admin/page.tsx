'use client'


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Users, Activity,
  Image as ImageIcon, LogOut, Trash2, DollarSign, ShoppingCart,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

type Tab = "dashboard" | "products" | "users" | "logs" | "content";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // ── Auth check via Supabase (bukan localStorage) ──────────
  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, name")
        .eq("id", authUser.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setUser({ ...authUser, ...profile });
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/products').then(r => r.json()).then(setProducts);
    fetch('/api/orders').then(r => r.json()).then(setOrders);
  }, [user]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Delete this product?")) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted");
    }
  };

  if (!user) return null;

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.payment_status === "unpaid"
  ).length;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "users", label: "Users", icon: Users },
    { id: "content", label: "Content", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r flex flex-col">
        <div className="p-6 border-b">
          <p>🌿 Admin Panel</p>
          <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex gap-2 p-3 rounded-lg ${activeTab === item.id ? "bg-primary text-white" : "hover:bg-muted"}`}>
                <Icon className="w-5 h-5" />{item.label}
              </button>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="p-4 border-t hover:bg-muted flex gap-2">
          <LogOut /> Logout
        </button>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl mb-6">{activeTab.toUpperCase()}</h1>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Produk</p>
                  <p className="text-2xl font-semibold mt-0.5">{products.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">produk terdaftar</p>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pengguna</p>
                  <p className="text-2xl font-semibold mt-0.5">{users.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">akun terdaftar</p>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-accent/30">
                  <ShoppingCart className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Pending</p>
                  <p className="text-2xl font-semibold mt-0.5">{pendingOrders}</p>
                  <p className="text-xs text-muted-foreground mt-1">menunggu konfirmasi</p>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                  <p className="text-2xl font-semibold mt-0.5">{formatPrice(totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">dari order selesai</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold">Order Terbaru</h2>
                <p className="text-sm text-muted-foreground mt-0.5">10 order terakhir yang masuk</p>
              </div>
              {orders.length === 0 ? (
                <div className="px-6 py-10 text-center text-muted-foreground text-sm">Belum ada order</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Order ID</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Tanggal</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Total</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 10).map((order: any) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}...</td>
                        <td className="px-6 py-3">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-3 font-medium">{formatPrice(order.total)}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "completed" ? "bg-green-100 text-green-700" :
                            order.status === "shipping"  ? "bg-blue-100 text-blue-700" :
                            order.status === "processing" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {order.status === "completed" ? "Selesai" :
                             order.status === "shipping"  ? "Dikirim" :
                             order.status === "processing" ? "Diproses" :
                             order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            {products.map((p) => (
              <div key={p.id} className="flex gap-4 border p-2">
                <span>{p.name}</span>
                <button onClick={() => handleDeleteProduct(p.id)}><Trash2 /></button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "content" && <div>Content Management</div>}
      </main>
    </div>
  );
}