"use client";

import { LoginForm } from "@/components/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f9f9] font-[family-name:var(--font-inter)] text-[#1a1c1c] antialiased">
      {/* ── Left Side: Full Photo + Brand Overlay ── */}
      <section
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,68,75,0.88) 0%, rgba(0,93,103,0.92) 100%), url(https://lh3.googleusercontent.com/aida-public/AB6AXuCbYLudT4P98_f-E-0VgYVUaVpsqHVAlYl4H4ah3_euzbw8eqwzABasWUG_ALqpNk9uNd5tZjy6j4kZSieLrgXRmuTVnoi7gUfjjvXLgj1ABAcpRh02JYltLUIYiEoCwvMONDADVrxbve7LJE2kpybqG04MfU95u5C_uVh2SsGWOBL3_v5S6wDQOO29AQpNhuG1x70oXy-IIV8QKE02lyQKpfqfTmdEAgeeUcsAgyvD5g2_AI_bdIo-bU3wDSGSd2qJlhTH-2v-HQtp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
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
            <span className="font-[family-name:var(--font-manrope)] font-extrabold text-xl text-white tracking-tight">
              SI-PEDULI
            </span>
          </div>
        </div>

        {/* Headline & Description */}
        <div className="relative z-10">
          <h1 className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold text-white leading-tight mb-5">
            Kepedulian yang Terstruktur, Dampak yang Nyata
          </h1>
          <p className="text-white/70 text-base font-medium max-w-sm leading-relaxed">
            Platform digital bagi UKM untuk berkontribusi dalam aksi sosial,
            donasi, dan pemberdayaan masyarakat secara terintegrasi.
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
              1.200+
            </p>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              UKM Terdaftar
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
              Rp 4,8M
            </p>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              Dana Tersalurkan
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
          <span className="font-[family-name:var(--font-manrope)] text-xl font-extrabold text-[#1a1c1c]">
            SI-PEDULI
          </span>
        </div>

        <div className="w-full max-w-sm xl:max-w-md">
          {/* Heading */}
          <div className="mb-10">
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold text-[#1a1c1c] mb-2">
              Selamat Datang
            </h2>
            <p className="text-[#444746] text-sm font-medium">
              Masukkan kredensial Anda untuk mengakses portal UKM-PK.
            </p>
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
