export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* 1. Navigation Bar */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-100 shadow-sm">
        <div className="text-2xl font-bold text-green-600">
          Botani<span className="text-gray-800">Mart</span>
        </div>
        
        <div className="space-x-8 font-medium">
          <a href="#" className="hover:text-green-600 transition">Catalog</a>
          <a href="#" className="hover:text-green-600 transition">Orders</a>
          <a href="#" className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition">
            Cart (0)
          </a>
        </div>
      </nav>

      {/* 2. Welcome Section */}
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Fresh products from <span className="text-green-600">local farmers</span>.
        </h1>
        <p className="mt-6 text-lg text-gray-500">
          Connecting you directly to the source. Simple, fresh, and sustainable.
        </p>
      </div>
    </main>
  );
}


