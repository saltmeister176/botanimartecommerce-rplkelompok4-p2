'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Users, LogOut, Trash2, DollarSign,
  ShoppingCart, Pencil, Check, X, Search, ChevronUp, ChevronDown,
  Shield, User as UserIcon, Clock, RefreshCw, Eye,
} from "lucide-react";
import { formatPrice, formatDate, getStatusColor, getStatusLabel, type OrderStatus } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

type Role = "admin" | "store_manager" | "superadmin";
type Tab = "dashboard" | "products" | "users" | "orders" | "stock";

export default function ControlPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Product state
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);
  const [stockLoading, setStockLoading] = useState(false);
  const [sortField, setSortField] = useState<"name" | "stock" | "price">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // ── Auth check ──────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, name")
        .eq("id", authUser.id)
        .single();

      const userRole = profile?.role as Role;
      const allowedRoles: Role[] = ["admin", "store_manager", "superadmin"];

      if (!profile || !allowedRoles.includes(userRole)) {
        router.push("/dashboard");
        return;
      }

      setUser({ ...authUser, ...profile });
      setRole(userRole);
    };
    checkUser();
  }, [router]);

  // ── Fetch data based on role ────────────────────────────
  useEffect(() => {
    if (!user || !role) return;
    const canSeeProducts = role === "admin" || role === "superadmin";
    const canSeeOrders = role === "store_manager" || role === "superadmin";

    fetch('/api/products').then(r => r.json()).then(setProducts);
    setOrdersLoading(true);
    fetch('/api/orders')
      .then(r => r.json())
      .then(setOrders)
      .finally(() => setOrdersLoading(false));
  }, [user, role]);

  // Fetch users when users tab opened
  useEffect(() => {
    if (activeTab !== "users" || !user) return;
    if (users.length > 0) return;
    setUsersLoading(true);
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Gagal memuat data pengguna"))
      .finally(() => setUsersLoading(false));
  }, [activeTab, user]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: 'local' });
    toast.success("Berhasil logout");
    window.location.href = "/login";
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Delete this product?")) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted");
    }
  };

  const startEditStock = (product: any) => {
    setEditingStockId(product.id);
    setEditingStockValue(product.stock ?? 0);
  };
  const cancelEditStock = () => setEditingStockId(null);

  const saveStock = async (id: string) => {
    if (editingStockValue < 0) { toast.error("Stok tidak boleh negatif"); return; }
    setStockLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: editingStockValue }),
      });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: editingStockValue } : p));
      toast.success("Stok berhasil diperbarui");
      setEditingStockId(null);
    } catch { toast.error("Gagal memperbarui stok"); }
    finally { setStockLoading(false); }
  };

  const handleVerifyPayment = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: "paid" }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: "paid", status: "processing" } : o));
      toast.success("Payment verified! Order moved to processing.");
    } else { toast.error("Failed to verify payment."); }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Status diupdate ke ${getStatusLabel(newStatus)}`);
    } else { toast.error('Gagal update status'); }
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const filteredProducts = products
    .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let valA = sortField === "name" ? (a.name ?? "").toLowerCase() : a[sortField] ?? 0;
      let valB = sortField === "name" ? (b.name ?? "").toLowerCase() : b[sortField] ?? 0;
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone_number?.includes(userSearch)
  );

  if (!user || !role) return null;

  // Role helpers
  const isAdmin = role === "admin" || role === "superadmin";
  const isStoreManager = role === "store_manager" || role === "superadmin";

  const totalRevenue = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "pending" || o.payment_status === "unpaid").length;
  const lowStockCount = products.filter(p => (p.stock ?? 0) <= 5).length;
  const processingOrders = orders.filter(o => o.status === "processing").length;

  // Build menu based on role
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { id: "products", label: "Kelola Katalog", icon: Package, show: isAdmin },
    { id: "users", label: "Kontrol Pengguna", icon: Users, show: isAdmin },
    { id: "orders", label: "Pantau Pesanan", icon: ShoppingCart, show: true },
    { id: "stock", label: "Manajemen Inventaris", icon: Package, show: true },
  ].filter(item => item.show);

  const roleLabel = role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Store Manager";
  const roleBadgeColor = role === "superadmin" ? "bg-purple-100 text-purple-700" : role === "admin" ? "bg-primary/10 text-primary" : "bg-green-100 text-green-700";

  return (
    <div className="min-h-screen flex bg-background">
      {/* SIDEBAR */}
      <aside className="w-64 border-r flex flex-col">
        <div className="p-6 border-b">
          <p className="font-semibold">🌿 Control Panel</p>
          <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${roleBadgeColor}`}>
            {roleLabel}
          </span>
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

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl mb-6">{menuItems.find(m => m.id === activeTab)?.label ?? activeTab.toUpperCase()}</h1>

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {isAdmin && (
                <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10"><Package className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Produk</p>
                    <p className="text-2xl font-semibold mt-0.5">{products.length}</p>
                  </div>
                </div>
              )}
              {isAdmin && (
                <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-secondary/10"><Users className="w-5 h-5 text-secondary" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pengguna</p>
                    <p className="text-2xl font-semibold mt-0.5">{users.length}</p>
                  </div>
                </div>
              )}
              {isStoreManager && (
                <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-accent/30"><ShoppingCart className="w-5 h-5 text-accent-foreground" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Pending</p>
                    <p className="text-2xl font-semibold mt-0.5">{pendingOrders}</p>
                  </div>
                </div>
              )}
              {isStoreManager && (
                <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-green-100"><DollarSign className="w-5 h-5 text-green-600" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                    <p className="text-2xl font-semibold mt-0.5">{formatPrice(totalRevenue)}</p>
                  </div>
                </div>
              )}
            </div>

            {isStoreManager && orders.length > 0 && (
              <div className="bg-card border rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="font-semibold">Order Terbaru</h2>
                </div>
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
                      <tr key={order.id} className="hover:bg-muted/30">
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}...</td>
                        <td className="px-6 py-3">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-3 font-medium">{formatPrice(order.total)}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── KELOLA KATALOG (admin only) ── */}
        {activeTab === "products" && isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{products.length}</span> produk
                </div>
                {lowStockCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    ⚠ {lowStockCount} stok hampir habis
                  </span>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Cari produk atau kategori..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-64" />
              </div>
            </div>
            <div className="bg-card border rounded-xl overflow-hidden">
              {filteredProducts.length === 0 ? (
                <div className="px-6 py-16 text-center text-muted-foreground text-sm">
                  {searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium w-16">Foto</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium cursor-pointer" onClick={() => toggleSort("name")}>
                        <span className="flex items-center gap-1">Nama Produk <SortIcon field="name" /></span>
                      </th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Kategori</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium cursor-pointer" onClick={() => toggleSort("price")}>
                        <span className="flex items-center gap-1">Harga <SortIcon field="price" /></span>
                      </th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium cursor-pointer" onClick={() => toggleSort("stock")}>
                        <span className="flex items-center gap-1">Stok <SortIcon field="stock" /></span>
                      </th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.map((product: any) => (
                      <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover border" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3"><span className="font-medium">{product.name}</span></td>
                        <td className="px-6 py-3"><span className="text-muted-foreground text-xs">{product.categories?.name ?? "-"}</span></td>
                        <td className="px-6 py-3 font-medium">{formatPrice(product.price)}</td>
                        <td className="px-6 py-3">
                          {editingStockId === product.id ? (
                            <div className="flex items-center gap-1">
                              <input type="number" min={0} value={editingStockValue}
                                onChange={e => setEditingStockValue(Number(e.target.value))}
                                className="w-20 px-2 py-1 text-sm border rounded-md focus:outline-none"
                                autoFocus
                                onKeyDown={e => { if (e.key === "Enter") saveStock(product.id); if (e.key === "Escape") cancelEditStock(); }} />
                              <button onClick={() => saveStock(product.id)} disabled={stockLoading} className="p-1 rounded hover:bg-green-100 text-green-600"><Check className="w-4 h-4" /></button>
                              <button onClick={cancelEditStock} className="p-1 rounded hover:bg-red-100 text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${(product.stock ?? 0) <= 5 ? "text-red-600" : (product.stock ?? 0) <= 20 ? "text-yellow-600" : "text-foreground"}`}>
                                {product.stock ?? 0}
                              </span>
                              {(product.stock ?? 0) <= 5 && <span className="text-xs text-red-500">Hampir habis</span>}
                              <button onClick={() => startEditStock(product)} className="p-1 rounded hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── KONTROL PENGGUNA (admin only) ── */}
        {activeTab === "users" && isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredUsers.length}</span> pengguna
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Cari nama, email, atau telepon..." value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-72" />
              </div>
            </div>
            <div className="bg-card border rounded-xl overflow-hidden">
              {usersLoading ? (
                <div className="px-6 py-16 text-center text-muted-foreground text-sm">Memuat data pengguna...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="px-6 py-16 text-center text-muted-foreground text-sm">
                  {userSearch ? "Pengguna tidak ditemukan" : "Belum ada pengguna terdaftar"}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Pengguna</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Email</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">No. Telepon</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Role</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Bergabung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{u.name || <span className="text-muted-foreground italic">Belum diisi</span>}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{u.email || "-"}</td>
                        <td className="px-6 py-3 text-muted-foreground">{u.phone_number || "-"}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.role === "superadmin" ? "bg-purple-100 text-purple-700" :
                            u.role === "admin" ? "bg-primary/10 text-primary" :
                            u.role === "store_manager" ? "bg-green-100 text-green-700" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            <Shield className="w-3 h-3" />
                            {u.role === "superadmin" ? "Super Admin" : u.role === "admin" ? "Admin" : u.role === "store_manager" ? "Store Manager" : "User"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── PANTAU PESANAN ── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {ordersLoading && <p className="text-muted-foreground">Loading orders...</p>}
            {!ordersLoading && orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
            {orders.map((order) => (
              <div key={order.id} className="border p-4 rounded-xl flex justify-between items-center bg-card">
                <div>
                  <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  {isStoreManager && order.payment_status === "unpaid" && order.status !== "cancelled" && (
                    <button onClick={() => handleVerifyPayment(order.id)}
                      className="text-sm bg-secondary/10 text-secondary px-3 py-1 rounded hover:bg-secondary/20">
                      Verify Payment
                    </button>
                  )}
                  {isStoreManager && order.payment_status === "paid" && order.status === "processing" && (
                    <button onClick={() => handleUpdateStatus(order.id, "shipping" as OrderStatus)}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                      Mark as Shipping
                    </button>
                  )}
                  {isStoreManager && order.status === "shipping" && (
                    <button onClick={() => handleUpdateStatus(order.id, "completed" as OrderStatus)}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                      Mark as Completed
                    </button>
                  )}
                  {!isStoreManager && (
                    <span className="text-xs text-muted-foreground italic">View only</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MANAJEMEN INVENTARIS ── */}
        {activeTab === "stock" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{products.length}</span> produk
                {lowStockCount > 0 && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    ⚠ {lowStockCount} stok hampir habis
                  </span>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Cari produk..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none w-64" />
              </div>
            </div>
            <div className="bg-card border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Produk</th>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Kategori</th>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium cursor-pointer" onClick={() => toggleSort("stock")}>
                      <span className="flex items-center gap-1">Stok <SortIcon field="stock" /></span>
                    </th>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product: any) => (
                    <tr key={product.id} className="hover:bg-muted/20">
                      <td className="px-6 py-3 font-medium">{product.name}</td>
                      <td className="px-6 py-3 text-muted-foreground text-xs">{product.categories?.name ?? "-"}</td>
                      <td className="px-6 py-3">
                        {isStoreManager && editingStockId === product.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" min={0} value={editingStockValue}
                              onChange={e => setEditingStockValue(Number(e.target.value))}
                              className="w-20 px-2 py-1 text-sm border rounded-md"
                              autoFocus
                              onKeyDown={e => { if (e.key === "Enter") saveStock(product.id); if (e.key === "Escape") cancelEditStock(); }} />
                            <button onClick={() => saveStock(product.id)} disabled={stockLoading} className="p-1 rounded hover:bg-green-100 text-green-600"><Check className="w-4 h-4" /></button>
                            <button onClick={cancelEditStock} className="p-1 rounded hover:bg-red-100 text-red-500"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${(product.stock ?? 0) <= 5 ? "text-red-600" : (product.stock ?? 0) <= 20 ? "text-yellow-600" : "text-foreground"}`}>
                              {product.stock ?? 0}
                            </span>
                            {(product.stock ?? 0) <= 5 && <span className="text-xs text-red-500">Hampir habis</span>}
                            {isStoreManager && (
                              <button onClick={() => startEditStock(product)} className="p-1 rounded hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground text-xs">{formatPrice(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
