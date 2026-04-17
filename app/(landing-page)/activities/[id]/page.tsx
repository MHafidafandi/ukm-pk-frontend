"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  CalendarDays, 
  MapPin, 
  ArrowLeft,
  Share2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPublicActivity } from "@/features/landing-page/services/publicOverviewService";
import { resolveMediaUrl } from "@/features/landing-page/services/landingPageService";

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

const formatDate = (d: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(d));

export default function ActivityDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: activity, isLoading, isError } = useQuery({
    queryKey: ["public", "activity", id],
    queryFn: () => getPublicActivity(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface pt-20">
        <div className="animate-pulse bg-surface-container-lowest h-64 w-full" />
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
          <div className="h-10 bg-surface-container w-3/4 animate-pulse rounded-xl" />
          <div className="h-6 bg-surface-container w-1/4 animate-pulse rounded-xl" />
          <div className="space-y-3 mt-12">
            <div className="h-4 bg-surface-container w-full animate-pulse rounded-xl" />
            <div className="h-4 bg-surface-container w-full animate-pulse rounded-xl" />
            <div className="h-4 bg-surface-container w-4/5 animate-pulse rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !activity) {
    return (
      <main className="min-h-screen bg-surface pt-20 flex flex-col items-center justify-center text-center px-6">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">error</span>
        <h2 className="text-2xl font-bold font-['Manrope'] text-on-surface mb-2">Aktivitas Tidak Ditemukan</h2>
        <p className="text-on-surface-variant mb-6">Mungkin URL salah atau aktivitas telah dihapus.</p>
        <Link href="/activities" className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
          Kembali ke Daftar Kegiatan
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface pt-20">
      {/* ── Hero Image Banner ── */}
      <section className="relative w-full h-[40vh] md:h-[50vh] bg-surface-container-lowest overflow-hidden">
        {activity.thumbnail ? (
          <Image
            src={resolveMediaUrl(activity.thumbnail)}
            alt={activity.judul}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">event</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-6 w-full pb-10">
            <Link href="/activities" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 text-sm font-semibold">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${STATUS_CLASS[activity.status] ?? STATUS_CLASS.draft}`}>
                {activity.status === "berjalan" && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {STATUS_LABEL[activity.status] ?? activity.status}
              </span>
              {activity.is_featured && (
                <span className="px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-bold shadow-sm">
                  Featured
                </span>
              )}
            </div>
            <h1 className="font-['Manrope'] text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2">
              {activity.judul}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-outline-variant/20">
          <div className="flex flex-wrap gap-6 text-sm font-medium text-on-surface-variant">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 mb-0.5">Tanggal</p>
                <p className="text-on-surface">{formatDate(activity.tanggal)}</p>
              </div>
            </div>
            
            {activity.lokasi && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 mb-0.5">Lokasi</p>
                  <p className="text-on-surface">{activity.lokasi}</p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <button 
              className="inline-flex items-center gap-2 px-4 py-2 border border-outline-variant/20 rounded-xl text-on-surface hover:bg-surface-container transition-colors text-sm font-semibold"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Tautan disalin ke clipboard!");
              }}
            >
              <Share2 className="size-4" />
              Bagikan
            </button>
          </div>
        </div>

        <article className="prose prose-on-surface max-w-none">
          {activity.deskripsi.split('\n').map((paragraph, index) => (
            <p key={index} className="text-on-surface-variant leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </article>
      </section>
      
      {/* ── CTA Footer ── */}
      <section className="border-t border-outline-variant/10 bg-surface-container-low py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="font-['Manrope'] text-2xl font-bold text-on-surface mb-3">Dukung Kegiatan Kami</h3>
          <p className="text-on-surface-variant mb-6 max-w-xl mx-auto">Kami mengandalkan dukungan Anda untuk terus menjalankan program-program bermakna yang memberikan dampak positif.</p>
          <div className="flex items-center justify-center gap-4">
             <Link href="/donations" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity">
               Beri Dukungan
             </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
