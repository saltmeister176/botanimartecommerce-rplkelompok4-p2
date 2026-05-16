"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  Clock,
  RefreshCw,
  Eye,
  DollarSign,
} from "lucide-react";
import {
  orders as initialOrders,
  formatPrice,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/app/data/mockData";
import { toast } from "sonner";

type Tab = "dashboard" | "orders" | "stock";

export default function StoreManager() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(userData);

    if (parsed.role !== "store_manager" && parsed.phone !== "manager") {
      router.push("/dashboard");
    } else {
      setUser(parsed);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleVerifyPayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "processing" as const } : o
      )
    );
    toast.success("Payment verified! Order moved to processing.");
    setSelectedOrder(null);
  };

  const handleUpdateStatus = (orderId: string, newStatus: any) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    toast.success(`Order status updated to ${getStatusLabel(newStatus)}`);
  };

  if (!user) return null;

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const verificationOrders = orders.filter(
    (o) => o.status === "payment_verification"
  ).length;
  const processingOrders = orders.filter(
    (o) => o.status === "processing"
  ).length;

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="w-64 border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Store Manager</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded"
          >
            <ShoppingCart size={18} />
            Orders
          </button>

          <button
            onClick={() => setActiveTab("stock")}
            className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded"
          >
            <Package size={18} />
            Stock
          </button>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold capitalize mb-6">
          {activeTab}
        </h1>

        {activeTab === "dashboard" && (
          <div className="grid md:grid-cols-4 gap-6">
            <Card title="Pending" value={pendingOrders} icon={<Clock size={18} />} />
            <Card title="To Verify" value={verificationOrders} icon={<RefreshCw size={18} />} />
            <Card title="Processing" value={processingOrders} icon={<Package size={18} />} />
            <Card
              title="Revenue"
              value={formatPrice(totalRevenue)}
              icon={<DollarSign size={18} />}
            />
          </div>
        )}

        {activeTab === "orders" && (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.date)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-primary flex items-center gap-1"
                  >
                    <Eye size={16} />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "stock" && (
          <div className="border p-6 rounded">
            Stock management coming soon.
          </div>
        )}
      </main>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <div className="border p-6 rounded">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}