"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";

export default function CheckoutConfirm() {
  const router = useRouter();
  const { clearCart } = useCart();

  const [orderData, setOrderData] = useState<any>(null);

  // Ambil data dari localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("checkoutData");

    if (!storedData) {
      router.push("/cart");
      return;
    }

    setOrderData(JSON.parse(storedData));
  }, [router]);

  if (!orderData) return null;

  const { formData, shippingMethod, total, cart } = orderData;

  const generateWhatsAppMessage = () => {
    const items = cart
      .map(
        (item: any) =>
          `- ${item.product.name} x${item.quantity} (${formatPrice(
            item.product.price * item.quantity
          )})`
      )
      .join("\n");

    const message = `*New Order - Botani Mart*

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
${shippingMethod === "delivery" ? `Address: ${formData.address}` : ""}

*Shipping Method:* ${
      shippingMethod === "delivery"
        ? "Courier Delivery"
        : "Self Pickup"
    }

*Order Items:*
${items}

*Total: ${formatPrice(total)}*

Thank you!`;

    return encodeURIComponent(message);
  };

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const whatsappNumber = "6281234567890";
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;

    window.open(url, "_blank");

    clearCart();
    localStorage.removeItem("checkoutData");

    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full bg-card border border-border rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="bg-secondary/10 text-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Click below to send your order via WhatsApp
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 mb-6">
          <h3 className="mb-4">Order Preview</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{formData.name}</span>
            </div>

            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{formData.phone}</span>
            </div>

            {shippingMethod === "delivery" && (
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-right max-w-xs">
                  {formData.address}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>
                {shippingMethod === "delivery"
                  ? "Courier Delivery"
                  : "Self Pickup"}
              </span>
            </div>

            <div className="border-t pt-2 mt-2 flex justify-between">
              <span>Total:</span>
              <span className="text-xl text-primary">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSendWhatsApp}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-[#25D366] text-white rounded-lg"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-lg">Send Order via WhatsApp</span>
        </button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          You will be redirected to WhatsApp to complete your order
        </p>
      </div>
    </div>
  );
}