import { RegistrantsList } from "@/features/recruitment/components/registrants-list";

export default function RegistrantsPage({
  params,
}: {
  params: { id: string };
}) {
  return <RegistrantsList recruitmentId={params.id} />;
}
