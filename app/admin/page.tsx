'use client'

export const dynamic = 'force-dynamic'

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
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border rounded"><Package />{products.length}</div>
            <div className="p-4 border rounded"><Users />{users.length}</div>
            <div className="p-4 border rounded"><ShoppingCart />{pendingOrders}</div>
            <div className="p-4 border rounded"><DollarSign />{formatPrice(totalRevenue)}</div>
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
