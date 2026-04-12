// features/landing-page/types/index.ts

// Type yang punya render khusus di landing page
export const KNOWN_TYPES = [
  "organization", // nama, deskripsi singkat, logo organisasi
  "hero",
  "visi",
  "misi",
  "struktur_organisasi",
  "donation_story",
] as const;

export type KnownContentType = (typeof KNOWN_TYPES)[number];

// Type bisa apa saja — admin bebas ketik
export type ContentType = KnownContentType | string;

// Type yang boleh punya banyak item
export const MULTIPLE_TYPES: ContentType[] = ["donation_story"];

export function isMultipleType(type: ContentType): boolean {
  return MULTIPLE_TYPES.includes(type);
}

export interface LandingContent {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  active: boolean;
  image: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

// Grouped by type
export interface GroupedContent {
  organization: LandingContent | null; // nama & logo organisasi
  hero: LandingContent | null;
  visi: LandingContent | null;
  misi: LandingContent | null;
  struktur_organisasi: LandingContent | null;
  donation_stories: LandingContent[];
  custom: Record<string, LandingContent[]>;
}
