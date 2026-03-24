"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { influencerApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

interface Section {
  _id: string;
  title: string;
  product_ids: string[];
  sort_order: number;
  is_active: boolean;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = () => {
    setLoading(true);
    influencerApi
      .getSections()
      .then((r) => setSections(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section? This cannot be undone.")) return;
    try {
      await influencerApi.deleteSection(id);
      setSections((prev) => prev.filter((s) => s._id !== id));
    } catch {
      alert("Failed to delete section.");
    }
  };

  const handleToggleActive = async (section: Section) => {
    try {
      await influencerApi.updateSection(section._id, {
        is_active: !section.is_active,
      });
      setSections((prev) =>
        prev.map((s) =>
          s._id === section._id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch {
      alert("Failed to update section.");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sections</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize your storefront into curated collections
          </p>
        </div>
        <Link
          href="/sections/create"
          className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <Plus size={16} />
          <span>New Section</span>
        </Link>
      </div>

      {sections.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400 italic text-sm">
            No sections yet. Create your first curated collection.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section._id}
              className={cn(
                "bg-white border rounded-xl p-5 flex items-center justify-between",
                section.is_active
                  ? "border-slate-200"
                  : "border-slate-100 opacity-60"
              )}
            >
              <div className="flex items-center space-x-4 min-w-0">
                <GripVertical
                  size={18}
                  className="text-slate-300 shrink-0 cursor-grab"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {section.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {section.product_ids.length} product
                    {section.product_ids.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleToggleActive(section)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  title={section.is_active ? "Hide" : "Show"}
                >
                  {section.is_active ? (
                    <Eye size={16} />
                  ) : (
                    <EyeOff size={16} />
                  )}
                </button>
                <Link
                  href={`/sections/edit/${section._id}`}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(section._id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
