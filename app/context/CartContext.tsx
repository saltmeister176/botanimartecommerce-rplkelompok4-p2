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
  id: string;         // cart_items.id
  product_id: string;
  quantity: number;
  product: CartProduct;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (product: CartProduct) => Promise<void>;
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
        // data dari API: { id, user_id, product_id, quantity, products: { name, price, image_url } }
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

  // Load cart saat user login/logout
  useEffect(() => {
    refreshCart();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (product: CartProduct) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic update
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: `temp-${product.id}`,
          product_id: product.id,
          quantity: 1,
          product,
        },
      ];
    });

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      if (!res.ok) {
        await refreshCart(); // rollback jika gagal
      } else {
        await refreshCart(); // sync ID yang beneran dari DB
      }
    } catch {
      await refreshCart();
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    // Optimistic update
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

    // Optimistic update
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
