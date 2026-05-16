"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Star, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { toast } from "sonner";
import { ImageWithFallback } from "@/app/components/ImageWithFallback";

// Tipe produk dari Supabase (bukan mockData)
export interface SupabaseProduct {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  created_at: string;
  categories?: { name: string } | null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

interface ProductCardProps {
  product: SupabaseProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        category_id: product.category_id,
      });
      toast.success(`✓ ${product.name} berhasil ditambahkan ke keranjang`, {
        description: "Lanjutkan belanja atau cek keranjang Anda",
        duration: 3000,
      });
    } else {
      toast.error("❌ Produk tidak tersedia", {
        description: "Stok habis",
      });
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success("Dihapus dari wishlist");
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        description: product.description,
        category_id: product.category_id,
      });
      toast.success("💖 Ditambahkan ke wishlist", {
        description: "Produk disimpan untuk nanti",
      });
    }
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ImageWithFallback
          src={product.image_url || ""}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 bg-card rounded-full hover:bg-accent hover:scale-110 transition-all shadow-md group"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              inWishlist
                ? "fill-destructive text-destructive"
                : "text-foreground group-hover:text-destructive"
            }`}
          />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-muted text-foreground px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {product.categories?.name ?? "Uncategorized"}
          </span>
        </div>

        <h3 className="text-foreground mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        <p className="text-primary mb-3">{formatPrice(product.price)}</p>

        <div className="flex flex-col space-y-2">
          <span
            className={`text-xs px-2 py-1 rounded w-fit ${
              product.stock > 0
                ? "bg-secondary/10 text-secondary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Stock: {product.stock}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">Tambah ke Keranjang</span>
          </button>
        </div>
      </div>
    </Link>
  );
}