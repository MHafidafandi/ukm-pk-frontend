import { Eye, Target } from "lucide-react";
import type { LandingContent } from "../types";

interface VisiMisiSectionProps {
  visi: LandingContent | null;
  misi: LandingContent | null;
}

export default function VisiMisiSection({ visi, misi }: VisiMisiSectionProps) {
  const visiTitle = visi?.title ?? "Visi";
  const visiBody =
    visi?.description ??
    "Menjadi Unit Kegiatan Mahasiswa yang unggul dalam bidang kemanusiaan, sosial, dan pengabdian masyarakat berlandaskan nilai ketuhanan, kemanusiaan, dan profesionalitas di tingkat nasional.";

  const misiTitle = misi?.title ?? "Misi";
  const misiBody =
    misi?.description ??
    "1. Menyelenggarakan kegiatan sosial kemanusiaan secara rutin dan berkelanjutan.\n2. Membangun jejaring kolaborasi dengan lembaga kemanusiaan tingkat nasional dan internasional.\n3. Mengembangkan potensi kepedulian dan jiwa relawan mahasiswa melalui pelatihan profesional.";

  // Parse misi items from description (numbered list separated by newlines)
  const misiItems = misiBody
    .split("\n")
    .filter((line) => line.trim().length > 0);

  return (
    <section className="bg-surface-light py-24 dark:bg-surface-dark/50">
      {/* Section header */}
      <div className="mx-auto mb-16 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-black text-text-primary-light dark:text-text-primary-dark md:text-4xl">
          Visi dan Misi
        </h2>
        <div className="mx-auto h-1.5 w-20 rounded-full bg-primary" />
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary-light dark:text-text-secondary-dark">
          Menjadi garda terdepan dalam aksi kemanusiaan dan pengabdian
          masyarakat dengan komitmen tanpa batas.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        {/* Visi */}
        <div className="group rounded-3xl border border-border-light bg-background-light p-8 transition-colors hover:border-primary dark:border-border-dark dark:bg-background-dark">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-white transition-transform group-hover:scale-110">
            <Eye className="size-7" />
          </div>
          <h3 className="mb-4 text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {visiTitle}
          </h3>
          <p className="leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
            {visiBody}
          </p>
        </div>

        {/* Misi */}
        <div className="group rounded-3xl border border-border-light bg-background-light p-8 transition-colors hover:border-primary dark:border-border-dark dark:bg-background-dark">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-white transition-transform group-hover:scale-110">
            <Target className="size-7" />
          </div>
          <h3 className="mb-4 text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {misiTitle}
          </h3>
          <ul className="space-y-4 text-text-secondary-light dark:text-text-secondary-dark">
            {misiItems.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-bold text-primary">{i + 1}.</span>
                {/* Strip leading "N. " if present */}
                {item.replace(/^\d+\.\s*/, "")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
