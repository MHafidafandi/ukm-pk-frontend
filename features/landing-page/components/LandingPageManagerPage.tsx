// features/landing-page/components/LandingPageManagerPage.tsx
"use client";

import { useState, useRef } from "react";
import { useLandingPageContext } from "@/features/landing-page/contexts/LandingPageContext";
import { resolveMediaUrl } from "@/features/landing-page/services/landingPageService";
import type {
  LandingContent,
  ContentType,
} from "@/features/landing-page/types";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

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

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ContentModalProps {
  initial?: Partial<LandingContent>;
  onClose: () => void;
  onSave: (
    body: Omit<
      LandingContent,
      "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
    >,
    imageFile?: File,
  ) => Promise<void>;
  saving: boolean;
}

function ContentModal({ initial, onClose, onSave, saving }: ContentModalProps) {
  const [type, setType] = useState<KnownType>(
    (initial?.type as KnownType) ?? "hero",
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(
      { type, title, description, active: Boolean(active), image: initial?.image ?? null },
      file ?? undefined,
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className="px-8 py-6 text-white"
          style={{
            background: "linear-gradient(135deg, #00444B 0%, #005D67 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs uppercase tracking-widest mb-1">
                {initial?.id ? "Edit Konten" : "Tambah Konten Baru"}
              </p>
              <h3 className="font-['Manrope'] text-xl font-extrabold">
                {initial?.id ? initial.title : "Buat Konten"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-white">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-5"
        >
          {/* Tipe */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Tipe Konten
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as KnownType)}
              disabled={!!initial?.id}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            >
              {CONTENT_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label} — {ct.page}
                </option>
              ))}
            </select>
          </div>

          {/* Judul */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Judul
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul konten…"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Deskripsi / Isi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Isi konten…"
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            {type === "misi" && (
              <p className="mt-1 text-xs text-on-surface-variant">
                Tip: Pisahkan tiap poin dengan baris baru. Awali dengan angka,
                contoh: &ldquo;1. Menyelenggarakan…&rdquo;
              </p>
            )}
          </div>

          {/* Gambar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Gambar (opsional)
            </label>
            <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-outline-variant/30 rounded-xl cursor-pointer hover:border-primary/40 transition-all bg-surface-container-low">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span className="material-symbols-outlined text-on-surface-variant/40">
                upload_file
              </span>
              <span className="text-xs text-on-surface-variant">
                {file ? file.name : "Klik untuk upload gambar"}
              </span>
            </label>
          </div>

          {/* Toggle aktif */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface-container-low">
            <div>
              <p className="font-bold text-sm text-on-surface">
                Aktif / Tampil
              </p>
              <p className="text-xs text-on-surface-variant">
                Konten aktif akan tampil di halaman publik
              </p>
            </div>
            <div
              className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${active ? "bg-primary" : "bg-surface-container-high"}`}
              onClick={() => setActive(!active)}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? "translate-x-6" : "translate-x-0"}`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold border border-outline-variant/30 text-on-surface hover:bg-surface-container-low transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #00444B 0%, #005D67 100%)",
              }}
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">
                    progress_activity
                  </span>
                  Menyimpan…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">
                    save
                  </span>
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPageManagerPage() {
  const {
    contents,
    filteredContents,
    isFetching,
    typeFilter,
    setTypeFilter,
    totalActive,
    totalInactive,
    uniqueTypes,
    grouped,
    createContent,
    updateContent,
    deleteContent,
    isCreating,
    isUpdating,
  } = useLandingPageContext();

  const [modal, setModal] = useState<{
    open: boolean;
    editing?: LandingContent;
  }>({ open: false });

  const isSaving = isCreating || isUpdating;

  const handleSave = async (
    body: Omit<
      LandingContent,
      "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
    >,
    imageFile?: File,
  ) => {
    // Ensure active is always a boolean
    const safeBody = { ...body, active: Boolean(body.active) };
    if (modal.editing) {
      await updateContent(modal.editing.id, safeBody, imageFile);
    } else {
      await createContent(safeBody, imageFile);
    }
    setModal({ open: false });
  };

  const handleDelete = async (content: LandingContent) => {
    if (!confirm(`Hapus "${content.title}"?`)) return;
    await deleteContent(content.id);
  };

  const handleToggleActive = async (content: LandingContent) => {
    await updateContent(content.id, { active: Boolean(!content.active) });
  };

  // Separate hero content for the Hero Section Manager
  const heroContent = grouped.hero;

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
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center px-4 py-2 bg-surface-variant/30 rounded-full text-on-surface-variant text-sm font-semibold shadow-sm border border-outline-variant/20">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full mr-2"></span>
            Live Version
          </div>
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            style={{
              background: "linear-gradient(135deg, #00444B 0%, #005D67 100%)",
            }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            Tambah Konten
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ── Left Col: Hero Section Manager ── */}
        <div className="col-span-12 xl:col-span-8 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-['Manrope'] text-xl font-extrabold text-on-surface flex items-center">
              <span className="material-symbols-outlined mr-3 text-on-surface">campaign</span>
              Hero Section Manager
            </h3>
            {heroContent && (
              <button
                onClick={() => setModal({ open: true, editing: heroContent })}
                className="text-sm font-bold text-primary hover:underline"
              >
                Edit Hero
              </button>
            )}
          </div>

          {heroContent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Main Headline</label>
                  <div className="w-full bg-surface-container-low text-on-surface font-semibold text-sm px-4 py-3 rounded-xl">
                    {heroContent.title || "—"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Subtitle Text</label>
                  <div className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-xl min-h-[7rem] whitespace-pre-wrap">
                    {heroContent.description || "—"}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal({ open: true, editing: heroContent })}
                    className="flex-1 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface text-sm font-bold py-3 rounded-xl"
                  >
                    <span className="material-symbols-outlined text-sm">image</span>
                    Change Image
                  </button>
                  <button className="w-12 flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface rounded-xl">
                    <span className="material-symbols-outlined text-sm">palette</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-full h-40 bg-surface-container-high rounded-2xl overflow-hidden relative">
                  {heroContent.image ? (
                    <Image
                      src={resolveMediaUrl(heroContent.image)}
                      alt={heroContent.title}
                      fill
                      className="object-cover opacity-80 mix-blend-multiply"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">Recommended:<br />1920×1080px</span>
                  <span className="font-bold text-primary text-right">Optimized for<br />Web</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-3 opacity-20">campaign</span>
              <p className="font-bold">Belum ada Hero content</p>
              <button
                onClick={() => {
                  setModal({ open: true });
                }}
                className="mt-3 text-sm text-primary font-bold hover:underline"
              >
                + Tambah Hero
              </button>
            </div>
          )}
        </div>

        {/* ── Right Col: Stats ── */}
        <div className="col-span-12 xl:col-span-4 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-['Manrope'] text-xl font-extrabold text-on-surface flex items-center">
              <span className="material-symbols-outlined mr-3 text-secondary">bar_chart</span>
              Content Stats
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Total", value: contents.length, icon: "article", color: "text-primary" },
              { label: "Aktif", value: totalActive, icon: "check_circle", color: "text-secondary" },
              { label: "Nonaktif", value: totalInactive, icon: "cancel", color: "text-error" },
              { label: "Tipe", value: uniqueTypes, icon: "category", color: "text-tertiary" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-surface-container-low p-4 rounded-xl text-center"
              >
                <span className={`material-symbols-outlined ${s.color} mb-1 block text-xl`}>
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

          <div className="flex-1">
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Content Types</h4>
            <div className="space-y-2.5">
              {CONTENT_TYPES.slice(0, 5).map((ct) => {
                const count = contents.filter((c) => c.type === ct.value).length;
                return (
                  <div key={ct.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">{ct.icon}</span>
                      <span className="text-sm font-semibold text-on-surface">{ct.label}</span>
                    </div>
                    <span className="text-sm font-bold text-on-surface bg-surface-container-high px-2 py-0.5 rounded-full">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Filter chips ── */}
        <div className="col-span-12 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mr-1">
            Filter:
          </span>
          {[
            { value: "all", label: "Semua" },
            ...CONTENT_TYPES.map((t) => ({ value: t.value, label: t.label })),
            { value: "inactive", label: "Nonaktif" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${typeFilter === f.value
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Modular Content Blocks ── */}
        <div className="col-span-12 bg-surface-container-high rounded-3xl p-8 shadow-inner overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-['Manrope'] text-xl font-extrabold text-on-surface flex items-center">
              <span className="material-symbols-outlined mr-3 text-secondary">layers</span>
              Modular Content Blocks
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hidden sm:block">
                {filteredContents.length} items
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {isFetching && contents.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-20 rounded-2xl bg-surface-container-lowest"
                />
              ))
            ) : filteredContents.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/30">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-20">
                  article
                </span>
                <p className="font-bold">Belum ada konten</p>
                <p className="text-sm mt-1">
                  Klik &ldquo;Tambah Konten&rdquo; untuk memulai.
                </p>
              </div>
            ) : (
              filteredContents.map((content) => {
                const meta = TYPE_META[content.type] ?? {
                  icon: "article",
                  label: content.type,
                  page: "—",
                };
                const isActive = Boolean(content.active);
                const hasImage = !!content.image;
                return (
                  <div
                    key={content.id}
                    className={`bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-md transition-all group border ${!isActive ? "opacity-70 border-dashed border-outline-variant/30" : "border-outline-variant/10"
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image preview */}
                      <div className="w-full sm:w-48 h-36 sm:h-auto bg-surface-container-high relative flex-shrink-0 overflow-hidden">
                        {hasImage ? (
                          <Image
                            src={resolveMediaUrl(content.image)}
                            alt={content.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex h-full min-h-[8rem] items-center justify-center bg-surface-container">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">
                              {meta.icon}
                            </span>
                          </div>
                        )}
                        {/* Type badge overlay */}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      {/* Content info */}
                      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-['Manrope'] font-bold text-on-surface text-base truncate">
                              {content.title || "Tanpa Judul"}
                            </h4>
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-[10px] font-bold">
                              {meta.page}
                            </span>
                            <span
                              className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${isActive
                                ? "bg-[#dffff8] text-primary border border-primary/10"
                                : "bg-[#ffecd9] text-[#e67e22] border border-[#e67e22]/20"
                                }`}
                            >
                              {isActive ? "ACTIVE" : "DRAFT"}
                            </span>
                          </div>
                          <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                            {content.description || "Tidak ada deskripsi."}
                          </p>
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/10">
                          {/* Toggle */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${isActive ? "bg-primary" : "bg-surface-container-high"}`}
                              title={isActive ? "Nonaktifkan" : "Aktifkan"}
                              onClick={() => handleToggleActive(content)}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform ${isActive ? "translate-x-5" : "translate-x-0"}`}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                              {isActive ? "Tampil" : "Tersembunyi"}
                            </span>
                          </div>

                          {/* Edit & Delete */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setModal({ open: true, editing: content })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(content)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Fixed Footer Actions ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:ml-64 bg-surface/90 backdrop-blur-xl px-8 py-5 border-t border-outline-variant/10 flex items-center justify-between z-40">
        <div className="flex items-center space-x-2 text-xs text-on-surface-variant font-medium font-['Inter']">
          <span className="material-symbols-outlined text-sm text-secondary">history</span>
          <span>Auto-saved</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-xl text-on-surface text-sm font-bold hover:bg-surface-container-high transition-colors">
            Discard Changes
          </button>
          <button className="px-6 py-2.5 bg-surface-container-high text-on-surface border border-outline-variant/20 rounded-xl text-sm font-bold shadow-sm hover:bg-surface-container-highest transition-all">
            Save Draft
          </button>
          <button
            className="px-8 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, #00444B 0%, #005D67 100%)" }}
          >
            Publish to Public Site
          </button>
        </div>
      </div>

      {/* ── Modal ── */}
      {modal.open && (
        <ContentModal
          initial={modal.editing}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
          saving={isSaving}
        />
      )}
    </main>
  );
}
