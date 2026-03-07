"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, X } from "lucide-react";

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#" },
    { label: "Aktivitas", href: "#" },
    { label: "Donasi", href: "#" },
    { label: "Rekrutmen", href: "#" },
    { label: "Contact Us", href: "#" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light bg-surface-light/80 backdrop-blur-md dark:border-border-dark dark:bg-background-dark/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
            <Heart className="size-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Sipeduli
          </h2>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-text-secondary-light transition-colors hover:text-primary dark:text-text-secondary-dark"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 sm:inline-block"
          >
            Dashboard
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-text-primary-light transition-colors hover:bg-primary/10 dark:text-text-primary-dark md:hidden"
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
        <div className="border-t border-border-light bg-surface-light px-4 py-4 dark:border-border-dark dark:bg-background-dark md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-text-secondary-light transition-colors hover:text-primary dark:text-text-secondary-dark"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="mt-2 w-full rounded-xl bg-primary px-6 py-2.5 text-center text-sm font-bold text-white"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
