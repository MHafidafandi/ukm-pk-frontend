import { LandingPageProvider } from "@/features/landing-page/contexts/LandingPageContext";
import LandingPageManagerPage from "@/features/landing-page/components/LandingPageManagerPage";

export default function Page() {
  return (
    <LandingPageProvider>
      <LandingPageManagerPage />
    </LandingPageProvider>
  );
}
