"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Heart,
  MapPin,
  Megaphone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { getPublicActivities } from "../services/publicOverviewService";
import {
  getLandingPageContents,
  groupContentByType,
  resolveMediaUrl,
} from "../services/landingPageService";
import type { LandingContent } from "../types";
import { queryKeys } from "@/lib/query-keys";

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  perencanaan: "Planning",
  berjalan: "Ongoing",
  selesai: "Completed",
  draft: "Draft",
};

const STATUS_CLASS: Record<string, string> = {
  perencanaan:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  berjalan:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
  selesai:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  draft:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
};

const formatDate = (d: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

const CardSkeleton = () => (
  <div className="animate-pulse space-y-3 rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border-dark dark:bg-surface-dark">
    <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
    <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
    <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
  </div>
);

// ── Main ───────────────────────────────────────────────────────────────────

export default function PublicOverviewSection() {
  const { data: featuredData, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["landing", "activities", "featured"],
    queryFn: () => getPublicActivities(3, true),
  });

  const hasFeatured = (featuredData?.activities?.length ?? 0) > 0;

  const { data: latestData, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["landing", "activities", "latest"],
    queryFn: () => getPublicActivities(3, false),
    enabled: !isLoadingFeatured && !hasFeatured,
  });

  const { data: contentsData, isLoading: isLoadingContents } = useQuery<{
    data: LandingContent[];
  }>({
    queryKey: queryKeys.landingContents.list(),
    queryFn: () => getLandingPageContents({ active: true }),
  });

  const grouped = groupContentByType(contentsData?.data ?? []);
  const donationStories = grouped.donation_stories;

  const displayActivities = hasFeatured
    ? (featuredData?.activities ?? [])
    : (latestData?.activities ?? []);
  const isLoadingActivities =
    isLoadingFeatured || (!hasFeatured && isLoadingLatest);
  const totalActivities = featuredData?.total ?? latestData?.total ?? 0;

  return (
    <section className="bg-surface-light py-24 dark:bg-surface-dark/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="size-4" />
              Aktivitas dan Donasi
            </div>
            <h2 className="text-3xl font-black tracking-tight text-text-primary-light dark:text-text-primary-dark md:text-4xl">
              Lihat Kegiatan Terbaru dan Dukungan Nyata
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
              Aktivitas unggulan organisasi dan cara kamu bisa turut
              berkontribusi.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-background-light px-5 py-3 text-sm font-bold text-text-primary-light transition-colors hover:border-primary hover:text-primary dark:border-border-dark dark:bg-background-dark dark:text-text-primary-dark"
            >
              Semua Aktivitas <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Donasi Sekarang <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── Activities ── */}
          <article
            id="activities"
            className="rounded-3xl border border-border-light bg-background-light p-6 shadow-lg dark:border-border-dark dark:bg-background-dark"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  <Megaphone className="size-4" />
                  {hasFeatured ? (
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-primary" /> Featured
                    </span>
                  ) : (
                    "Terbaru"
                  )}
                </div>
                <h3 className="text-2xl font-black text-text-primary-light dark:text-text-primary-dark">
                  Kegiatan Organisasi
                </h3>
                <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {hasFeatured
                    ? "Aktivitas pilihan admin."
                    : "Agenda terbaru yang berjalan."}
                </p>
              </div>
              <div className="rounded-2xl border border-border-light bg-surface-light px-4 py-3 text-right dark:border-border-dark dark:bg-surface-dark">
                <p className="text-xs uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">
                  Total
                </p>
                <p className="text-2xl font-black text-text-primary-light dark:text-text-primary-dark">
                  {totalActivities}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {isLoadingActivities
                ? Array.from({ length: 3 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))
                : displayActivities.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/activities/${activity.id}`}
                      className="block rounded-2xl border border-border-light bg-surface-light p-4 transition-all hover:border-primary/40 hover:shadow-sm dark:border-border-dark dark:bg-surface-dark"
                    >
                      {activity.thumbnail && (
                        <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl">
                          <Image
                            src={resolveMediaUrl(activity.thumbnail)}
                            alt={activity.judul}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {activity.is_featured && (
                              <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                            )}
                            <h4 className="truncate font-bold text-text-primary-light dark:text-text-primary-dark">
                              {activity.judul}
                            </h4>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            {activity.deskripsi}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[activity.status] ?? STATUS_CLASS.draft}`}
                        >
                          {STATUS_LABEL[activity.status] ?? activity.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" />
                          {formatDate(activity.tanggal)}
                        </span>
                        {activity.lokasi && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {activity.lokasi}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}

              {!isLoadingActivities && displayActivities.length === 0 && (
                <div className="flex flex-col items-center py-10 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  <Megaphone className="mb-3 size-8 opacity-30" />
                  <p>Belum ada aktivitas.</p>
                </div>
              )}
            </div>
          </article>

          {/* ── Donation Stories ── */}
          <article
            id="donations"
            className="flex flex-col rounded-3xl border border-border-light bg-background-light p-6 shadow-lg dark:border-border-dark dark:bg-background-dark"
          >
            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Heart className="size-4" />
                Donasi
              </div>
              <h3 className="text-2xl font-black text-text-primary-light dark:text-text-primary-dark">
                Kisah Kebaikan
              </h3>
              <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Cerita nyata dari setiap donasi yang masuk.
              </p>
            </div>

            {/* Stories list */}
            <div className="flex-1 space-y-4">
              {isLoadingContents ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              ) : donationStories.length > 0 ? (
                donationStories.map((story) => (
                  <div
                    key={story.id}
                    className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border-dark dark:bg-surface-dark"
                  >
                    {story.image && (
                      <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl">
                        <Image
                          src={resolveMediaUrl(story.image)}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">
                      {story.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
                      {story.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border-light bg-surface-light p-5 dark:border-border-dark dark:bg-surface-dark">
                  <p className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
                    Setiap donasi digunakan sepenuhnya untuk kegiatan sosial dan
                    kemanusiaan.
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/donate"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
              >
                <CircleDollarSign className="size-5" />
                Donasi Sekarang
              </Link>
              <Link
                href="/donate/history"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-light px-6 py-3 text-sm font-bold text-text-primary-light transition-colors hover:border-primary hover:text-primary dark:border-border-dark dark:text-text-primary-dark"
              >
                Lihat Riwayat Donasi <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
