"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  category_id: string | null;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: CartProduct;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (product: CartProduct, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const refreshCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCart([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const mapped: CartItem[] = data.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: {
            id: item.product_id,
            name: item.products.name,
            price: item.products.price,
            image_url: item.products.image_url,
            stock: item.products.stock ?? 999,
            category_id: item.products.category_id ?? null,
          },
        }));
        setCart(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (product: CartProduct, quantity: number = 1) => {
    const tempId = `temp-${product.id}`;

    // Optimistic update — langsung tampilkan quantity penuh
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { id: tempId, product_id: product.id, quantity, product }];
    });

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity }),
      });

      if (res.status === 401) {
        // Belum login — rollback
        await refreshCart();
        return;
      }

      if (res.ok) {
        // Ganti temp ID dengan ID real dari DB, tanpa refresh penuh
        const saved = await res.json();
        const realId = Array.isArray(saved) ? saved[0]?.id : saved?.id;
        if (realId) {
          setCart((prev) =>
            prev.map((i) => (i.id === tempId ? { ...i, id: realId } : i))
          );
        }
      }
    } catch {
      await refreshCart();
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));

    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id: cartItemId }),
      });
    } catch {
      await refreshCart();
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    );

    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id: cartItemId, quantity }),
      });
    } catch {
      await refreshCart();
    }
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
