"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Truck,
  CreditCard,
  Building2,
  QrCode,
  Tag,
  X,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { formatPrice, paymentMethods } from "@/lib/utils";

const VALID_PROMO_CODES: Record<string, number> = {
  BOTANI20: 0.2,
};

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

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  const shippingCost = shippingMethod === "delivery" ? 15000 : 0;
  const subtotal = getCartTotal();
  const discountRate = appliedPromo ? VALID_PROMO_CODES[appliedPromo] : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const total = subtotal - discountAmount + shippingCost;

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (appliedPromo) return;

    if (VALID_PROMO_CODES[code] !== undefined) {
      setAppliedPromo(code);
      setPromoError("");
      setPromoInput("");
    } else {
      setPromoError("Kode promo tidak valid.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) return;

    const checkoutData = {
      formData,
      shippingMethod,
      paymentMethod,
      subtotal,
      discountCode: appliedPromo,
      discountAmount,
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

            {/* PROMO CODE */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="mb-4 flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>Kode Promo</span>
              </h3>

              {appliedPromo ? (
                <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-primary font-medium">{appliedPromo}</p>
                    <p className="text-sm text-muted-foreground">
                      Diskon {Math.round(VALID_PROMO_CODES[appliedPromo] * 100)}% berhasil diterapkan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="p-1 hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode promo"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyPromo())}
                      className="flex-1 px-4 py-2 border rounded-lg uppercase placeholder:normal-case"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Terapkan
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-sm text-destructive">{promoError}</p>
                  )}
                </div>
              )}
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
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Diskon ({appliedPromo})</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
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
