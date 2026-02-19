import { DonationList } from "@/features/donation/components/donation-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Donasi - SI-PEDULI",
  description: "Kelola data donasi masuk",
};

export default function DonationPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <DonationList />
    </div>
  );
}
