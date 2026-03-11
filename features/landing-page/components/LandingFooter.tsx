"use client";

import { Heart, Globe, AtSign, MessageCircle, Send } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-[#0f172a] pt-20 pb-10 text-slate-300">
      <div className="mx-auto mb-16 grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
              <Heart className="size-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">Sipeduli</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Wadah mahasiswa UNESA untuk berkontribusi secara nyata dalam aksi
            kemanusiaan dan kepedulian sosial bagi masyarakat Indonesia.
          </p>
          <div className="flex gap-4">
            {[Globe, AtSign, MessageCircle].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex size-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {/* About */}
        <div>
          <h4 className="mb-6 font-bold text-white">About</h4>
          <ul className="space-y-4 text-sm">
            {[
              "How it works",
              "Featured missions",
              "Partnerships",
              "Impact Reports",
            ].map((l) => (
              <li key={l}>
                <a href="#" className="transition-colors hover:text-primary">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Community */}
        <div>
          <h4 className="mb-6 font-bold text-white">Community</h4>
          <ul className="space-y-4 text-sm">
            {["Events", "Blog", "Forum", "Volunteer Story"].map((l) => (
              <li key={l}>
                <a href="#" className="transition-colors hover:text-primary">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="mb-6 font-bold text-white">Newsletter</h4>
          <p className="mb-4 text-sm text-slate-400">
            Get latest updates on missions.
          </p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email"
              className="w-full rounded-lg border-none bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary p-2 text-white transition-colors hover:bg-primary/90"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-800 px-4 pt-8 text-xs sm:px-6 md:flex-row lg:px-8">
        <p>© 2024 UKM Peduli Kemanusiaan UNESA. All rights reserved.</p>
        <div className="flex gap-8">
          {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(
            (l) => (
              <a
                key={l}
                href="#"
                className="transition-colors hover:text-white"
              >
                {l}
              </a>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}
