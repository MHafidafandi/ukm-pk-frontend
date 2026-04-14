// app/(landing)/recruitment/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, CalendarDays, ArrowRight, ChevronDown } from "lucide-react";

import { toast } from "sonner";
import {
  PublicRecruitment,
  RegistrationPayload,
  usePublicLandingContext,
} from "@/features/landing-page/contexts/PublicLandingPageContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(d));

// ── Registration Modal ────────────────────────────────────────────────────────
interface RegFormProps {
  recruitment: PublicRecruitment;
  onClose: () => void;
}

function RegistrationModal({ recruitment, onClose }: RegFormProps) {
  const { divisions, submitRegistration, isSubmittingRegistration } =
    usePublicLandingContext();

  const [form, setForm] = useState({
    nama: "",
    email: "",
    angkatan: "",
    first_choice: "",
    second_choice: "",
    third_choice: "",
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.email || !form.angkatan || !form.first_choice) {
      toast.error("Mohon lengkapi data wajib.");
      return;
    }
    try {
      await submitRegistration({
        recruit_id: recruitment.id,
        nama: form.nama,
        email: form.email,
        angkatan: Number(form.angkatan),
        first_choice: form.first_choice,
        second_choice: form.second_choice || form.first_choice,
        third_choice: form.third_choice || form.first_choice,
      } satisfies RegistrationPayload);
      setSuccess(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mendaftar.");
    }
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
            background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/70 text-xs uppercase tracking-widest mb-1">
                Formulir Pendaftaran
              </p>
              <h3 className="font-['Manrope'] text-xl font-extrabold">
                {recruitment.nama_recruitment}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-white">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {success ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-emerald-600">
                  check_circle
                </span>
              </div>
              <h4 className="font-['Manrope'] text-2xl font-extrabold text-on-surface mb-2">
                Pendaftaran Berhasil!
              </h4>
              <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
                Tim kami akan menghubungimu melalui email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.nama}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nama: e.target.value }))
                  }
                  placeholder="Nama lengkapmu"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Angkatan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                  Angkatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.angkatan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, angkatan: e.target.value }))
                  }
                  placeholder="Contoh: 2024"
                  min={2000}
                  max={2099}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Pilihan divisi */}
              {(
                [
                  { key: "first_choice", label: "Pilihan 1", required: true },
                  { key: "second_choice", label: "Pilihan 2", required: false },
                  { key: "third_choice", label: "Pilihan 3", required: false },
                ] as const
              ).map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                    {label}{" "}
                    {required ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="normal-case font-normal">
                        (opsional)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      className="w-full appearance-none px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    >
                      <option value="">Pilih divisi…</option>
                      {divisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nama_divisi}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmittingRegistration}
                className="w-full py-4 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
                }}
              >
                {isSubmittingRegistration ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">
                      progress_activity
                    </span>
                    Mendaftar…
                  </>
                ) : (
                  <>
                    <Users className="size-5" />
                    Daftar Sekarang
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Recruitment Card ──────────────────────────────────────────────────────────
function RecruitmentCard({
  recruitment,
  onRegister,
}: {
  recruitment: PublicRecruitment;
  onRegister: (r: PublicRecruitment) => void;
}) {
  const isOpen = recruitment.status === "open";
  return (
    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            isOpen
              ? "bg-emerald-100 text-emerald-700"
              : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          {isOpen && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
          {isOpen ? "Pendaftaran Dibuka" : "Ditutup"}
        </span>
        {recruitment.announcement_link && (
          <a
            href={recruitment.announcement_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">
              open_in_new
            </span>
            Pengumuman
          </a>
        )}
      </div>

      <h3 className="font-['Manrope'] text-xl font-extrabold text-on-surface mb-2">
        {recruitment.nama_recruitment}
      </h3>
      <p className="text-sm text-on-surface-variant mb-5 line-clamp-3">
        {recruitment.deskripsi}
      </p>

      <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant mb-5 bg-surface-container rounded-xl px-4 py-3">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-primary" />
          Buka: {formatDate(recruitment.tanggal_buka)}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-red-400" />
          Tutup: {formatDate(recruitment.tanggal_tutup)}
        </span>
      </div>

      {isOpen ? (
        <button
          onClick={() => onRegister(recruitment)}
          className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          style={{
            background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
          }}
        >
          <Users className="size-4" />
          Daftar Sekarang
        </button>
      ) : (
        <button
          disabled
          className="w-full py-3 rounded-xl text-sm font-bold bg-surface-container text-on-surface-variant cursor-not-allowed"
        >
          Pendaftaran Ditutup
        </button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RecruitmentPage() {
  const { grouped, openRecruitments, isLoadingRecruitments, divisions } =
    usePublicLandingContext();

  const [activeRecruitment, setActiveRecruitment] =
    useState<PublicRecruitment | null>(null);

  const banner = grouped.recruitment_banner;

  return (
    <main className="min-h-screen bg-surface pt-20">
      {/* Hero */}
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
            <span className="text-white font-semibold">Rekrutmen</span>
          </nav>
          <h1 className="font-['Manrope'] text-5xl md:text-6xl font-extrabold text-white mb-4">
            {banner?.title ?? "Bergabunglah Bersama Kami"}
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            {banner?.description ??
              "Jadilah bagian dari gerakan kemanusiaan terbesar di kampus UNESA."}
          </p>
        </div>
      </section>

      {/* Open Recruitments */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Pendaftaran Aktif
          </span>
          <h2 className="font-['Manrope'] text-4xl font-extrabold text-on-surface mb-3">
            Open Recruitment
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">
            Daftarkan dirimu ke periode rekrutmen yang sedang dibuka.
          </p>
        </div>

        {isLoadingRecruitments ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-surface-container-lowest p-6 space-y-3 h-64"
              >
                <div className="h-4 w-1/3 bg-surface-container rounded-full" />
                <div className="h-5 w-2/3 bg-surface-container rounded-full" />
                <div className="h-4 w-full bg-surface-container rounded-full" />
              </div>
            ))}
          </div>
        ) : openRecruitments.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {openRecruitments.map((r) => (
              <RecruitmentCard
                key={r.id}
                recruitment={r}
                onRegister={setActiveRecruitment}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">
              person_search
            </span>
            <p className="font-['Manrope'] font-bold text-xl mb-2">
              Belum ada rekrutmen terbuka
            </p>
            <p className="text-sm text-center max-w-sm">
              Pantau terus halaman ini untuk informasi rekrutmen terbaru.
            </p>
          </div>
        )}
      </section>

      {/* Divisi */}
      {divisions.length > 0 && (
        <section className="bg-surface-container-low py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="font-['Manrope'] text-3xl font-extrabold text-on-surface mb-2">
                Divisi di UKM PK
              </h2>
              <p className="text-on-surface-variant">
                Kenali divisi-divisi yang ada sebelum mendaftar.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {divisions.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 p-4 text-center hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-xl">
                      diversity_3
                    </span>
                  </div>
                  <p className="font-bold text-sm text-on-surface">
                    {d.nama_divisi}
                  </p>
                  {d.deskripsi && (
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                      {d.deskripsi}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-['Manrope'] text-3xl font-extrabold text-on-surface mb-3">
            Punya pertanyaan?
          </h2>
          <p className="text-on-surface-variant mb-8">
            Hubungi kami lewat media sosial atau lihat kegiatan organisasi kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/activities"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              style={{
                background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
              }}
            >
              Lihat Aktivitas <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-outline-variant/40 text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-all"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      {activeRecruitment && (
        <RegistrationModal
          recruitment={activeRecruitment}
          onClose={() => setActiveRecruitment(null)}
        />
      )}
    </main>
  );
}
