"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Globe, AtSign, MessageCircle, Send } from "lucide-react";
import type { LandingContent } from "../types";
import { resolveMediaUrl } from "../services/landingPageService";

interface LandingFooterProps {
  organization: LandingContent | null;
}

export default function LandingFooter({ organization }: LandingFooterProps) {
  const orgName = organization?.title || "Sipeduli";
  const orgLogo = organization?.image
    ? resolveMediaUrl(organization.image)
    : null;
  const orgDesc =
    organization?.description ||
    "Wadah mahasiswa UNESA untuk berkontribusi secara nyata dalam aksi kemanusiaan dan kepedulian sosial bagi masyarakat Indonesia.";

  return (
    <footer id="contact" className="bg-surface-container-low pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary shrink-0 overflow-hidden">
                {orgLogo ? (
                  <Image
                    src={orgLogo}
                    alt={orgName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Heart className="size-5 text-white" />
                )}
              </div>
              <span className="font-['Manrope'] text-xl font-extrabold tracking-tight text-on-surface">
                {orgName}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {orgDesc}
            </p>
            <div className="flex gap-3">
              {[Globe, AtSign, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-full bg-surface-container hover:bg-primary hover:text-white text-on-surface-variant transition-all"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-['Manrope'] font-bold text-on-surface mb-6">
              Platform
            </h4>
            <ul className="space-y-4 text-sm">
              {[
                { label: "Visi & Misi", href: "#vision" },
                { label: "Struktur Organisasi", href: "#structure" },
                { label: "Kegiatan", href: "#activities" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-['Manrope'] font-bold text-on-surface mb-6">
              Komunitas
            </h4>
            <ul className="space-y-4 text-sm">
              {["Events", "Blog", "Forum", "Volunteer Story"].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-['Manrope'] font-bold text-on-surface mb-6">
              Newsletter
            </h4>
            <p className="mb-4 text-sm text-on-surface-variant">
              Dapatkan update terbaru kegiatan kami.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email kamu"
                className="w-full rounded-xl bg-surface-container-lowest border-b-2 border-outline-variant/30 focus:border-primary px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none transition-all"
              />
              <button
                className="rounded-xl p-2.5 text-white flex-shrink-0 transition-all hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
                }}
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant/20 pt-8 text-xs text-on-surface-variant md:flex-row">
          <p>© 2024 UKM Peduli Kemanusiaan UNESA. All rights reserved.</p>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="hover:text-primary transition-colors"
                >
                  {l}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
