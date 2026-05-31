'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Users, Activity,
  Image as ImageIcon, LogOut, Trash2, DollarSign, ShoppingCart,
  Pencil, Check, X, Search, ChevronUp, ChevronDown, Shield, User as UserIcon,
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
  const [usersLoading, setUsersLoading] = useState(false);

  // Product tab state
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

      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, name")
        .eq("id", authUser.id)
        .single();

      if (!profile || profile.is_admin !== true) {
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

  // Fetch users saat tab users dibuka
  useEffect(() => {
    if (activeTab !== "users" || !user) return;
    if (users.length > 0) return; // sudah ada data, skip
    setUsersLoading(true);
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Gagal memuat data pengguna"))
      .finally(() => setUsersLoading(false));
  }, [activeTab, user]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: 'local' });
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
    if (editingStockValue < 0) {
      toast.error("Stok tidak boleh negatif");
      return;
    }
    setStockLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: editingStockValue }),
      });
      if (!res.ok) throw new Error(await res.text());
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, stock: editingStockValue } : p)
      );
      toast.success("Stok berhasil diperbarui");
      setEditingStockId(null);
    } catch {
      toast.error("Gagal memperbarui stok");
    } finally {
      setStockLoading(false);
    }
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const filteredProducts = products
    .filter(p =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortField] ?? 0;
      let valB = b[sortField] ?? 0;
      if (sortField === "name") {
        valA = (a.name ?? "").toLowerCase();
        valB = (b.name ?? "").toLowerCase();
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone_number?.includes(userSearch)
  );

  if (!user) return null;

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.payment_status === "unpaid"
  ).length;

  const lowStockCount = products.filter(p => (p.stock ?? 0) <= 5).length;

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

      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl mb-6">{activeTab.toUpperCase()}</h1>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
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

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && (
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
                <input
                  type="text"
                  placeholder="Cari produk atau kategori..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
                />
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
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium cursor-pointer select-none" onClick={() => toggleSort("name")}>
                        <span className="flex items-center gap-1">Nama Produk <SortIcon field="name" /></span>
                      </th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Kategori</th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium cursor-pointer select-none" onClick={() => toggleSort("price")}>
                        <span className="flex items-center gap-1">Harga <SortIcon field="price" /></span>
                      </th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium cursor-pointer select-none" onClick={() => toggleSort("stock")}>
                        <span className="flex items-center gap-1">Stok <SortIcon field="stock" /></span>
                      </th>
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.map((product: any) => (
                      <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3"><span className="font-medium">{product.name}</span></td>
                        <td className="px-6 py-3"><span className="text-muted-foreground text-xs">{product.categories?.name ?? product.category ?? "-"}</span></td>
                        <td className="px-6 py-3 font-medium">{formatPrice(product.price)}</td>
                        <td className="px-6 py-3">
                          {editingStockId === product.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number" min={0} value={editingStockValue}
                                onChange={e => setEditingStockValue(Number(e.target.value))}
                                className="w-20 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === "Enter") saveStock(product.id);
                                  if (e.key === "Escape") cancelEditStock();
                                }}
                              />
                              <button onClick={() => saveStock(product.id)} disabled={stockLoading} className="p-1 rounded hover:bg-green-100 text-green-600 disabled:opacity-50"><Check className="w-4 h-4" /></button>
                              <button onClick={cancelEditStock} className="p-1 rounded hover:bg-red-100 text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${(product.stock ?? 0) <= 5 ? "text-red-600" : (product.stock ?? 0) <= 20 ? "text-yellow-600" : "text-foreground"}`}>
                                {product.stock ?? 0}
                              </span>
                              {(product.stock ?? 0) <= 5 && <span className="text-xs text-red-500 font-medium">Hampir habis</span>}
                              <button onClick={() => startEditStock(product)} className="p-1 rounded hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors">
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

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredUsers.length}</span> pengguna
                  {userSearch && ` dari ${users.length}`}
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {users.filter(u => u.is_admin).length} admin
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau telepon..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-72"
                />
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
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <UserIcon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{u.name || <span className="text-muted-foreground italic">Belum diisi</span>}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{u.email || "-"}</td>
                        <td className="px-6 py-3 text-muted-foreground">{u.phone_number || "-"}</td>
                        <td className="px-6 py-3">
                          {u.is_admin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              <UserIcon className="w-3 h-3" /> User
                            </span>
                          )}
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

        {activeTab === "content" && <div>Content Management</div>}
      </main>
    </div>
  );
}
