import Image from "next/image";
import type { LandingContent } from "../types";

interface StrukturOrganisasiSectionProps {
  content: LandingContent | null;
}

export default function StrukturOrganisasiSection({
  content,
}: StrukturOrganisasiSectionProps) {
  const title = content?.title ?? "Struktur Organisasi";
  const subtitle =
    content?.description ??
    "Sinergi kepengurusan untuk efektivitas aksi kemanusiaan.";
  const imageUrl = content?.image ?? "/images/struktur-organisasi.jpg";

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-black text-text-primary-light dark:text-text-primary-dark md:text-4xl">
              {title}
            </h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              {subtitle}
            </p>
          </div>
          <button className="rounded-xl bg-primary/10 px-6 py-3 font-bold text-primary transition-colors hover:bg-primary/20">
            Lihat Detail Pengurus
          </button>
        </div>

        {/* Image card */}
        <div className="rounded-3xl border border-border-light bg-surface-light p-4 shadow-xl dark:border-border-dark dark:bg-card-dark md:p-8">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-background-light dark:bg-background-dark">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Organizational Chart"
                fill
                className="object-cover opacity-80"
              />
            ) : (
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Bagan Organisasi belum tersedia
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
