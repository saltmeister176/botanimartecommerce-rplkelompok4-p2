"use client";

import { Toaster } from "sonner";
import { CartProvider } from "@/app/context/CartContext";
import Navbar from "@/app/components/Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </CartProvider>
  );
}
