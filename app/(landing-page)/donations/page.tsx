// app/(landing)/donation/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShieldCheck, ArrowRight, CircleDollarSign } from "lucide-react";

import { resolveMediaUrl } from "@/features/landing-page/services/landingPageService";
import { toast } from "sonner";
import {
  DonationPayload,
  usePublicLandingContext,
} from "@/features/landing-page/contexts/PublicLandingPageContext";

// ── Constants ─────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Transfer Bank", icon: "account_balance" },
  { value: "cash", label: "Tunai", icon: "payments" },
  { value: "e_wallet", label: "E-Wallet", icon: "phone_android" },
  { value: "qris", label: "QRIS", icon: "qr_code_2" },
  { value: "other", label: "Lainnya", icon: "more_horiz" },
];
const NOMINAL_PRESETS = [
  { label: "Rp 10.000", value: 10_000 },
  { label: "Rp 25.000", value: 25_000 },
  { label: "Rp 50.000", value: 50_000 },
  { label: "Rp 100.000", value: 100_000 },
  { label: "Rp 250.000", value: 250_000 },
  { label: "Rp 500.000", value: 500_000 },
];
const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

// ── Form ──────────────────────────────────────────────────────────────────────
function DonationForm() {
  const { submitDonation, isSubmittingDonation } = usePublicLandingContext();
  const [form, setForm] = useState({
    nama_donatur: "",
    jumlah: 0,
    nominalInput: "",
    tanggal: new Date().toISOString().slice(0, 10),
    metode: "bank_transfer",
    deskripsi: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  const setPreset = (val: number) =>
    setForm((f) => ({ ...f, jumlah: val, nominalInput: String(val) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_donatur || !form.jumlah || !form.metode) {
      toast.error("Mohon lengkapi data wajib: nama, jumlah, dan metode.");
      return;
    }
    try {
      await submitDonation({
        nama_donatur: form.nama_donatur,
        jumlah: form.jumlah,
        tanggal: form.tanggal,
        metode: form.metode,
        deskripsi: form.deskripsi || undefined,
        bukti_pembayaran: file ?? undefined,
      } satisfies DonationPayload);
      setSuccess(true);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengirim donasi.",
      );
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <Heart className="size-10 text-emerald-600 fill-emerald-600" />
        </div>
        <h3 className="font-['Manrope'] text-2xl font-extrabold text-on-surface mb-2">
          Terima Kasih! 🎉
        </h3>
        <p className="text-on-surface-variant mb-6 max-w-sm mx-auto">
          Donasi kamu sedang menunggu verifikasi dari admin.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setForm({
              nama_donatur: "",
              jumlah: 0,
              nominalInput: "",
              tanggal: new Date().toISOString().slice(0, 10),
              metode: "bank_transfer",
              deskripsi: "",
            });
            setFile(null);
          }}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-primary border border-primary/30 hover:bg-primary/5 transition-all"
        >
          Donasi Lagi
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nama */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Nama Donatur <span className="text-red-500">*</span>
        </label>
        <input
          value={form.nama_donatur}
          onChange={(e) =>
            setForm((f) => ({ ...f, nama_donatur: e.target.value }))
          }
          placeholder="Nama lengkap atau 'Hamba Allah'"
          className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Nominal presets */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Jumlah Donasi <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {NOMINAL_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPreset(p.value)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                form.jumlah === p.value
                  ? "bg-primary text-white border-primary"
                  : "border-outline-variant/30 text-on-surface hover:border-primary/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={form.nominalInput}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              jumlah: Number(e.target.value),
              nominalInput: e.target.value,
            }))
          }
          placeholder="Atau masukkan nominal lain…"
          min={1000}
          className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {form.jumlah > 0 && (
          <p className="mt-1.5 text-xs text-primary font-bold">
            {formatRupiah(form.jumlah)}
          </p>
        )}
      </div>

      {/* Tanggal */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Tanggal <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={form.tanggal}
          onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Metode */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Metode <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, metode: m.value }))}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                form.metode === m.value
                  ? "bg-primary text-white border-primary"
                  : "border-outline-variant/30 text-on-surface hover:border-primary/40"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {m.icon}
              </span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Bukti Pembayaran
        </label>
        <label className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-outline-variant/30 rounded-xl cursor-pointer hover:border-primary/40 transition-all bg-surface-container-low">
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span className="material-symbols-outlined text-on-surface-variant/40">
            upload_file
          </span>
          <span className="text-xs text-on-surface-variant">
            {file ? file.name : "JPG, PNG, PDF – maks 5 MB"}
          </span>
        </label>
      </div>

      {/* Pesan */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Pesan (opsional)
        </label>
        <textarea
          value={form.deskripsi}
          onChange={(e) =>
            setForm((f) => ({ ...f, deskripsi: e.target.value }))
          }
          placeholder="Sampaikan pesanmu…"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmittingDonation}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60 transition-all"
        style={{
          background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
        }}
      >
        {isSubmittingDonation ? (
          <>
            <span className="material-symbols-outlined text-base animate-spin">
              progress_activity
            </span>
            Mengirim…
          </>
        ) : (
          <>
            <CircleDollarSign className="size-5" />
            Kirim Donasi
          </>
        )}
      </button>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DonationPage() {
  const { grouped, isLoadingContents } = usePublicLandingContext();
  const banner = grouped.donation_banner;
  const stories = grouped.donation_stories ?? [];

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
            <span className="text-white font-semibold">Donasi</span>
          </nav>
          <h1 className="font-['Manrope'] text-5xl md:text-6xl font-extrabold text-white mb-4">
            {banner?.title ?? "Donasikan Kebaikanmu"}
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            {banner?.description ??
              "Setiap donasi digunakan sepenuhnya untuk kegiatan sosial, kemanusiaan, dan pemberdayaan masyarakat."}
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-surface-container-low border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-6 text-sm">
          {[
            { icon: "shield", label: "Terverifikasi Admin" },
            { icon: "lock", label: "Data Aman" },
            { icon: "receipt_long", label: "Transparan & Akuntabel" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-primary text-base">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Heart className="size-6 text-primary" />
              </div>
              <div>
                <h2 className="font-['Manrope'] text-2xl font-extrabold text-on-surface">
                  Form Donasi
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Isi data di bawah untuk mengirim donasimu
                </p>
              </div>
            </div>
            <DonationForm />
          </div>

          {/* Stories */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-bold tracking-widest uppercase mb-4">
                <ShieldCheck className="size-4" />
                Kisah Nyata
              </span>
              <h2 className="font-['Manrope'] text-3xl font-extrabold text-on-surface mb-2">
                Dampak Nyata Donasimu
              </h2>
              <p className="text-on-surface-variant">
                Setiap rupiah yang kamu berikan telah mengubah kehidupan nyata.
              </p>
            </div>

            <div className="space-y-4">
              {isLoadingContents ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse h-36 rounded-2xl bg-surface-container"
                  />
                ))
              ) : stories.length > 0 ? (
                stories.map((story) => (
                  <div
                    key={story.id}
                    className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden shadow-sm"
                  >
                    {story.image && (
                      <div className="relative h-40 w-full">
                        <Image
                          src={resolveMediaUrl(story.image)}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="font-['Manrope'] font-bold text-on-surface mb-2">
                        {story.title}
                      </h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {story.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-surface-container p-6">
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Setiap donasi kamu akan digunakan secara penuh untuk
                    mendukung kegiatan sosial dan kemanusiaan yang
                    terverifikasi.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Donatur", value: "2.4k+", icon: "group" },
                {
                  label: "Dana Tersalurkan",
                  value: "Rp 48jt+",
                  icon: "volunteer_activism",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-primary/5 p-5 border border-primary/10"
                >
                  <span className="material-symbols-outlined text-primary mb-2 block">
                    {s.icon}
                  </span>
                  <p className="font-['Manrope'] text-2xl font-extrabold text-on-surface">
                    {s.value}
                  </p>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-['Manrope'] text-3xl font-extrabold text-on-surface mb-3">
            Ada pertanyaan tentang donasi?
          </h2>
          <p className="text-on-surface-variant mb-8">
            Hubungi kami atau lihat kegiatan yang sedang berjalan.
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
    </main>
  );
}
