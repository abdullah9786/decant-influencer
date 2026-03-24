"use client";

import { useInfluencerStore } from "@/store/useInfluencerStore";
import { User as UserIcon } from "lucide-react";

export default function Header() {
  const { user } = useInfluencerStore();
  const displayName = user?.full_name || user?.email || "Influencer";

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
      <div />
      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900 leading-none">
            {displayName}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
            Creator
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 overflow-hidden">
          <UserIcon size={20} className="text-emerald-600" />
        </div>
      </div>
    </header>
  );
}
