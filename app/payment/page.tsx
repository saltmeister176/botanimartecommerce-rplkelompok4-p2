"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Building2, Upload, CheckCircle, ArrowLeft } from "lucide-react";
import { formatPrice, paymentMethods } from "@/lib/utils";
import { useCart } from "@/app/context/CartContext";
import { toast } from "sonner";

export default function Payment() {
  const router = useRouter();
  const { clearCart } = useCart();

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, setState] = useState<any>(null);

    useEffect(() => {
  const savedData = localStorage.getItem("checkoutData");

  if (!savedData) {
    router.replace("/cart");
    return;
  }

  setState(JSON.parse(savedData));
}, [router]);

  if (!state) return null;

  const {
    formData,
    shippingMethod,
    paymentMethod,
    subtotal,
    shippingCost,
    total,
    cart,
  } = state;

  const selectedPayment = paymentMethods.find(
    (p) => p.id === paymentMethod
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!paymentProof && selectedPayment?.type === "bank_transfer") {
      toast.error("Please upload payment proof");
      return;
    }

    setIsSubmitting(true);

    try {
      // Buat order di database
      const res = await fetch("/api/orders", { method: "POST" });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal membuat pesanan");
        return;
      }

      const order = await res.json();

      toast.success("Payment submitted successfully!");
      clearCart();

      router.push(
        `/payment/success?orderId=${order.id}&total=${total}`
      );
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-primary-foreground/80 hover:text-primary-foreground mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl">Payment</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4 flex items-center space-x-2">
                {selectedPayment?.type === "qris" ? (
                  <QrCode className="h-5 w-5 text-primary" />
                ) : (
                  <Building2 className="h-5 w-5 text-primary" />
                )}
                <span>{selectedPayment?.name}</span>
              </h3>

              {selectedPayment?.type === "qris" ? (
                <div className="space-y-4 text-center">
                  <div className="bg-muted/30 p-8 rounded-lg">
                    <img
                      src="https://via.placeholder.com/200x200?text=QRIS+Code"
                      alt="QRIS Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-2xl text-primary">
                    {formatPrice(total)}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Account Number
                    </p>
                    <p className="text-lg text-foreground">
                      {selectedPayment?.details}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Amount to Transfer
                    </p>
                    <p className="text-2xl text-primary">
                      {formatPrice(total)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selectedPayment?.type === "bank_transfer" && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-foreground mb-4">
                  Upload Payment Proof
                </h3>
                <label className="block">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Payment proof"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Click to upload payment proof
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h3 className="text-foreground mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-6 border-b border-border pb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0
                      ? "Free"
                      : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="text-xl text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (!paymentProof &&
                    selectedPayment?.type === "bank_transfer")
                }
                className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg"
              >
                {isSubmitting
                  ? "Memproses Pembayaran..."
                  : "✓ Konfirmasi Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}