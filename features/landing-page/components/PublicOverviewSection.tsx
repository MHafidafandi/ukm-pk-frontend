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
  ShieldCheck,
  Star,
  Megaphone,
} from "lucide-react";
import { getPublicActivities } from "../services/publicOverviewService";
import {
  getLandingPageContents,
  groupContentByType,
  resolveMediaUrl,
} from "../services/landingPageService";
import type { LandingContent } from "../types";
import { queryKeys } from "@/lib/query-keys";

const STATUS_LABEL: Record<string, string> = {
  perencanaan: "Planning",
  berjalan: "Ongoing",
  selesai: "Completed",
  draft: "Draft",
};

const STATUS_CLASS: Record<string, string> = {
  perencanaan: "bg-primary-fixed text-on-primary-fixed-variant",
  berjalan: "bg-secondary-fixed text-on-secondary-fixed-variant",
  selesai: "bg-surface-container-highest text-on-surface-variant",
  draft: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
};

const formatDate = (d: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

const CardSkeleton = () => (
  <div className="animate-pulse space-y-3 rounded-2xl bg-surface-container-lowest p-5">
    <div className="h-5 w-2/3 rounded-full bg-surface-container" />
    <div className="h-4 w-full rounded-full bg-surface-container" />
    <div className="h-4 w-1/2 rounded-full bg-surface-container" />
  </div>
);

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
    <section
      className="bg-surface-container-high py-24 relative overflow-hidden"
      id="overview"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary-container text-on-secondary-fixed-variant px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
              <ShieldCheck className="size-4" />
              Aktivitas dan Donasi
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold font-['Manrope'] text-on-surface mb-4">
              Lihat Kegiatan &amp;{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
                }}
              >
                Dukungan Nyata
              </span>
            </h2>
            <p className="text-lg text-on-surface-variant">
              Aktivitas unggulan organisasi dan cara kamu bisa turut
              berkontribusi.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-5 py-3 text-sm font-bold text-on-surface transition-all hover:border-primary hover:text-primary"
            >
              Semua Aktivitas <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
              }}
            >
              Donasi Sekarang <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Capital stat — large */}
          <div
            className="md:col-span-2 p-10 rounded-3xl text-white relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
            }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span
                className="material-symbols-outlined text-8xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                trending_up
              </span>
            </div>
            <div className="relative z-10">
              <span className="text-primary-fixed font-bold tracking-widest uppercase text-sm mb-4 block">
                Total Aktivitas
              </span>
              <div className="text-7xl font-extrabold font-['Manrope'] mb-4">
                {isLoadingActivities ? "—" : `${totalActivities}+`}
              </div>
              <p className="text-on-primary-container text-lg max-w-sm">
                Kegiatan sosial kemanusiaan yang telah kami selenggarakan untuk
                masyarakat.
              </p>
            </div>
          </div>

          {/* Active members */}
          <div className="bg-surface-container-lowest p-10 rounded-3xl">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">
              Donatur Aktif
            </span>
            <div className="text-5xl font-extrabold font-['Manrope'] text-on-surface mb-2">
              2.4k
            </div>
            <p className="text-on-surface-variant text-sm">
              Donatur setia yang mendukung setiap misi kami.
            </p>
          </div>
        </div>

        {/* Activities + Donations grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Activities */}
          <article
            id="activities"
            className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary-container text-on-secondary-fixed-variant px-3 py-1 text-xs font-bold tracking-widest uppercase">
                  <Megaphone className="size-4" />
                  {hasFeatured ? (
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-current" /> Featured
                    </span>
                  ) : (
                    "Terbaru"
                  )}
                </div>
                <h3 className="text-2xl font-extrabold font-['Manrope'] text-on-surface">
                  Kegiatan Organisasi
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {hasFeatured
                    ? "Aktivitas pilihan admin."
                    : "Agenda terbaru yang berjalan."}
                </p>
              </div>
              <div className="bg-surface-container rounded-2xl px-4 py-3 text-right shrink-0">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                  Total
                </p>
                <p className="text-2xl font-extrabold font-['Manrope'] text-on-surface">
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
                      className="block rounded-2xl bg-surface-container p-4 transition-all hover:bg-surface-container-high group"
                    >
                      {activity.thumbnail && (
                        <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl">
                          <Image
                            src={resolveMediaUrl(activity.thumbnail)}
                            alt={activity.judul}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {activity.is_featured && (
                              <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                            )}
                            <h4 className="truncate font-bold text-on-surface">
                              {activity.judul}
                            </h4>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
                            {activity.deskripsi}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[activity.status] ?? STATUS_CLASS.draft}`}
                        >
                          {STATUS_LABEL[activity.status] ?? activity.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-on-surface-variant">
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
                <div className="flex flex-col items-center py-10 text-sm text-on-surface-variant">
                  <Megaphone className="mb-3 size-8 opacity-30" />
                  <p>Belum ada aktivitas.</p>
                </div>
              )}
            </div>
          </article>

          {/* Donation Stories */}
          <article
            id="donations"
            className="flex flex-col rounded-3xl bg-surface-container-lowest p-6 shadow-sm"
          >
            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary-container text-on-secondary-fixed-variant px-3 py-1 text-xs font-bold tracking-widest uppercase">
                <Heart className="size-4" />
                Donasi
              </div>
              <h3 className="text-2xl font-extrabold font-['Manrope'] text-on-surface">
                Kisah Kebaikan
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Cerita nyata dari setiap donasi yang masuk.
              </p>
            </div>

            <div className="flex-1 space-y-4">
              {isLoadingContents ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              ) : donationStories.length > 0 ? (
                donationStories.map((story) => (
                  <div
                    key={story.id}
                    className="rounded-2xl bg-surface-container p-4"
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
                    <h4 className="font-bold text-on-surface">{story.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      {story.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-surface-container p-5">
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Setiap donasi digunakan sepenuhnya untuk kegiatan sosial dan
                    kemanusiaan.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/donate"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 hover:scale-105 active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
                }}
              >
                <CircleDollarSign className="size-5" />
                Donasi Sekarang
              </Link>
              <Link
                href="/donate/history"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/30 px-6 py-3 text-sm font-bold text-on-surface transition-all hover:border-primary hover:text-primary"
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
