// ── Landing Page Content Types ─────────────────────────────────────────────

export type ContentType =
  | "hero"
  | "visi"
  | "misi"
  | "struktur_organisasi"
  | "article";

export interface LandingContent {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  active: boolean;
  image: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

/** Content grouped by type for easy section rendering */
export interface GroupedContent {
  hero: LandingContent | null;
  visi: LandingContent | null;
  misi: LandingContent | null;
  struktur_organisasi: LandingContent | null;
}
