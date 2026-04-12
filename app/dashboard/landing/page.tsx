// app/dashboard/landing/page.tsx
import { ActivityProvider } from "@/features/activities/contexts/ActivityContext";
import LandingPageManagerPage from "@/features/landing-page/components/LandingPageManagerPage";

export default function Page() {
  return (
    <ActivityProvider>
      <LandingPageManagerPage />
    </ActivityProvider>
  );
}
