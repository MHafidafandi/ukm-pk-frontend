// app/(landing)/activities/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  CalendarDays,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";
import { resolveMediaUrl } from "@/features/landing-page/services/landingPageService";
import { PublicActivity } from "@/features/landing-page/services/publicOverviewService";
import { usePublicLandingContext } from "@/features/landing-page/contexts/PublicLandingPageContext";

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  perencanaan: "Perencanaan",
  berjalan: "Sedang Berjalan",
  selesai: "Selesai",
  draft: "Draft",
};
const STATUS_CLASS: Record<string, string> = {
  perencanaan: "bg-blue-100 text-blue-700",
  berjalan: "bg-emerald-100 text-emerald-700",
  selesai: "bg-surface-container-highest text-on-surface-variant",
  draft: "bg-amber-100 text-amber-700",
};
const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "berjalan", label: "Sedang Berjalan" },
  { value: "perencanaan", label: "Perencanaan" },
  { value: "selesai", label: "Selesai" },
];
const formatDate = (d: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(d));

// ── Skeleton ──────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-surface-container-lowest overflow-hidden">
    <div className="h-48 bg-surface-container" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-1/3 bg-surface-container rounded-full" />
      <div className="h-5 w-2/3 bg-surface-container rounded-full" />
      <div className="h-4 w-full bg-surface-container rounded-full" />
    </div>
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────
function ActivityCard({ activity }: { activity: PublicActivity }) {
  return (
    <Link
      href={`/activities/${activity.id}`}
      className="group block rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-outline-variant/10"
    >
      <div className="relative h-48 w-full overflow-hidden bg-surface-container">
        {activity.thumbnail ? (
          <Image
            src={resolveMediaUrl(activity.thumbnail)}
            alt={activity.judul}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">
              event
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_CLASS[activity.status] ?? STATUS_CLASS.draft}`}
          >
            {activity.status === "berjalan" && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {STATUS_LABEL[activity.status] ?? activity.status}
          </span>
        </div>
        {activity.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-900">
              <Star className="size-3 fill-current" /> Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-['Manrope'] font-bold text-on-surface text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {activity.judul}
        </h3>
        <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
          {activity.deskripsi}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-primary" />
            {formatDate(activity.tanggal)}
          </span>
          {activity.lokasi && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              <span className="truncate max-w-[140px]">{activity.lokasi}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ActivitiesPage() {
  const {
    publicActivities,
    isLoadingActivities,
    activitySearch,
    setActivitySearch,
    activityStatus,
    setActivityStatus,
  } = usePublicLandingContext();

  return (
    <main className="min-h-screen bg-surface pt-20">
      {/* Hero Banner */}
      <section
        className="relative py-20 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-2 text-white/60 text-sm mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Aktivitas</span>
          </nav>
          <h1 className="font-['Manrope'] text-5xl md:text-6xl font-extrabold text-white mb-4">
            Kegiatan Organisasi
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            Semua kegiatan sosial, kemanusiaan, dan pemberdayaan masyarakat yang
            kami selenggarakan.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
              <input
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Cari kegiatan…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="size-4 text-on-surface-variant shrink-0" />
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActivityStatus(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activityStatus === f.value
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {!isLoadingActivities && (
          <p className="text-sm text-on-surface-variant mb-6">
            Menampilkan{" "}
            <span className="font-bold text-on-surface">
              {publicActivities.length}
            </span>{" "}
            kegiatan
            {activitySearch && (
              <>
                {" "}
                untuk{" "}
                <span className="font-bold text-primary">
                  &ldquo;{activitySearch}&rdquo;
                </span>
              </>
            )}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingActivities
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : publicActivities.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
        </div>

        {!isLoadingActivities && publicActivities.length === 0 && (
          <div className="flex flex-col items-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">
              event_busy
            </span>
            <p className="font-['Manrope'] font-bold text-xl mb-1">
              Tidak ada kegiatan
            </p>
            <p className="text-sm">
              Coba ubah filter atau kata kunci pencarian.
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-['Manrope'] text-3xl font-extrabold text-on-surface mb-3">
            Ingin Ikut Berkontribusi?
          </h2>
          <p className="text-on-surface-variant mb-8">
            Daftarkan diri sebagai relawan atau donasikan untuk mendukung
            kegiatan kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recruitments"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              style={{
                background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
              }}
            >
              Daftar Rekrutmen <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/donations"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-outline-variant/40 text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-all"
            >
              Donasi Sekarang
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
