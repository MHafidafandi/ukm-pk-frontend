import { api } from "@/lib/api/client";
import type { LandingContent, GroupedContent, ContentType } from "../types";

// ── API ────────────────────────────────────────────────────────────────────

/** GET /contents — fetch all landing page contents */
export async function getLandingPageContents(): Promise<{
  data: LandingContent[];
}> {
  try {
    const { data } = await api.get("/contents");
    return data;
  } catch {
    // Fallback to static data if API is not available yet
    return { data: FALLBACK_CONTENTS };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Group a flat list of content items by their `type` field */
export function groupContentByType(items: LandingContent[]): GroupedContent {
  const active = items.filter((c) => c.active);

  return {
    hero: active.find((c) => c.type === "hero") ?? null,
    visi: active.find((c) => c.type === "visi") ?? null,
    misi: active.find((c) => c.type === "misi") ?? null,
    struktur_organisasi:
      active.find((c) => c.type === "struktur_organisasi") ?? null,
  };
}

// ── Static fallback content (used when API is unavailable) ─────────────────

const makeFallback = (
  type: ContentType,
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
  created_by: "",
  updated_at: "",
  updated_by: "",
});

const FALLBACK_CONTENTS: LandingContent[] = [
  makeFallback(
    "hero",
    "UNIT KEGIATAN MAHASISWA PEDULI KEMANUSIAAN UNESA",
    "Bergabunglah bersama kami dalam misi kemanusiaan dan kepedulian sosial di lingkungan kampus UNESA dan masyarakat luas. Bersama, kita wujudkan perubahan nyata.",
    "/images/hero-landing.png",
  ),
  makeFallback(
    "visi",
    "Visi",
    "Menjadi Unit Kegiatan Mahasiswa yang unggul dalam bidang kemanusiaan, sosial, dan pengabdian masyarakat berlandaskan nilai ketuhanan, kemanusiaan, dan profesionalitas di tingkat nasional.",
  ),
  makeFallback(
    "misi",
    "Misi",
    "1. Menyelenggarakan kegiatan sosial kemanusiaan secara rutin dan berkelanjutan.\n2. Membangun jejaring kolaborasi dengan lembaga kemanusiaan tingkat nasional dan internasional.\n3. Mengembangkan potensi kepedulian dan jiwa relawan mahasiswa melalui pelatihan profesional.",
  ),
  makeFallback(
    "struktur_organisasi",
    "Struktur Organisasi",
    "Sinergi kepengurusan untuk efektivitas aksi kemanusiaan.",
    "/images/struktur-organisasi.jpg",
  ),
];
