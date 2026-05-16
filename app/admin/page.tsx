"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Activity,
  Image as ImageIcon,
  LogOut,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  products as initialProducts,
  users as initialUsers,
  activityLogs,
  orders,
  formatPrice,
  formatDate,
} from "@/app/data/mockData";

import { toast } from "sonner";

type Tab = "dashboard" | "products" | "users" | "logs" | "content";

export default function AdminPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState(initialProducts);
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(userData);

    if (parsed.role !== "admin") {
      router.push("/dashboard");
    } else {
      setUser(parsed);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted");
    }
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, isActive: !u.isActive } : u
      )
    );
    toast.success("User updated");
  };

  if (!user) return null;

  const totalProducts = products.length;
  const totalUsers = users.filter((u) => u.role === "customer").length;

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "payment_verification"
  ).length;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "users", label: "Users", icon: Users },
    { id: "logs", label: "Activity Logs", icon: Activity },
    { id: "content", label: "Content", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* SIDEBAR */}
      <aside className="w-64 border-r flex flex-col">
        <div className="p-6 border-b">
          🌿 Admin Panel
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex gap-2 p-3 rounded-lg ${
                  activeTab === item.id
                    ? "bg-primary text-white"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="p-4 border-t hover:bg-muted flex gap-2"
        >
          <LogOut /> Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl mb-6">
          {activeTab.toUpperCase()}
        </h1>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border rounded">
              <Package />
              {totalProducts}
            </div>

            <div className="p-4 border rounded">
              <Users />
              {totalUsers}
            </div>

            <div className="p-4 border rounded">
              <ShoppingCart />
              {pendingOrders}
            </div>

            <div className="p-4 border rounded">
              <DollarSign />
              {formatPrice(totalRevenue)}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === "products" && (
          <div>
            {products.map((p) => (
              <div key={p.id} className="flex gap-4 border p-2">
                <span>{p.name}</span>
                <button onClick={() => handleDeleteProduct(p.id)}>
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div>
            {users.map((u) => (
              <div key={u.id} className="flex gap-4 border p-2">
                <span>{u.name}</span>
                <button onClick={() => handleToggleUserStatus(u.id)}>
                  {u.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* LOGS */}
        {activeTab === "logs" && (
          <div>
            {activityLogs.map((l) => (
              <div key={l.id}>
                {l.details} - {formatDate(l.timestamp)}
              </div>
            ))}
          </div>
        )}

        {/* CONTENT */}
        {activeTab === "content" && (
          <div>Content Management</div>
        )}
      </main>
    </div>
  );
}