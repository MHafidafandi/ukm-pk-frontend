// features/landing-page/components/LandingPageManagerPage.tsx
"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useLandingPageContext } from "@/features/landing-page/contexts/LandingPageContext";
import { resolveMediaUrl } from "@/features/landing-page/services/landingPageService";
import type {
  LandingContent,
  ContentType,
} from "@/features/landing-page/types";
import { toast } from "sonner";
import Image from "next/image";

// ── Config ────────────────────────────────────────────────────────────────────
const CONTENT_TYPES = [
  { value: "hero", label: "Hero Section", icon: "campaign", page: "Home" },
  { value: "visi", label: "Visi", icon: "visibility", page: "Home" },
  { value: "misi", label: "Misi", icon: "architecture", page: "Home" },
  {
    value: "struktur_organisasi",
    label: "Struktur Organisasi",
    icon: "account_tree",
    page: "Home",
  },
  {
    value: "organization",
    label: "Organisasi (Header/Footer)",
    icon: "apartment",
    page: "Global",
  },
  {
    value: "donation_banner",
    label: "Banner Donasi",
    icon: "volunteer_activism",
    page: "/donation",
  },
  {
    value: "donation_stories",
    label: "Kisah Donasi",
    icon: "favorite",
    page: "/donation",
  },
  {
    value: "recruitment_banner",
    label: "Banner Rekrutmen",
    icon: "person_add",
    page: "/recruitment",
  },
  // Login page elements
  {
    value: "login_headline",
    label: "Login – Headline",
    icon: "title",
    page: "Login",
  },
  {
    value: "login_background",
    label: "Login – Background",
    icon: "wallpaper",
    page: "Login",
  },
  {
    value: "login_stat_1",
    label: "Login – Stat 1",
    icon: "trending_up",
    page: "Login",
  },
  {
    value: "login_stat_2",
    label: "Login – Stat 2",
    icon: "trending_up",
    page: "Login",
  },
  {
    value: "login_welcome",
    label: "Login – Welcome",
    icon: "waving_hand",
    page: "Login",
  },
] as const;

type KnownType = (typeof CONTENT_TYPES)[number]["value"];

const TYPE_META = Object.fromEntries(
  CONTENT_TYPES.map((t) => [t.value, { icon: t.icon, label: t.label, page: t.page }]),
) as Record<string, { icon: string; label: string; page: string }>;

// ── Dynamic Field Config ──────────────────────────────────────────────────────
type FieldName = "title" | "description" | "image";

const TYPE_FIELDS: Record<string, FieldName[]> = {
  hero: ["title", "description", "image"],
  visi: ["title", "description"],
  misi: ["title", "description"],
  struktur_organisasi: ["title", "description", "image"],
  organization: ["title", "description", "image"],
  donation_banner: ["title", "description", "image"],
  donation_stories: ["title", "description", "image"],
  recruitment_banner: ["title", "description", "image"],
  login_headline: ["title", "description"],
  login_background: ["image"],
  login_stat_1: ["title", "description"],
  login_stat_2: ["title", "description"],
  login_welcome: ["title", "description"],
};

const getFieldsForType = (type: string): FieldName[] =>
  TYPE_FIELDS[type] ?? ["title", "description"];

// ── Debounce Hook ─────────────────────────────────────────────────────────────
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debouncedFn;
}

// ── Inline Content Card ───────────────────────────────────────────────────────
interface ContentCardProps {
  content: LandingContent;
  onUpdate: (
    id: string,
    body: Partial<Pick<LandingContent, "title" | "description" | "active" | "image">>,
    imageFile?: File,
  ) => Promise<any>;
  onDelete: (content: LandingContent) => void;
  isSaving: boolean;
}

function ContentCard({ content, onUpdate, onDelete, isSaving }: ContentCardProps) {
  const meta = TYPE_META[content.type] ?? {
    icon: "article",
    label: content.type,
    page: "—",
  };
  const fields = getFieldsForType(content.type);
  const isActive = Boolean(content.active);

  // Local editing state
  const [localTitle, setLocalTitle] = useState(content.title);
  const [localDesc, setLocalDesc] = useState(content.description);
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);
  const [cardSaving, setCardSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when content changes from server
  useEffect(() => {
    if (!focusedField || focusedField !== "title") setLocalTitle(content.title);
    if (!focusedField || focusedField !== "description") setLocalDesc(content.description);
  }, [content.title, content.description, focusedField]);

  // Debounced save for text fields
  const debouncedSave = useDebouncedCallback(
    async (field: "title" | "description", value: string) => {
      setCardSaving(true);
      try {
        await onUpdate(content.id, { [field]: value });
      } finally {
        setCardSaving(false);
      }
    },
    800,
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalTitle(value);
    debouncedSave("title", value);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalDesc(value);
    debouncedSave("description", value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCardSaving(true);
    try {
      await onUpdate(content.id, {}, file);
      toast.success("Gambar berhasil diupload");
    } finally {
      setCardSaving(false);
      // Reset the file input so clicking again works
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleActive = async () => {
    setCardSaving(true);
    try {
      await onUpdate(content.id, { active: !isActive });
    } finally {
      setCardSaving(false);
    }
  };

  // ── Field Renderers ──
  const renderField = (field: FieldName) => {
    switch (field) {
      case "title":
        return (
          <div key="title" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs opacity-50">title</span>
              Judul
            </label>
            <input
              value={localTitle}
              onChange={handleTitleChange}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              placeholder="Ketik judul…"
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/40
                bg-transparent border border-transparent
                hover:bg-surface-container-low hover:border-outline-variant/20
                focus:bg-surface-container-low focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                transition-all duration-200 outline-none"
            />
          </div>
        );

      case "description":
        return (
          <div key="description" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs opacity-50">notes</span>
              Deskripsi
            </label>
            <textarea
              value={localDesc}
              onChange={handleDescChange}
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
              placeholder="Ketik deskripsi…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none leading-relaxed
                bg-transparent border border-transparent
                hover:bg-surface-container-low hover:border-outline-variant/20
                focus:bg-surface-container-low focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                transition-all duration-200 outline-none"
            />
            {content.type === "misi" && (
              <p className="text-[10px] text-on-surface-variant/70 pl-1">
                Tip: Pisahkan tiap poin dengan baris baru. Awali dengan angka.
              </p>
            )}
          </div>
        );

      case "image":
        return (
          <div key="image" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs opacity-50">image</span>
              Gambar
            </label>
            <div className="relative group/img">
              {content.image ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-surface-container-high">
                  <Image
                    src={resolveMediaUrl(content.image)}
                    alt={content.title || "Preview"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="opacity-0 group-hover/img:opacity-100 transition-all duration-300 transform scale-90 group-hover/img:scale-100
                        px-4 py-2 bg-white/90 backdrop-blur-sm text-on-surface text-xs font-bold rounded-lg shadow-lg
                        hover:bg-white flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">swap_horiz</span>
                      Ganti Gambar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 rounded-xl border-2 border-dashed border-outline-variant/30
                    bg-surface-container-low hover:border-primary/40 hover:bg-primary/5
                    transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-2xl text-on-surface-variant/30">
                    cloud_upload
                  </span>
                  <span className="text-xs text-on-surface-variant/60 font-medium">
                    Klik untuk upload gambar
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300
        border bg-surface-container-lowest
        hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5
        ${!isActive
          ? "opacity-70 border-dashed border-outline-variant/30"
          : "border-outline-variant/10 hover:border-primary/20"
        }
        ${cardSaving ? "pointer-events-none" : ""}
      `}
    >
      {/* Saving indicator overlay */}
      {cardSaving && (
        <div className="absolute inset-0 z-20 bg-surface/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-full shadow-md border border-outline-variant/20">
            <span className="material-symbols-outlined text-sm text-primary animate-spin">
              progress_activity
            </span>
            <span className="text-xs font-bold text-on-surface-variant">Menyimpan…</span>
          </div>
        </div>
      )}

      {/* ── Card Header ── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(0,68,75,0.06) 0%, rgba(0,93,103,0.03) 100%)"
            : "linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 100%)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
              ${isActive
                ? "bg-primary/10 text-primary"
                : "bg-surface-container-high text-on-surface-variant"
              }`}
          >
            <span className="material-symbols-outlined text-lg">{meta.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-on-surface truncate">
                {meta.label}
              </span>
              <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-secondary-container text-on-secondary-fixed-variant text-[9px] font-bold">
                {meta.page}
              </span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider transition-colors
            ${isActive
              ? "bg-[#dffff8] text-primary border border-primary/10"
              : "bg-[#ffecd9] text-[#e67e22] border border-[#e67e22]/20"
            }`}
        >
          {isActive ? "ACTIVE" : "DRAFT"}
        </span>
      </div>

      {/* ── Card Body — Dynamic Fields ── */}
      <div className="px-5 py-4 space-y-4">
        {fields.map((field) => renderField(field))}
      </div>

      {/* ── Card Footer ── */}
      <div className="px-5 py-3 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest">
        {/* Toggle Active */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleActive}
            className={`relative w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-300
              ${isActive ? "bg-primary" : "bg-surface-container-high"}`}
            title={isActive ? "Nonaktifkan" : "Aktifkan"}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300
                ${isActive ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider select-none">
            {isActive ? "Tampil" : "Tersembunyi"}
          </span>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(content)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400
            hover:bg-red-50 hover:text-red-500 rounded-lg transition-all duration-200
            opacity-0 group-hover:opacity-100"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
          Hapus
        </button>
      </div>
    </div>
  );
}

// ── Create Content Card ───────────────────────────────────────────────────────
interface CreateCardProps {
  onCreate: (
    body: Omit<LandingContent, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">,
    imageFile?: File,
  ) => Promise<any>;
  isCreating: boolean;
}

function CreateContentCard({ onCreate, isCreating }: CreateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<KnownType>("hero");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fields = getFieldsForType(type);

  const handleSubmit = async () => {
    if (!title.trim() && fields.includes("title")) {
      toast.error("Judul tidak boleh kosong");
      return;
    }
    await onCreate(
      { type, title, description, active, image: null },
      file ?? undefined,
    );
    // Reset
    setTitle("");
    setDescription("");
    setFile(null);
    setActive(true);
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-2xl border-2 border-dashed border-outline-variant/30 py-8
          bg-surface-container-lowest hover:border-primary/40 hover:bg-primary/5 hover:shadow-md
          transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center
          group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
          <span className="material-symbols-outlined text-2xl text-primary">add</span>
        </div>
        <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">
          Tambah Konten Baru
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-surface-container-lowest overflow-hidden shadow-lg shadow-primary/5
      animate-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, rgba(0,68,75,0.08) 0%, rgba(0,93,103,0.04) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">add_circle</span>
          </div>
          <span className="text-sm font-bold text-on-surface">Konten Baru</span>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Type selector */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-xs opacity-50">category</span>
            Tipe Konten
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as KnownType)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-sm font-semibold text-on-surface
              focus:outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/20
              hover:border-primary/30 transition-all"
          >
            {CONTENT_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label} — {ct.page}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic fields */}
        {fields.includes("title") && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs opacity-50">title</span>
              Judul
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ketik judul…"
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/40
                bg-surface-container-low border border-outline-variant/20
                focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                transition-all duration-200 outline-none"
            />
          </div>
        )}

        {fields.includes("description") && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs opacity-50">notes</span>
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ketik deskripsi…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none leading-relaxed
                bg-surface-container-low border border-outline-variant/20
                focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                transition-all duration-200 outline-none"
            />
          </div>
        )}

        {fields.includes("image") && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs opacity-50">image</span>
              Gambar
            </label>
            <label
              className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-outline-variant/30 rounded-xl cursor-pointer
                hover:border-primary/40 hover:bg-primary/5 transition-all bg-surface-container-low"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span className="material-symbols-outlined text-xl text-on-surface-variant/40">
                cloud_upload
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                {file ? file.name : "Klik untuk upload gambar"}
              </span>
            </label>
          </div>
        )}

        {/* Active toggle */}
        <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-surface-container-low">
          <div>
            <p className="font-bold text-sm text-on-surface">Aktif / Tampil</p>
            <p className="text-[10px] text-on-surface-variant">
              Konten aktif akan tampil di halaman publik
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-300
              ${active ? "bg-primary" : "bg-surface-container-high"}`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300
                ${active ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-outline-variant/10 flex gap-3">
        <button
          onClick={() => setExpanded(false)}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/20 text-on-surface
            hover:bg-surface-container-low transition-all"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20
            hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #00444B 0%, #005D67 100%)",
          }}
        >
          {isCreating ? (
            <>
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
              Menyimpan…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">save</span>
              Simpan
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPageManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    contents,
    isFetching,
    totalActive,
    totalInactive,
    uniqueTypes,
    createContent,
    updateContent,
    deleteContent,
    isCreating,
    isUpdating,
  } = useLandingPageContext();

  const typeOrder = useMemo(() => {
    return Object.fromEntries(CONTENT_TYPES.map((t, i) => [t.value, i]));
  }, []);

  const processedContents = useMemo(() => {
    let result = [...contents];
    if (searchQuery.trim()) {
      const qs = searchQuery.toLowerCase();
      result = result.filter(c => 
        (c.title || "").toLowerCase().includes(qs) || 
        (c.description || "").toLowerCase().includes(qs) ||
        (TYPE_META[c.type]?.label || "").toLowerCase().includes(qs)
      );
    }
    result.sort((a, b) => {
      const orderA = typeOrder[a.type] ?? 999;
      const orderB = typeOrder[b.type] ?? 999;
      return orderA - orderB;
    });
    return result;
  }, [contents, searchQuery, typeOrder]);

  const handleDelete = async (content: LandingContent) => {
    if (!confirm(`Hapus "${content.title}"?`)) return;
    await deleteContent(content.id);
  };

  return (
    <main className="flex-grow p-8 space-y-8 bg-surface min-h-screen pb-32">
      {/* ── Breadcrumbs & Title ── */}
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex text-[11px] text-on-surface-variant font-medium mb-1.5 space-x-1 uppercase tracking-wider font-['Inter']">
            <span>Portal</span>
            <span className="mx-1">/</span>
            <span className="text-primary font-bold">Content Manager</span>
          </nav>
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight font-['Manrope']">
            Landing Page Curator
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Edit konten langsung di kartu — perubahan tersimpan otomatis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center px-4 py-2 bg-surface-variant/30 rounded-full text-on-surface-variant text-sm font-semibold shadow-sm border border-outline-variant/20">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full mr-2"></span>
            Live Version
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: contents.length, icon: "article", color: "text-primary", bg: "bg-primary/5" },
          { label: "Aktif", value: totalActive, icon: "check_circle", color: "text-secondary", bg: "bg-secondary/5" },
          { label: "Nonaktif", value: totalInactive, icon: "cancel", color: "text-error", bg: "bg-error/5" },
          { label: "Tipe", value: uniqueTypes, icon: "category", color: "text-tertiary", bg: "bg-tertiary/5" },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} p-5 rounded-2xl text-center border border-outline-variant/10 hover:shadow-md transition-all duration-300`}
          >
            <span className={`material-symbols-outlined ${s.color} mb-1.5 block text-xl`}>
              {s.icon}
            </span>
            <p className="font-['Manrope'] text-2xl font-extrabold text-on-surface">
              {s.value}
            </p>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
              {s.label}
            </p>
          </div>
        ))}
      </div>



      {/* ── Search Bar ── */}
      <div className="flex items-center bg-surface-container-lowest rounded-2xl px-5 py-3.5 border border-outline-variant/20 shadow-sm hover:border-primary/40 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
        <span className="material-symbols-outlined text-primary/70 mr-3 text-[22px]">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan judul, deskripsi, atau tipe konten..."
          className="w-full bg-transparent text-[15px] font-medium text-on-surface focus:outline-none placeholder:text-on-surface-variant/40"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="p-1.5 hover:bg-surface-container rounded-lg transition-colors ml-2 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-on-surface text-sm">close</span>
          </button>
        )}
      </div>

      {/* ── Content Cards Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-['Manrope'] text-xl font-extrabold text-on-surface flex items-center">
            <span className="material-symbols-outlined mr-3 text-secondary">layers</span>
            Content Cards
          </h3>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            {processedContents.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start auto-rows-max grid-flow-dense">
          {/* Loading skeletons */}
          {isFetching && contents.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className={`animate-pulse rounded-2xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden ${i === 0 ? "col-span-1 md:col-span-2 xl:col-span-3" : ""
                  }`}
              >
                <div className="h-14 bg-surface-container-low" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-surface-container-low rounded-lg w-3/4" />
                  <div className="h-3 bg-surface-container-low rounded-lg w-full" />
                  <div className="h-3 bg-surface-container-low rounded-lg w-2/3" />
                  <div className="h-24 bg-surface-container-low rounded-xl" />
                </div>
                <div className="h-12 bg-surface-container-low border-t border-outline-variant/10" />
              </div>
            ))
            : processedContents.length === 0
              ? (
                <div className="col-span-full flex flex-col items-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/30">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-20">
                    search_off
                  </span>
                  <p className="font-bold">Tidak ada konten ditemukan</p>
                  <p className="text-sm mt-1">
                    Coba sesuaikan kata kunci pencarian Anda.
                  </p>
                </div>
              )
              : processedContents.map((content) => {
                // Determine card layout span based on content type
                let spanClass = "col-span-1";
                if (content.type.includes("hero") || content.type.includes("banner")) {
                  spanClass = "col-span-1 md:col-span-2 xl:col-span-3"; // Full width
                } else if (content.type === "struktur_organisasi" || content.type === "organization") {
                  spanClass = "col-span-1 md:col-span-2"; // Two columns wide
                } else if (content.type.startsWith("donation_")) {
                  spanClass = "col-span-1"; // Standard
                }

                return (
                  <div key={content.id} className={`${spanClass}`}>
                    <ContentCard
                      content={content}
                      onUpdate={updateContent}
                      onDelete={handleDelete}
                      isSaving={isUpdating}
                    />
                  </div>
                );
              })
          }

          {/* Create new card */}
          <CreateContentCard
            onCreate={createContent}
            isCreating={isCreating}
          />
        </div>
      </div>

      {/* ── Fixed Footer ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:ml-64 bg-surface/90 backdrop-blur-xl px-8 py-4 border-t border-outline-variant/10 flex items-center justify-between z-40">
        <div className="flex items-center space-x-2 text-xs text-on-surface-variant font-medium font-['Inter']">
          <span className="material-symbols-outlined text-sm text-secondary">history</span>
          <span>Auto-saved</span>
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant font-medium">
            {contents.length} konten · {totalActive} aktif
          </span>
        </div>
      </div>
    </main>
  );
}
