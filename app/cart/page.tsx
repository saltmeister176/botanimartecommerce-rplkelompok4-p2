"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ImageWithFallback } from "@/app/components/ImageWithFallback";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="bg-muted/30 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl mb-2">Keranjang Belanja Kosong</h2>
          <p className="text-muted-foreground mb-6">
            Belum ada produk yang ditambahkan. Yuk mulai belanja sekarang!
          </p>

          <Link
            href="/products"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 hover:shadow-lg transition-all"
          >
            <span>🛍️ Mulai Belanja</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            href="/"
            className="block mt-4 text-primary hover:underline"
          >
            ← Kembali ke Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl">Shopping Cart</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT SIDE - CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-card border border-border rounded-lg p-6 flex gap-6"
              >
                <div className="w-24 h-24 shrink-0 bg-muted rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={item.product.image_url ?? ''}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-foreground mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.product.category_id}
                      </p>
                      <p className="text-primary">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded-lg h-fit"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-3 mt-4">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="p-2 border border-border rounded-lg hover:bg-muted"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="w-12 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="p-2 border border-border rounded-lg hover:bg-muted"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-foreground">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE - ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h3 className="text-foreground mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    {formatPrice(getCartTotal())}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    Calculated at checkout
                  </span>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-foreground">Total</span>
                    <span className="text-xl text-primary">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 hover:shadow-lg transition-all"
              >
                🛒 Lanjut ke Checkout
              </button>

              <Link
                href="/products"
                className="block text-center mt-4 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                ← Lanjut Belanja
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}