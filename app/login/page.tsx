"use client";

import { LoginForm } from "@/components/LoginForm";
import { useQuery } from "@tanstack/react-query";
import {
  getLandingPageContents,
  resolveMediaUrl,
} from "@/features/landing-page/services/landingPageService";
import type { LandingContent } from "@/features/landing-page/types";

/** Helper: find first active content by type */
function findByType(contents: LandingContent[], type: string) {
  return contents.find((c) => c.type === type && c.active) ?? null;
}

const LoginPage = () => {
  const { data } = useQuery({
    queryKey: ["public", "landing-contents", "login"],
    queryFn: () => getLandingPageContents({ active: true }),
    staleTime: 5 * 60_000,
  });

  const contents = data?.data ?? [];

  // ── CMS content by type ──
  const org = findByType(contents, "organization");
  const headline = findByType(contents, "login_headline");
  const bg = findByType(contents, "login_background");
  const stat1 = findByType(contents, "login_stat_1");
  const stat2 = findByType(contents, "login_stat_2");
  const welcome = findByType(contents, "login_welcome");

  // ── Resolved values with defaults ──
  const orgName = org?.title ?? "SI-PEDULI";
  const orgLogo = org?.image ? resolveMediaUrl(org.image) : null;

  const heroTitle =
    headline?.title ?? "Kepedulian yang Terstruktur, Dampak yang Nyata";
  const heroDesc =
    headline?.description ??
    "Platform digital bagi UKM untuk berkontribusi dalam aksi sosial, donasi, dan pemberdayaan masyarakat secara terintegrasi.";

  const heroImage = bg?.image
    ? resolveMediaUrl(bg.image)
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuCbYLudT4P98_f-E-0VgYVUaVpsqHVAlYl4H4ah3_euzbw8eqwzABasWUG_ALqpNk9uNd5tZjy6j4kZSieLrgXRmuTVnoi7gUfjjvXLgj1ABAcpRh02JYltLUIYiEoCwvMONDADVrxbve7LJE2kpybqG04MfU95u5C_uVh2SsGWOBL3_v5S6wDQOO29AQpNhuG1x70oXy-IIV8QKE02lyQKpfqfTmdEAgeeUcsAgyvD5g2_AI_bdIo-bU3wDSGSd2qJlhTH-2v-HQtp";

  const stat1Value = stat1?.title ?? "1.200+";
  const stat1Label = stat1?.description ?? "UKM Terdaftar";
  const stat2Value = stat2?.title ?? "Rp 4,8M";
  const stat2Label = stat2?.description ?? "Dana Tersalurkan";

  const welcomeTitle = welcome?.title ?? "Selamat Datang";
  const welcomeDesc =
    welcome?.description ??
    `Masukkan kredensial Anda untuk mengakses portal ${orgName}.`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f9f9] font-[family-name:var(--font-inter)] text-[#1a1c1c] antialiased">
      {/* ── Left Side: Full Photo + Brand Overlay ── */}
      <section
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,68,75,0.88) 0%, rgba(0,93,103,0.92) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            {orgLogo ? (
              <div
                className="p-1 rounded-xl border border-white/20 overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <img
                  src={orgLogo}
                  alt={orgName}
                  className="w-9 h-9 object-contain rounded-lg"
                />
              </div>
            ) : (
              <div
                className="p-2.5 rounded-xl border border-white/20"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                  />
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                  />
                </svg>
              </div>
            )}
            <span className="font-[family-name:var(--font-manrope)] font-extrabold text-xl text-white tracking-tight">
              {orgName}
            </span>
          </div>
        </div>

        {/* Headline & Description */}
        <div className="relative z-10">
          <h1 className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold text-white leading-tight mb-5">
            {heroTitle}
          </h1>
          <p className="text-white/70 text-base font-medium max-w-sm leading-relaxed">
            {heroDesc}
          </p>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div
            className="p-5 rounded-xl border border-white/10"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-white mb-1">
              {stat1Value}
            </p>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              {stat1Label}
            </p>
          </div>
          <div
            className="p-5 rounded-xl border border-white/10"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-white mb-1">
              {stat2Value}
            </p>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              {stat2Label}
            </p>
          </div>
        </div>

        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_#a8eefa,_transparent_60%)]" />
        </div>
      </section>

      {/* ── Right Side: Login Form ── */}
      <section className="w-full lg:w-1/2 h-full overflow-y-auto flex flex-col items-center justify-center p-8 lg:p-20 bg-[#f9f9f9]">
        {/* Mobile Logo */}
        <div className="flex items-center gap-3 lg:hidden mb-10">
          {orgLogo ? (
            <div className="size-10 rounded-xl flex items-center justify-center overflow-hidden bg-[#00444b]">
              <img
                src={orgLogo}
                alt={orgName}
                className="size-8 object-contain"
              />
            </div>
          ) : (
            <div className="size-10 bg-[#00444b] rounded-xl flex items-center justify-center">
              <svg
                className="size-6 text-white"
                fill="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                />
              </svg>
            </div>
          )}
          <span className="font-[family-name:var(--font-manrope)] text-xl font-extrabold text-[#1a1c1c]">
            {orgName}
          </span>
        </div>

        <div className="w-full max-w-sm xl:max-w-md">
          {/* Heading */}
          <div className="mb-10">
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold text-[#1a1c1c] mb-2">
              {welcomeTitle}
            </h2>
            <p className="text-[#444746] text-sm font-medium">{welcomeDesc}</p>
          </div>

          {/* Form — logic tidak diubah */}
          <LoginForm />

          {/* Footer */}
          <div className="mt-16 flex justify-center gap-6">
            <div className="flex items-center gap-1.5 opacity-40">
              <svg
                className="w-3.5 h-3.5 text-[#444746]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#444746]">
                Secure Access
              </span>
            </div>
            <div className="flex items-center gap-1.5 opacity-40">
              <svg
                className="w-3.5 h-3.5 text-[#444746]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#444746]">
                Cloud Sync
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
