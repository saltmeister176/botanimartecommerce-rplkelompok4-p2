"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { formatPrice } from "@/app/data/mockData";
import { useCart } from "@/app/context/CartContext";
import { toast } from "sonner";
import Link from "next/link";
import { ImageWithFallback } from "@/app/components/ImageWithFallback";
import { useWishlist } from "@/app/context/WishlistContext";

export default function Wishlist() {
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(`✓ ${product.name} berhasil ditambahkan ke keranjang`, {
      description: "Lanjutkan belanja atau cek keranjang Anda",
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="bg-muted/30 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-16 w-16 text-muted-foreground" />
          </div>

          <h2 className="text-2xl mb-2">Wishlist Masih Kosong</h2>
          <p className="text-muted-foreground mb-6">
            Belum ada produk favorit yang disimpan. Tambahkan produk ke wishlist untuk memudahkan belanja!
          </p>

          <Link
            href="/products"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 hover:shadow-lg transition-all"
          >
            🛍️ Jelajahi Produk
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
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center space-x-2 text-sm text-primary-foreground/80 mb-4">
            <Link href="/" className="hover:text-primary-foreground">
              Home
            </Link>
            <span>/</span>
            <span>Wishlist</span>
          </div>

          <h1 className="text-3xl flex items-center space-x-3">
            <Heart className="h-8 w-8" />
            <span>💖 Wishlist Saya</span>
          </h1>

          <p className="text-primary-foreground/80 mt-2">
            {wishlist.length} produk tersimpan
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/product/${product.id}`} className="block">
                <div className="aspect-square bg-muted overflow-hidden">
                  <ImageWithFallback
                    src={product.image_url ?? ''}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-foreground mb-2 hover:text-primary">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-primary mb-4">
                  {formatPrice(product.price)}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 hover:shadow-md transition-all"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Tambah ke Keranjang</span>
                  </button>

                  <button
                    onClick={() => handleRemove(product.id)}
                    className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                    title="Hapus dari wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}