"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Truck,
  CreditCard,
  Building2,
  QrCode,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { formatPrice, paymentMethods } from "@/lib/utils";

export default function Checkout() {
  const { cart, getCartTotal } = useCart();
  const router = useRouter();

  const [shippingMethod, setShippingMethod] =
    useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const shippingCost = shippingMethod === "delivery" ? 15000 : 0;
  const total = getCartTotal() + shippingCost;

  // 🔥 Redirect kalau cart kosong
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) return;

    // Simpan data ke localStorage
    const checkoutData = {
      formData,
      shippingMethod,
      paymentMethod,
      subtotal: getCartTotal(),
      shippingCost,
      total,
      cart,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    router.push("/payment");
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* SHIPPING */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="mb-4 flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Shipping Method</span>
              </h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    value="delivery"
                    checked={shippingMethod === "delivery"}
                    onChange={(e) =>
                      setShippingMethod(e.target.value as "delivery" | "pickup")
                    }
                  />
                  <div className="flex-1">
                    <p>Courier Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Estimated 2-3 business days
                    </p>
                  </div>
                  <p>{formatPrice(15000)}</p>
                </label>

                <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    value="pickup"
                    checked={shippingMethod === "pickup"}
                    onChange={(e) =>
                      setShippingMethod(e.target.value as "delivery" | "pickup")
                    }
                  />
                  <div className="flex-1">
                    <p>Self Pickup</p>
                    <p className="text-sm text-muted-foreground">
                      Pick up at our store
                    </p>
                  </div>
                  <p>Free</p>
                </label>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="mb-4 flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Method</span>
              </h3>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    />

                    {method.type === "qris" ? (
                      <QrCode className="h-6 w-6 text-primary" />
                    ) : (
                      <Building2 className="h-6 w-6 text-primary" />
                    )}

                    <div className="flex-1">
                      <p>{method.name}</p>
                      {method.details && (
                        <p className="text-sm text-muted-foreground">
                          {method.details}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* CUSTOMER */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="mb-4 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                {shippingMethod === "delivery" && (
                  <textarea
                    required
                    rows={3}
                    placeholder="Delivery Address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg resize-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="bg-card border rounded-lg p-6 sticky top-20">
              <h3 className="mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0
                      ? "Free"
                      : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="border-t pt-3 flex justify-between">
                  <span>Total</span>
                  <span className="text-xl text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg"
              >
                ✓ Konfirmasi Pesanan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}