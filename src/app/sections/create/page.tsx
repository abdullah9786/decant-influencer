"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { influencerApi, productApi, brandApi } from "@/lib/api";
import { Loader2, Search, Plus, Check, Package, Tag, Droplets } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type SectionType = "products" | "brands" | "notes";

interface Product {
  _id: string;
  name: string;
  brand: string;
  image_url?: string;
  notes_top?: string[];
  notes_middle?: string[];
  notes_base?: string[];
  variants?: { size_ml: number; price: number }[];
}

interface Brand {
  _id: string;
  name: string;
  image_url?: string;
}

const TYPE_OPTIONS: { value: SectionType; label: string; icon: typeof Package; description: string }[] = [
  { value: "products", label: "Products", icon: Package, description: "Curate your favourite products" },
  { value: "brands", label: "Brands", icon: Tag, description: "Showcase your go-to brands" },
  { value: "notes", label: "Notes", icon: Droplets, description: "Highlight your favourite fragrance notes" },
];

export default function CreateSectionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sectionType, setSectionType] = useState<SectionType>("products");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([productApi.getAll(), brandApi.getAll()])
      .then(([prodRes, brandRes]) => {
        setProducts(prodRes.data);
        setBrands(brandRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allNotes = useMemo(() => {
    const noteSet = new Set<string>();
    products.forEach((p) => {
      (p.notes_top || []).forEach((n) => noteSet.add(n));
      (p.notes_middle || []).forEach((n) => noteSet.add(n));
      (p.notes_base || []).forEach((n) => noteSet.add(n));
    });
    return Array.from(noteSet).sort();
  }, [products]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNotes = allNotes.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProduct = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleBrand = (name: string) =>
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );

  const toggleNote = (note: string) =>
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((x) => x !== note) : [...prev, note]
    );

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a section title.");
      return;
    }
    setSaving(true);
    try {
      await influencerApi.createSection({
        title: title.trim(),
        section_type: sectionType,
        product_ids: sectionType === "products" ? selectedIds : [],
        brand_names: sectionType === "brands" ? selectedBrands : [],
        note_names: sectionType === "notes" ? selectedNotes : [],
      });
      router.push("/sections");
    } catch {
      alert("Failed to create section.");
    } finally {
      setSaving(false);
    }
  };

  const selectionCount =
    sectionType === "products"
      ? selectedIds.length
      : sectionType === "brands"
      ? selectedBrands.length
      : selectedNotes.length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Section</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add a curated collection to your storefront
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        {/* Section Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Section Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSectionType(opt.value);
                  setSearch("");
                }}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                  sectionType === opt.value
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <opt.icon
                  size={20}
                  className={
                    sectionType === opt.value
                      ? "text-emerald-700"
                      : "text-slate-400"
                  }
                />
                <span
                  className={cn(
                    "text-sm font-bold",
                    sectionType === opt.value
                      ? "text-emerald-800"
                      : "text-slate-600"
                  )}
                >
                  {opt.label}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Section Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              sectionType === "products"
                ? 'e.g. "My Summer Favourites"'
                : sectionType === "brands"
                ? 'e.g. "Brands I Love"'
                : 'e.g. "My Top Notes"'
            }
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Picker */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Select{" "}
            {sectionType === "products"
              ? "Products"
              : sectionType === "brands"
              ? "Brands"
              : "Notes"}{" "}
            ({selectionCount} selected)
          </label>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${sectionType}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-emerald-600" size={24} />
            </div>
          ) : sectionType === "products" ? (
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {filteredProducts.map((p) => {
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
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-400 italic">
                  No products found.
                </div>
              )}
            </div>
          ) : sectionType === "brands" ? (
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {filteredBrands.map((b) => {
                const isSelected = selectedBrands.includes(b.name);
                return (
                  <button
                    key={b._id}
                    onClick={() => toggleBrand(b.name)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left",
                      isSelected && "bg-emerald-50"
                    )}
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      {b.image_url ? (
                        <Image
                          src={b.image_url}
                          alt={b.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-serif text-slate-300">
                          {b.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {b.name}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-emerald-700 border-emerald-700"
                          : "border-slate-300"
                      )}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
              {filteredBrands.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-400 italic">
                  No brands found.
                </div>
              )}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-3">
              <div className="flex flex-wrap gap-2">
                {filteredNotes.map((note) => {
                  const isSelected = selectedNotes.includes(note);
                  return (
                    <button
                      key={note}
                      onClick={() => toggleNote(note)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        isSelected
                          ? "bg-emerald-700 border-emerald-700 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"
                      )}
                    >
                      {note}
                    </button>
                  );
                })}
                {filteredNotes.length === 0 && (
                  <div className="w-full py-6 text-center text-sm text-slate-400 italic">
                    No notes found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Plus size={16} />
            )}
            <span>Create Section</span>
          </button>
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
