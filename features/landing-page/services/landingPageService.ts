// features/landing-page/services/landingPageService.ts

import { api } from "@/lib/api/client";
import type {
  LandingContent,
  GroupedContent,
  ContentType,
  KnownContentType,
} from "../types";
import { KNOWN_TYPES } from "../types";

// ── Media URL ──────────────────────────────────────────────────────────────

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";

export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${MEDIA_URL}${path}`;
}

// ── API ────────────────────────────────────────────────────────────────────

export async function getLandingPageContents(params?: {
  type?: ContentType;
  active?: boolean;
}): Promise<{ data: LandingContent[] }> {
  try {
    const query = new URLSearchParams();
    if (params?.type) query.set("type", params.type);
    if (params?.active !== undefined)
      query.set("active", String(params.active));
    const qs = query.toString();
    const res = await api.get(`/contents${qs ? `?${qs}` : ""}`);
    return { data: res.data ?? [] };
  } catch {
    return { data: FALLBACK_CONTENTS };
  }
}

export async function createContent(
  body: Omit<
    LandingContent,
    "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
  >,
  imageFile?: File,
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("type", body.type);
  formData.append("title", body.title);
  formData.append("description", body.description);
  formData.append("active", String(body.active));
  if (imageFile) formData.append("image", imageFile);
  const { data } = await api.post("/contents", formData);
  return data;
}

export async function updateContent(
  id: string,
  body: Partial<
    Pick<LandingContent, "title" | "description" | "active" | "image">
  >,
  imageFile?: File,
): Promise<{ message: string }> {
  const formData = new FormData();
  if (body.title !== undefined) formData.append("title", body.title);
  if (body.description !== undefined)
    formData.append("description", body.description);
  if (body.active !== undefined) formData.append("active", String(body.active));
  if (imageFile) formData.append("image", imageFile);
  const { data } = await api.put(`/contents/${id}`, formData);
  return data;
}

export async function deleteContent(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/contents/${id}`);
  return data;
}

// ── Grouping ───────────────────────────────────────────────────────────────

export function groupContentByType(items: LandingContent[]): GroupedContent {
  const active = items.filter((c) => c.active);

  const knownSet = new Set<string>(KNOWN_TYPES);
  const custom: Record<string, LandingContent[]> = {};

  // Collect custom types (tidak ada di KNOWN_TYPES)
  active
    .filter((c) => !knownSet.has(c.type))
    .forEach((c) => {
      if (!custom[c.type]) custom[c.type] = [];
      custom[c.type].push(c);
    });

  return {
    hero: active.find((c) => c.type === "hero") ?? null,
    visi: active.find((c) => c.type === "visi") ?? null,
    misi: active.find((c) => c.type === "misi") ?? null,
    struktur_organisasi:
      active.find((c) => c.type === "struktur_organisasi") ?? null,
    donation_stories: active.filter((c) => c.type === "donation_story"),
    custom,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Semua unique types dari list content */
export function getUniqueTypes(items: LandingContent[]): string[] {
  return [...new Set(items.map((c) => c.type))];
}

/** Label display untuk type */
export function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    hero: "Hero",
    visi: "Visi",
    misi: "Misi",
    struktur_organisasi: "Struktur Organisasi",
    donation_story: "Donation Stories",
  };
  return (
    labels[type] ??
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// ── Fallback ───────────────────────────────────────────────────────────────

const makeFallback = (
  type: KnownContentType,
  title: string,
  description: string,
  image: string | null = null,
): LandingContent => ({
  id: `fallback-${type}`,
  type,
  title,
  description,
  active: true,
  image,
  created_at: "",
  created_by: null,
  updated_at: "",
  updated_by: null,
});

const FALLBACK_CONTENTS: LandingContent[] = [
  makeFallback(
    "hero",
    "UNIT KEGIATAN MAHASISWA PEDULI KEMANUSIAAN UNESA",
    "Bergabunglah bersama kami dalam misi kemanusiaan dan kepedulian sosial.",
    "/images/hero-landing.png",
  ),
  makeFallback("visi", "Visi", "Menjadi UKM terdepan dalam kepedulian sosial."),
  makeFallback(
    "misi",
    "Misi",
    "1. Menyelenggarakan kegiatan sosial.\n2. Membangun jejaring kolaborasi.\n3. Mengembangkan potensi relawan.",
  ),
  makeFallback(
    "struktur_organisasi",
    "Struktur Organisasi",
    "Sinergi kepengurusan untuk efektivitas aksi kemanusiaan.",
    "/images/struktur-organisasi.jpg",
  ),
  makeFallback(
    "donation_story",
    "Bersama Kita Bisa",
    "Setiap donasi digunakan sepenuhnya untuk kegiatan sosial.",
  ),
];
