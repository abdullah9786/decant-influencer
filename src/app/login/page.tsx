"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfluencerStore } from "@/store/useInfluencerStore";
import { authApi, influencerApi } from "@/lib/api";
import { Mail, Lock, Loader2, Sparkles } from "lucide-react";

function InfluencerLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("session") === "expired";

  const router = useRouter();
  const setAuth = useInfluencerStore((s) => s.setAuth);

  useEffect(() => {
    if (sessionExpired) {
      setError("Your session expired. Please sign in again.");
    }
  }, [sessionExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      const { access_token, refresh_token, user } = response.data;

      if (!user.is_influencer) {
        setError("Access denied. This portal is for approved influencers only.");
        setLoading(false);
        return;
      }

      setAuth(user, access_token, refresh_token);

      try {
        const profileRes = await influencerApi.getProfile();
        const profile = profileRes.data;
        const { token, refreshToken } = useInfluencerStore.getState();
        setAuth(
          { ...user, username: profile.username },
          token!,
          refreshToken!
        );
      } catch {
        // profile fetch may fail on first login before profile is set up
      }

      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            Influencer Portal
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your storefront
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
                placeholder="Email"
              />
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-lg shadow-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function InfluencerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-emerald-700" size={32} />
        </div>
      }
    >
      <InfluencerLoginForm />
    </Suspense>
  );
}
