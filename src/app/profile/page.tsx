"use client";

import { useEffect, useState } from "react";
import { influencerApi } from "@/lib/api";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    profile_image_url: "",
    banner_image_url: "",
    payout_upi: "",
  });

  useEffect(() => {
    influencerApi
      .getProfile()
      .then((r) => {
        setProfile(r.data);
        setForm({
          display_name: r.data.display_name || "",
          bio: r.data.bio || "",
          profile_image_url: r.data.profile_image_url || "",
          banner_image_url: r.data.banner_image_url || "",
          payout_upi: r.data.payout_upi || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await influencerApi.updateProfile(form);
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>No influencer profile found. Please contact the admin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your storefront profile and payout details
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Username
          </label>
          <p className="text-sm font-medium text-slate-900 bg-slate-50 px-4 py-3 rounded-lg">
            @{profile.username}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Display Name
          </label>
          <input
            value={form.display_name}
            onChange={(e) =>
              setForm({ ...form, display_name: e.target.value })
            }
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Profile Image URL
          </label>
          <input
            value={form.profile_image_url}
            onChange={(e) =>
              setForm({ ...form, profile_image_url: e.target.value })
            }
            placeholder="https://..."
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {form.profile_image_url && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200 mt-2">
              <Image
                src={form.profile_image_url}
                alt="Profile preview"
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Banner Image URL
          </label>
          <input
            value={form.banner_image_url}
            onChange={(e) =>
              setForm({ ...form, banner_image_url: e.target.value })
            }
            placeholder="https://..."
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {form.banner_image_url && (
            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 mt-2">
              <Image
                src={form.banner_image_url}
                alt="Banner preview"
                fill
                className="object-cover"
                sizes="100%"
              />
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Payout UPI ID
          </label>
          <input
            value={form.payout_upi}
            onChange={(e) =>
              setForm({ ...form, payout_upi: e.target.value })
            }
            placeholder="yourname@upi"
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : saved ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          <span>{saved ? "Saved" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}
