"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Heart, Menu, X } from "lucide-react";
import type { LandingContent } from "../types";
import { resolveMediaUrl } from "../services/landingPageService";

interface LandingHeaderProps {
  organization: LandingContent | null;
}

export default function LandingHeader({ organization }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const orgName = organization?.title || "Sipeduli";
  const orgLogo = organization?.image
    ? resolveMediaUrl(organization.image)
    : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Aktivitas", href: "/activities" },
    { label: "Donasi", href: "/donations" },
    { label: "Rekrutmen", href: "/recruitments" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-surface/80 backdrop-blur-xl shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`font-['Manrope'] font-bold text-sm transition-colors ${
                isActive(l.href)
                  ? "text-primary border-b-2 border-primary pb-0.5"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-block px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg shadow-primary/20 transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
            }}
          >
            Dashboard
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-surface/95 backdrop-blur-xl px-6 py-6 border-t border-outline-variant/10">
          <nav className="flex flex-col gap-5">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`font-['Manrope'] font-semibold text-sm transition-colors ${
                  isActive(l.href)
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="mt-2 w-full rounded-xl px-6 py-3 text-center text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
              }}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
