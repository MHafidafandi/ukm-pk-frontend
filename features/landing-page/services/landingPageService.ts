// features/landing-page/services/landingPageService.ts

import { api } from "@/lib/api/client";
import type {
  LandingContent,
  GroupedContent,
  ContentType,
  KnownContentType,
} from "../types";
import { KNOWN_TYPES } from "../types";
import { env } from "@/configs/env";

// ── Media URL ──────────────────────────────────────────────────────────────
const mediaUrl = env.MEDIA_URL;

export function resolveMediaUrl(path: string | null | undefined | any): string {
  if (!path || typeof path !== "string") return "";
  if (path.startsWith("http")) return path;
  return `${mediaUrl}${path}`;
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
  // Always use FormData when there's a file to upload
  if (imageFile) {
    const formData = new FormData();
    formData.append("type", body.type);
    formData.append("title", body.title);
    formData.append("description", body.description);
    formData.append("active", body.active ? "true" : "false");
    formData.append("image", imageFile);
    const { data } = await api.post("/contents", formData, {
      headers: { "Content-Type": undefined },
    });
    return data;
  }

  // No file: send clean JSON — strip `image` field and ensure `active` is boolean
  const { image: _stripImage, ...rest } = body;
  const { data } = await api.post("/contents", {
    ...rest,
    active: Boolean(rest.active),
  });
  return data;
}

export async function updateContent(
  id: string,
  body: Partial<
    Pick<LandingContent, "title" | "description" | "active" | "image">
  >,
  imageFile?: File,
): Promise<{ message: string }> {
  // Always use FormData when there's a file to upload
  if (imageFile) {
    const formData = new FormData();
    if (body.title !== undefined) formData.append("title", body.title);
    if (body.description !== undefined)
      formData.append("description", body.description);
    if (body.active !== undefined)
      formData.append("active", body.active ? "true" : "false");
    formData.append("image", imageFile);
    const { data } = await api.put(`/contents/${id}`, formData, {
      headers: { "Content-Type": undefined },
    });
    return data;
  }

  // No file: send clean JSON — strip `image` field and ensure `active` is boolean
  const { image: _stripImage, ...rest } = body;
  const payload: Record<string, any> = { ...rest };
  if (payload.active !== undefined) payload.active = Boolean(payload.active);
  const { data } = await api.put(`/contents/${id}`, payload);
  return data;
}

export async function deleteContent(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/contents/${id}`);
  return data;
}

export function groupContentByType(contents: LandingContent[]) {
  return {
    hero: contents.find((c) => c.type === "hero") ?? null,
    visi: contents.find((c) => c.type === "visi") ?? null,
    misi: contents.find((c) => c.type === "misi") ?? null,
    struktur_organisasi:
      contents.find((c) => c.type === "struktur_organisasi") ?? null,
    organization: contents.find((c) => c.type === "organization") ?? null,
    // ↓ Tipe baru
    donation_banner: contents.find((c) => c.type === "donation_banner") ?? null,
    donation_stories: contents.filter((c) => c.type === "donation_stories"),
    recruitment_banner:
      contents.find((c) => c.type === "recruitment_banner") ?? null,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
export function getUniqueTypes(items: LandingContent[]): string[] {
  return [...new Set(items.map((c) => c.type))];
}

export function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    organization: "Identitas Organisasi",
    hero: "Hero Banner",
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
    "organization",
    "UKM Peduli Kemanusiaan UNESA",
    "Wadah mahasiswa UNESA untuk berkontribusi secara nyata dalam aksi kemanusiaan dan kepedulian sosial.",
    null,
  ),
  makeFallback(
    "hero",
    "UNIT KEGIATAN MAHASISWA PEDULI KEMANUSIAAN UNESA",
    "Bergabunglah bersama kami dalam misi kemanusiaan dan kepedulian sosial di lingkungan kampus UNESA dan masyarakat luas. Bersama, kita wujudkan perubahan nyata.",
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
