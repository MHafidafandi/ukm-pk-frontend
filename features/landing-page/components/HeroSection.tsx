import { UserPlus, Heart, Megaphone } from "lucide-react";
import type { LandingContent } from "../types";
import Image from "next/image";

interface HeroSectionProps {
  content: LandingContent | null;
}

export default function HeroSection({ content }: HeroSectionProps) {
  const title =
    content?.title ?? "UNIT KEGIATAN MAHASISWA PEDULI KEMANUSIAAN UNESA";
  const description =
    content?.description ??
    "Bergabunglah bersama kami dalam misi kemanusiaan dan kepedulian sosial di lingkungan kampus UNESA dan masyarakat luas. Bersama, kita wujudkan perubahan nyata.";
  const imageUrl = content?.image ?? "/images/hero-landing.png";

  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — Text */}
          <div className="flex flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Megaphone className="size-4" />
              Panggilan Kemanusiaan
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-text-primary-light dark:text-text-primary-dark md:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
              {description}
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white transition-transform hover:scale-105">
                <UserPlus className="size-5" />
                Rekrutmen
              </button>
              <button className="flex items-center gap-2 rounded-xl border-2 border-primary px-8 py-4 font-bold text-primary transition-colors hover:bg-primary/5">
                <Heart className="size-5" />
                Donasi
              </button>
            </div>
          </div>

          {/* Right — Image */}
          <div className="relative">
            <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-card-light shadow-2xl dark:bg-card-dark lg:aspect-square">
              <Image
                src={imageUrl}
                alt="Humanitarian action"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
