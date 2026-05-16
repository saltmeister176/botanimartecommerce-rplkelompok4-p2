"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Minus,
  Plus,
  Star,
  Package,
  Shield,
  Truck,
} from "lucide-react";
import { products, formatPrice } from "@/app/data/mockData";
import { useCart } from "@/app/context/CartContext";
import { toast } from "sonner";
import { useState } from "react";
import { ImageWithFallback } from "@/app/components/ImageWithFallback";
import { useWishlist } from "@/app/context/WishlistContext";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const id = params?.id as string;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock > 0) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      toast.success(
        `✓ ${quantity}x ${product.name} berhasil ditambahkan ke keranjang`,
        {
          description: "Lanjutkan belanja atau cek keranjang Anda",
          duration: 3000,
        }
      );
    } else {
      toast.error("❌ Produk tidak tersedia", {
        description: "Stok habis",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <button onClick={() => router.push("/")} className="hover:text-foreground">
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => router.push("/products")}
            className="hover:text-foreground"
          >
            Produk
          </button>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali</span>
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="aspect-square relative">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <div className="mb-4">
              <span className="text-sm bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl text-foreground mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span>{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-3xl text-primary mb-2">
                {formatPrice(product.price)}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  product.stock > 0
                    ? "bg-secondary/10 text-secondary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-border rounded-lg"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-5 w-5" />
                </button>

                <span className="text-xl w-12 text-center">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="p-2 border border-border rounded-lg"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Tambah ke Keranjang</span>
              </button>

              <button
                onClick={() => {
                    addToWishlist(product);
                    toast.success("💖 Ditambahkan ke wishlist", {
                      description: "Produk disimpan untuk nanti",
                    });
                  }}
                className="px-6 py-4 border-2 border-primary text-primary rounded-lg"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}