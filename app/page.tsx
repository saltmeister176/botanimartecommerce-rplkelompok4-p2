"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sprout,
  Wheat,
  Wrench,
  FlaskConical,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import ProductCard from "@/app/components/ProductCard";

export default function Landing() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);

    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  // Gunakan field dari Supabase: is_recommended & is_new
  // Kalau kolom belum ada di DB, fallback ke semua produk (slice untuk batasi tampilan)
  const recommendedProducts = products.filter((p) => p.is_recommended).length > 0
    ? products.filter((p) => p.is_recommended)
    : products.slice(0, 4);

  const newProducts = products.filter((p) => p.is_new).length > 0
    ? products.filter((p) => p.is_new)
    : products.slice(0, 4);

  const categoryIcons: Record<string, React.ElementType> = {
    plant: Sprout,
    seed: Wheat,
    wrench: Wrench,
    flask: FlaskConical,
  };

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative bg-linear-to-r from-primary via-primary/90 to-secondary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🌱</div>
          <div className="absolute top-20 right-20 text-5xl">🌿</div>
          <div className="absolute bottom-10 left-1/4 text-7xl">🌾</div>
          <div className="absolute bottom-20 right-1/3 text-6xl">🍃</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-accent text-accent-foreground px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">Trusted by 10,000+ Farmers</span>
              </div>

              <h1 className="text-4xl md:text-5xl mb-6">
                Quality Agricultural Products at Your Fingertips
              </h1>

              <p className="text-lg mb-8 text-white/90">
                Discover the best plants, seeds, tools, and fertilizers for your farming needs.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center space-x-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  href="/products?category=Plants"
                  className="inline-flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-lg"
                >
                  <span>Browse Plants</span>
                </Link>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="bg-white/10 rounded-2xl p-8 text-center border border-white/20">
                <span className="text-8xl">🌱</span>
                <p className="mt-4 text-lg">Growing Together</p>
                <p className="text-sm text-white/70">Since 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary/5 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl text-primary">10K+</div>
            <div className="text-sm">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl text-primary">500+</div>
            <div className="text-sm">Products</div>
          </div>
          <div>
            <div className="text-3xl text-secondary">4.8★</div>
            <div className="text-sm">Rating</div>
          </div>
          <div>
            <div className="text-3xl text-secondary">24/7</div>
            <div className="text-sm">Support</div>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl text-center mb-12">Browse by Category</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category.icon];

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.name}`}
                className="border rounded-lg p-8 text-center hover:shadow-lg transition"
              >
                <div className="flex justify-center mx-auto mb-4">
                  {Icon && <Icon className="h-8 w-8" />}
                </div>
                <h3 className="text-center">{category.name}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECOMMENDED */}
      {recommendedProducts.length > 0 && (
        <section className="bg-card py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between mb-8">
              <h2 className="text-3xl flex items-center gap-2">
                <TrendingUp /> Recommended
              </h2>

              <Link href="/products" className="text-primary">
                View All <ArrowRight className="inline w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between mb-8">
            <h2 className="text-3xl flex items-center gap-2">
              <Sparkles /> New Arrivals
            </h2>

            <Link href="/products" className="text-primary">
              View All <ArrowRight className="inline w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* PROMO */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-linear-to-r from-accent to-accent/70 rounded-2xl p-12 text-center">
          <h2 className="text-3xl mb-4">Special Promo - 20% OFF</h2>
          <p className="mb-6">
            Use code: <b>BOTANI20</b>
          </p>

          <Link
            href="/products"
            className="bg-primary text-white px-6 py-3 rounded-lg"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
