import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/provider/ClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
