import type { Metadata } from "next";
import { Inter, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/provider/ClientProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UKM Peduli Kemanusiaan",
  description:
    "SI-PEDULI adalah sebuah sistem informasi berbasis digital yang dirancang untuk mendukung peran aktif Usaha Kecil dan Menengah (UKM) dalam kegiatan sosial dan kemanusiaan. Aplikasi ini menjadi wadah terintegrasi bagi UKM untuk berkontribusi dalam aksi kepedulian, seperti donasi, bantuan sosial, relawan, dan program pemberdayaan masyarakat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${inter.variable} ${manrope.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
