"use client";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActivity } from "../api/get-activities";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProgressReportList } from "./progress-report-list";
import { DocumentationList } from "./documentation-list";
import { LpjViewer } from "./lpj-viewer";

type Props = {
  id: string;
};

export const ActivityDetail = ({ id }: Props) => {
  const router = useRouter();
  const { data: activity, isLoading } = useActivity({ id });

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!activity) {
    return <div>Activity not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/administrator/activities")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {activity.judul}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(activity.tanggal), "dd MMM yyyy", {
                locale: idLocale,
              })}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {activity.lokasi}
            </div>
            <Badge variant="outline">{activity.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Details Card could go here if we wanted more visual separation, 
             but simple text description is fine for now */}
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Deskripsi</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {activity.deskripsi}
          </p>
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="progress">Progres</TabsTrigger>
            <TabsTrigger value="docs">Dokumentasi</TabsTrigger>
            <TabsTrigger value="lpj">LPJ</TabsTrigger>
          </TabsList>
          <TabsContent value="progress" className="mt-4">
            <ProgressReportList activityId={id} />
          </TabsContent>
          <TabsContent value="docs" className="mt-4">
            <DocumentationList activityId={id} />
          </TabsContent>
          <TabsContent value="lpj" className="mt-4">
            <LpjViewer activityId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
