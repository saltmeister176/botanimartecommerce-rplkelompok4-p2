"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "@/app/components/ProductCard";

// useSearchParams() harus dibungkus Suspense di Next.js 14+
// kalau tidak, build Vercel akan error
function ProductsContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));

    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery) ||
      (product.description ?? "").toLowerCase().includes(searchQuery);

    const matchesCategory =
      selectedCategory === "All" || product.categories?.name === selectedCategory;

    let matchesPrice = true;
    if (priceRange === "under50k") matchesPrice = product.price < 50000;
    if (priceRange === "50k-100k")
      matchesPrice = product.price >= 50000 && product.price <= 100000;
    if (priceRange === "over100k") matchesPrice = product.price > 100000;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-primary-foreground/80 mb-4">
            <Link href="/" className="hover:text-primary-foreground">
              Home
            </Link>
            <span>/</span>
            <span>Produk</span>
          </div>
          <h1 className="text-3xl mb-2">Katalog Produk</h1>
          <p className="text-primary-foreground/80">
            Jelajahi berbagai produk pertanian berkualitas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } md:block w-full md:w-64 flex-shrink-0`}
          >
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-foreground">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden text-muted-foreground"
                >
                  Close
                </button>
              </div>

              {/* CATEGORY */}
              <div className="mb-6">
                <h4 className="text-sm text-foreground mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === "All"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    All Products
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.name
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRICE */}
              <div>
                <h4 className="text-sm text-foreground mb-3">Price Range</h4>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Prices" },
                    { value: "under50k", label: "Under Rp50,000" },
                    { value: "50k-100k", label: "Rp50,000 - Rp100,000" },
                    { value: "over100k", label: "Over Rp100,000" },
                  ].map((price) => (
                    <label
                      key={price.value}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="price"
                        value={price.value}
                        checked={priceRange === price.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                      />
                      <span className="text-sm">{price.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {filteredProducts.length} produk ditemukan
              </p>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-muted/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔍</span>
                </div>
                <p className="text-lg text-foreground mb-2">
                  Produk Tidak Ditemukan
                </p>
                <p className="text-muted-foreground mb-6">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange("all");
                  }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat produk...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
