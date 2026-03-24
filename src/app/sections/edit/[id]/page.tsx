"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { influencerApi, productApi } from "@/lib/api";
import { Loader2, Search, Save, Check, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  brand: string;
  image_url?: string;
}

export default function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([influencerApi.getSections(), productApi.getAll()])
      .then(([sectionsRes, productsRes]) => {
        const section = sectionsRes.data.find(
          (s: any) => s._id === id
        );
        if (section) {
          setTitle(section.title);
          setSelectedIds(section.product_ids || []);
        }
        setProducts(productsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProduct = (pid: string) => {
    setSelectedIds((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a section title.");
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      await influencerApi.updateSection(id, {
        title: title.trim(),
        product_ids: selectedIds,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to update section.");
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Section</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update the title and products in this section
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Section Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Select Products ({selectedIds.length} selected)
          </label>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
            {filtered.map((p) => {
              const isSelected = selectedIds.includes(p._id);
              return (
                <button
                  key={p._id}
                  onClick={() => toggleProduct(p._id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left",
                    isSelected && "bg-emerald-50"
                  )}
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300">
                        IMG
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400">{p.brand}</p>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center shrink-0",
                      isSelected
                        ? "bg-emerald-700 border-emerald-700"
                        : "border-slate-300"
                    )}
                  >
                    {isSelected && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400 italic">
                No products found.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
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
          <button
            onClick={() => router.push("/sections")}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
