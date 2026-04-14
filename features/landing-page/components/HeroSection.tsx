import Link from "next/link";
import { UserPlus, Heart, ArrowRight } from "lucide-react";
import type { LandingContent } from "../types";
import Image from "next/image";
import { resolveMediaUrl } from "../services/landingPageService";

interface HeroSectionProps {
  content: LandingContent | null;
}

export default function HeroSection({ content }: HeroSectionProps) {
  console.log(content);
  const title =
    content?.title ?? "UNIT KEGIATAN MAHASISWA PEDULI KEMANUSIAAN UNESA";
  const description =
    content?.description ??
    "Bergabunglah bersama kami dalam misi kemanusiaan dan kepedulian sosial di lingkungan kampus UNESA dan masyarakat luas. Bersama, kita wujudkan perubahan nyata.";
  const imageUrl = content?.image
    ? resolveMediaUrl(content.image)
    : "/images/hero-landing.png";

  return (
    <section
      className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-surface-bright"
      id="top"
    >
      {/* Background subtle gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 68, 75, 0.04) 0%, rgba(0, 93, 103, 0.08) 100%)",
        }}
      />

      {/* Decorative blurred circle */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-secondary-container/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center py-16">
        {/* Left — Text */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-bold tracking-widest uppercase">
            Panggilan Kemanusiaan
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-['Manrope'] text-on-surface leading-[1.1] tracking-tight">
            {title.length > 40 ? (
              <>
                Aksi Nyata,{" "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
                  }}
                >
                  Dampak Sejati.
                </span>
              </>
            ) : (
              title
            )}
          </h1>

          <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed font-['Inter']">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="#activities"
              className="flex items-center justify-center gap-2 px-8 py-4 text-white rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 hover:scale-105 transition-all"
              style={{
                background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
              }}
            >
              <UserPlus className="size-5" />
              Lihat Aktivitas
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#donations"
              className="flex items-center justify-center gap-2 px-8 py-4 border border-outline-variant text-on-surface rounded-xl font-bold text-base hover:bg-surface-container-low transition-all"
            >
              <Heart className="size-5 text-primary" />
              Donasi Sekarang
            </Link>
          </div>
        </div>

        {/* Right — Image */}
        <div className="hidden md:block relative">
          <div
            className="absolute -inset-4 rounded-[2rem] -rotate-3 opacity-50"
            style={{ background: "rgba(0, 93, 103, 0.06)" }}
          />
          <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] shadow-2xl z-10 border border-white/20 bg-surface-container">
            <Image
              src={imageUrl}
              alt="Humanitarian action"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Floating stat card */}
          <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest rounded-2xl p-5 shadow-xl border border-white z-20">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">
              Total Donatur
            </p>
            <p
              className="text-3xl font-extrabold font-['Manrope']"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              2.4k+
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
