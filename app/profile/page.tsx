"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Edit, LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function Profile() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || "",
          phone_number: data.phone_number || "",
        });
      }
      setLoading(false);
    };

    init();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await supabase.auth.signOut();
    toast.success("Berhasil logout");
    router.push("/");
    router.refresh();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone_number: formData.phone_number,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan profil");
        return;
      }

      const updated = await res.json();
      setProfile(updated);
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Profil</span>
          </div>
          <h1 className="text-3xl">👤 Profil Saya</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div>
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="bg-primary/10 text-primary rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12" />
              </div>
              <h3 className="font-medium">{profile?.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">{profile?.email}</p>
              {profile?.phone_number && (
                <p className="text-sm text-muted-foreground mb-4">{profile.phone_number}</p>
              )}
              {profile?.is_admin && (
                <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full mb-4">
                  Admin
                </span>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl">Informasi Akun</h2>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: profile?.name || "",
                          phone_number: profile?.phone_number || "",
                        });
                      }}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? "Menyimpan..." : "Simpan"}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-muted/30 text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email tidak bisa diubah</p>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border rounded-lg disabled:bg-muted/30"
                    placeholder="Nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Nomor HP</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border rounded-lg disabled:bg-muted/30"
                    placeholder="08xxx"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
