import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientProviders from "@/provider/ClientProvider";

const inter = localFont({
  src: [
    {
      path: "../public/fonts/inter/Inter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/inter/Inter-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/inter/Inter-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

const manrope = localFont({
  src: [
    {
      path: "../public/fonts/manrope/Manrope-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/manrope/Manrope-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-manrope",
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
