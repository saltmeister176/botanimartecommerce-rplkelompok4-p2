

export default function Home() {
  const features = [
    {
      icon: "🌱",
      title: "Direct from Farmers",
      desc: "No middlemen. Every product goes straight from the farm to your door.",
    },
    {
      icon: "🚚",
      title: "Same-Day Delivery",
      desc: "Order before noon and get your fresh produce delivered today.",
    },
    {
      icon: "♻️",
      title: "Sustainable Packaging",
      desc: "All packaging is 100% biodegradable and eco-friendly.",
    },
  ];

  const products = [
    { name: "Organic Tomatoes", price: "Rp 12.000", unit: "/ kg", emoji: "🍅" },
    { name: "Fresh Spinach", price: "Rp 8.000", unit: "/ bunch", emoji: "🥬" },
    { name: "Free-Range Eggs", price: "Rp 28.000", unit: "/ dozen", emoji: "🥚" },
    { name: "Raw Honey", price: "Rp 45.000", unit: "/ jar", emoji: "🍯" },
    { name: "Red Chili", price: "Rp 15.000", unit: "/ kg", emoji: "🌶️" },
    { name: "Sweet Corn", price: "Rp 6.000", unit: "/ cob", emoji: "🌽" },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* 1. Navigation Bar */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-100 shadow-sm sticky top-0 bg-white z-10">
        <div className="text-2xl font-bold text-green-600">
          Botani<span className="text-gray-800">Mart</span>
        </div>
        <div className="flex items-center space-x-8 font-medium">
          <a href="#catalog" className="hover:text-green-600 transition">Catalog</a>
          <a href="#" className="hover:text-green-600 transition">Orders</a>
          <a href="#" className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition">
            Cart (0)
          </a>
        </div>
      </nav>

      {/* 2. Hero Banner */}
      <section className="bg-green-50 px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">
            🌿 Farm to Table
          </span>
          <h1 className="mt-4 text-6xl font-extrabold tracking-tight leading-tight">
            Fresh products from{" "}
            <span className="text-green-600">local farmers</span>.
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-xl mx-auto">
            Connecting you directly to the source. Simple, fresh, and sustainable.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a
              href="#catalog"
              className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition"
            >
              Shop Now
            </a>
            <a
              href="#features"
              className="border border-green-600 text-green-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-50 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* 3. Product Grid */}
      <section id="catalog" className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Today's Catalog</h2>
        <p className="text-gray-500 mb-10">Freshly harvested and ready to order.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition group"
            >
              <div className="text-5xl mb-4">{product.emoji}</div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-green-600 font-bold text-xl">{product.price}</span>
                <span className="text-gray-400 text-sm">{product.unit}</span>
              </div>
              <button className="mt-4 w-full bg-green-50 text-green-700 py-2 rounded-full font-medium hover:bg-green-100 transition group-hover:bg-green-600 group-hover:text-white">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Features / About Section */}
      <section id="features" className="bg-gray-50 px-8 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Why BotaniMart?</h2>
          <p className="text-gray-500 mb-14">We're more than just a marketplace.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-100">
        © 2025 BotaniMart. All rights reserved.
      </footer>

    </main>
  );
}
