import LandingHeader from "@/features/landing-page/components/LandingHeader";
import LandingFooter from "@/features/landing-page/components/LandingFooter";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background-light font-sans text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark">
      <LandingHeader />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}
