import type { LandingContent } from "../types";

interface VisiMisiSectionProps {
  visi: LandingContent | null;
  misi: LandingContent | null;
}

const misiIcons: Record<number, string> = {
  0: "architecture",
  1: "visibility",
  2: "hub",
  3: "volunteer_activism",
};

export default function VisiMisiSection({ visi, misi }: VisiMisiSectionProps) {
  const visiTitle = visi?.title ?? "Visi";
  const visiBody =
    visi?.description ??
    "Menjadi Unit Kegiatan Mahasiswa yang unggul dalam bidang kemanusiaan, sosial, dan pengabdian masyarakat berlandaskan nilai ketuhanan, kemanusiaan, dan profesionalitas di tingkat nasional.";

  const misiTitle = misi?.title ?? "Misi";
  const misiBody =
    misi?.description ??
    "1. Menyelenggarakan kegiatan sosial kemanusiaan secara rutin dan berkelanjutan.\n2. Membangun jejaring kolaborasi dengan lembaga kemanusiaan tingkat nasional dan internasional.\n3. Mengembangkan potensi kepedulian dan jiwa relawan mahasiswa melalui pelatihan profesional.";

  const misiItems = misiBody
    .split("\n")
    .filter((line) => line.trim().length > 0);

  return (
    <section className="py-24 bg-surface-container-low" id="vision">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-bold tracking-widest uppercase mb-4">
            Identitas Organisasi
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold font-['Manrope'] text-on-surface">
            Visi dan Misi
          </h2>
          <div className="mt-4 mx-auto h-1.5 w-24 rounded-full bg-primary" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Visi */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-extrabold font-['Manrope'] text-on-surface mb-4">
                {visiTitle}
              </h3>
              <p className="text-xl font-light text-on-surface-variant leading-relaxed">
                {visiBody}
              </p>
            </div>

            {/* Quote card */}
            <div className="p-8 bg-surface-container-lowest rounded-2xl border-l-4 border-primary shadow-sm">
              <p className="font-['Inter'] text-on-surface-variant italic leading-relaxed">
                &quot;Bersama, kita wujudkan perubahan nyata untuk masyarakat
                Indonesia.&quot;
              </p>
            </div>
          </div>

          {/* Misi */}
          <div>
            <h3 className="text-3xl font-extrabold font-['Manrope'] text-on-surface mb-8">
              {misiTitle}
            </h3>
            <div className="space-y-6">
              {misiItems.map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-on-primary-container">
                      {misiIcons[i] ?? "check_circle"}
                    </span>
                  </div>
                  <div>
                    <p className="text-on-surface-variant leading-relaxed">
                      {item.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
