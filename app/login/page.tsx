"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!formData.name || !formData.email || !formData.password) {
          toast.error("Nama, email, dan password wajib diisi");
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone_number: formData.phone || null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Gagal membuat akun");
          return;
        }

        toast.success("Akun berhasil dibuat! Cek email untuk konfirmasi.");
        setIsRegister(false);
      } else {
        if (!formData.email || !formData.password) {
          toast.error("Email dan password wajib diisi");
          return;
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Email atau password salah");
          return;
        }

        // Cek role dari tabel profiles (bukan is_admin)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          toast.success("Login berhasil! Mengalihkan...");

          // Tunggu sebentar agar toast tampil, lalu redirect
          await new Promise((resolve) => setTimeout(resolve, 1500));

          if (profile?.role === "admin") {
            router.push("/admin");
          } else if (profile?.role === "store_manager") {
            router.push("/store-manager");
          } else {
            router.push("/");
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
              🌿
            </div>
            <span className="text-2xl text-primary">Botani Mart</span>
          </div>

          <h2 className="text-2xl">
            {isRegister ? "Buat Akun" : "Selamat Datang"}
          </h2>

          <p className="text-muted-foreground">
            {isRegister
              ? "Daftar untuk mulai belanja"
              : "Masuk ke akun Anda"}
          </p>
        </div>

        {/* FORM */}
        <div className="bg-card border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="email@contoh.com"
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm mb-1">Nomor HP (opsional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="08xxx"
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Loading..." : isRegister ? "Buat Akun" : "Masuk"}
            </button>
          </form>

          {/* TOGGLE */}
          <div className="text-center mt-4">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-primary text-sm"
            >
              {isRegister
                ? "Sudah punya akun? Masuk"
                : "Belum punya akun? Daftar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}