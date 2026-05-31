'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Heart, LogOut } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Navbar() {
  const { getCartCount } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser ?? null);

      if (authUser) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin, name')
          .eq('id', authUser.id)
          .single();
        setProfile(data ?? null);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin, name')
          .eq('id', session.user.id)
          .single();
        setProfile(data ?? null);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
  setShowLogoutConfirm(false);
  await supabase.auth.signOut({ scope: 'local' });
  setUser(null);
  setProfile(null);
  window.location.href = "/login";
};

  const displayName = profile?.name ?? user?.email ?? '';

  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link href="/">
              <img src="/logo.png" alt="Botani Mart" className="h-10 w-auto object-contain" />
            </Link>

            {/* SEARCH — Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk pertanian..."
                  className="w-full px-4 py-2 pl-10 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary/50 transition-colors"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </form>

            {/* ACTIONS */}
            <div className="flex items-center space-x-2">

              {/* Wishlist */}
              <Link href="/wishlist" className="p-2 hover:bg-muted rounded-lg transition-colors group">
                <Heart className="h-6 w-6 text-foreground group-hover:text-destructive group-hover:scale-110 transition-all" />
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors group">
                <ShoppingCart className="h-6 w-6 text-foreground group-hover:scale-110 transition-transform" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {getCartCount()}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{displayName}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm text-foreground">{profile?.name ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>

                      <Link href="/" onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-muted transition-colors">
                        <span className="text-sm">🏠 Homepage</span>
                      </Link>

                      <Link href="/products" onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-muted transition-colors">
                        <span className="text-sm">🛍️ Browse Products</span>
                      </Link>

                      <Link href="/dashboard" onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-muted transition-colors">
                        <span className="text-sm">📦 My Orders</span>
                      </Link>

                      <Link href="/profile" onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-muted transition-colors">
                        <span className="text-sm">👤 Profile</span>
                      </Link>

                      {profile?.is_admin === true && (
                        <Link href="/admin" onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-muted transition-colors">
                          <span className="text-sm">⚙️ Order Status Panel</span>
                        </Link>
                      )}

                      <div className="border-t border-border mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center space-x-2 text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH — Mobile */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk pertanian..."
                className="w-full px-4 py-2 pl-10 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary/50 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </form>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">👋</div>
              <h3 className="text-lg font-medium text-foreground">Yakin mau logout?</h3>
              <p className="text-sm text-muted-foreground mt-1">Kamu harus login lagi untuk akses akun.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-destructive text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}