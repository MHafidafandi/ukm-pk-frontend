import { ActivityDetail } from "@/features/activities/components/activity-detail";

export default function ActivityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ActivityDetail id={params.id} />;
}
