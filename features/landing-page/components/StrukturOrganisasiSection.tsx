import Image from "next/image";
import type { LandingContent } from "../types";
import { resolveMediaUrl } from "../services/landingPageService";

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
  const imageUrl = content?.image
    ? resolveMediaUrl(content.image)
    : "/images/struktur-organisasi.jpg";

  return (
    <section className="py-24 bg-surface" id="structure">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-bold tracking-widest uppercase mb-4">
            Kepengurusan
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold font-['Manrope'] text-on-surface mb-4">
            {title}
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            {subtitle}
          </p>
        </div>

        {/* Image card */}
        <div className="bg-surface-container-lowest rounded-3xl p-4 md:p-8 shadow-sm">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-container">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Organizational Chart"
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-on-surface-variant">
                <div className="text-center space-y-3">
                  <span className="material-symbols-outlined text-5xl opacity-30">
                    account_tree
                  </span>
                  <p className="text-sm">Bagan Organisasi belum tersedia</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer row */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-on-surface-variant">
              Struktur organisasi periode aktif — dapat diperbarui melalui CMS.
            </p>
            <button
              className="px-6 py-2.5 text-sm font-bold text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition-all"
              style={{
                background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
              }}
            >
              <span className="material-symbols-outlined text-sm">
                download
              </span>
              Unduh Bagan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
