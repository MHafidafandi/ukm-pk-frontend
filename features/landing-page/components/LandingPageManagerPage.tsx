"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  getLandingPageContents,
  createContent,
  updateContent,
  deleteContent,
  getUniqueTypes,
  typeLabel,
} from "@/features/landing-page/services/landingPageService";
import type {
  LandingContent,
  ContentType,
} from "@/features/landing-page/types";
import { isMultipleType } from "@/features/landing-page/types";
import { useActivityContext } from "@/features/activities/contexts/ActivityContext";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// ─── Content Item Row ────────────────────────────────────────────────────────
function ContentItemRow({
  item,
  type,
  isEditing,
  updateMutation,
  deleteMutation,
  toggleActiveMutation,
  onEdit,
  onCancelEdit,
}: any) {
  const canDelete =
    isMultipleType(type) ||
    !["hero", "visi", "misi", "struktur_organisasi", "organization"].includes(
      type,
    );

  return (
    <div className="space-y-2 mt-3">
      <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between hover:translate-x-1 transition-transform group shadow-sm">
        <div className="flex items-center space-x-5">
          <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">
              article
            </span>
          </div>
          <div className="min-w-0 max-w-sm">
            <p className="font-bold text-on-surface font-['Manrope'] truncate">
              {item.title || "Tanpa Judul"}
            </p>
            <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
              {item.description || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 text-[10px] font-black rounded-full tracking-wider ${item.active
                ? "bg-primary-fixed text-on-primary-fixed-variant"
                : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
              }`}
          >
            {item.active ? "ACTIVE" : "DRAFT"}
          </span>
          <div className="h-8 w-px bg-outline-variant/20 hidden sm:block" />
          <div className="flex gap-1">
            <button
              onClick={() =>
                toggleActiveMutation?.mutate({
                  id: item.id,
                  active: !item.active,
                })
              }
              className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
              title="Toggle Status"
            >
              <span className="material-symbols-outlined text-sm">
                {item.active ? "visibility_off" : "visibility"}
              </span>
            </button>
            <button
              onClick={isEditing ? onCancelEdit : onEdit}
              className="p-2 hover:bg-surface-container rounded-full text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                {isEditing ? "close" : "edit"}
              </span>
            </button>
            {canDelete && (
              <button
                onClick={() => {
                  if (confirm("Hapus konten ini?"))
                    deleteMutation?.mutate(item.id);
                }}
                className="p-2 hover:bg-error-container rounded-full text-error transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  delete
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function LandingPageManagerPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<string | null>(null);

  const { data: contentsData, isLoading: isLoadingContents } = useQuery({
    queryKey: [...queryKeys.landingContents.list(), "all"],
    queryFn: () => getLandingPageContents(),
  });

  const { activities, updateActivityFeatured, isFetchingActivities } =
    useActivityContext();

  const allContents = useMemo(
    () => contentsData?.data ?? [],
    [contentsData?.data],
  );
  const existingTypes = useMemo(
    () => getUniqueTypes(allContents),
    [allContents],
  );

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateContent(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.landingContents.list(),
      });
      toast.success("Status diperbarui");
    },
    onError: () => toast.error("Gagal memperbarui status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.landingContents.list(),
      });
      toast.success("Konten dihapus");
    },
    onError: () => toast.error("Gagal menghapus konten"),
  });

  return (
    <main className="flex-grow space-y-8 bg-surface min-h-screen">
      {/* Breadcrumbs & Title */}
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex text-xs text-on-surface-variant/60 mb-2 space-x-2 font-['Inter']">
            <span>Portal</span>
            <span>/</span>
            <span className="text-primary font-semibold">Content Manager</span>
          </nav>
          <h2 className="text-4xl font-bold text-on-surface tracking-tight font-['Manrope']">
            Landing Page Curator
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center px-4 py-2 bg-secondary-container rounded-full text-on-secondary-container text-xs font-bold">
            <span
              className="material-symbols-outlined text-sm mr-2"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            Live
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all"
            style={{
              background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
            }}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Section
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Featured Activities */}
        <section className="col-span-12 bg-surface-container-low rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-on-surface font-['Manrope'] flex items-center">
                <span className="material-symbols-outlined mr-3 text-primary">
                  auto_awesome
                </span>
                Featured Activities
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Pilih aktivitas yang ditampilkan di halaman utama.
              </p>
            </div>
            <Link
              href="/activities"
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-sm">
                open_in_new
              </span>
              Kelola Aktivitas
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isFetchingActivities ? (
              <div className="col-span-3 text-center py-12">
                <Loader2 className="animate-spin w-8 h-8 mx-auto text-primary" />
              </div>
            ) : (
              activities
                .filter((a) => a.is_featured)
                .map((activity, index) => (
                  <div
                    key={activity.id}
                    className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all cursor-pointer relative"
                  >
                    <div className="absolute top-4 right-4 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                      {index + 1}
                    </div>
                    <h4 className="font-bold font-['Manrope'] text-on-surface mb-1 truncate pr-8">
                      {activity.judul}
                    </h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {activity.deskripsi}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="px-2 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold rounded-full tracking-wider">
                        FEATURED
                      </span>
                      <button
                        onClick={() =>
                          updateActivityFeatured({
                            id: activity.id,
                            data: { is_featured: false },
                          })
                        }
                        className="text-error hover:underline text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
            )}

            {/* Empty slot */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center hover:border-primary transition-all cursor-pointer group">
              <Link
                href="/activities"
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white">
                    add_circle
                  </span>
                </div>
                <p className="text-sm font-bold text-on-surface-variant">
                  Select Activities
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic Content Blocks by type */}
        {isLoadingContents ? (
          <div className="col-span-12 text-center py-12">
            <Loader2 className="animate-spin w-8 h-8 mx-auto text-primary" />
          </div>
        ) : (
          existingTypes.map((type) => (
            <section
              key={type}
              className="col-span-12 bg-surface-container-high rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-on-surface font-['Manrope'] flex items-center capitalize">
                  <span className="material-symbols-outlined mr-3 text-on-tertiary-fixed-variant">
                    stacks
                  </span>
                  {typeLabel(type)}
                  <span className="ml-3 px-2 py-0.5 bg-surface-variant text-on-surface-variant text-[10px] rounded-full font-['Inter']">
                    {isMultipleType(type) ? "Multiple" : "Single"}
                  </span>
                </h3>
                {(!contentsData?.data.filter((c) => c.type === type).length ||
                  isMultipleType(type)) && (
                    <button
                      onClick={() => setAddingType(type)}
                      className="text-sm font-semibold text-primary flex items-center hover:underline"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">
                        add
                      </span>
                      Add Block
                    </button>
                  )}
              </div>

              {contentsData?.data
                .filter((c) => c.type === type)
                .map((item) => (
                  <ContentItemRow
                    key={item.id}
                    item={item}
                    type={type}
                    isEditing={editingId === item.id}
                    onEdit={() => setEditingId(item.id)}
                    onCancelEdit={() => setEditingId(null)}
                    toggleActiveMutation={toggleActiveMutation}
                    deleteMutation={deleteMutation}
                  />
                ))}
            </section>
          ))
        )}
      </div>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 ml-64 bg-surface/90 backdrop-blur-md px-8 py-4 border-t border-outline-variant/10 flex items-center justify-between z-40">
        <div className="flex items-center space-x-2 text-xs text-on-surface-variant font-['Inter']">
          <span className="material-symbols-outlined text-sm text-secondary">
            history
          </span>
          <span>Auto-saved</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-6 py-2 rounded-xl text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors">
            Discard
          </button>
          <button className="px-6 py-2.5 bg-surface-container-highest text-on-surface rounded-xl text-sm font-bold hover:bg-surface-container-high transition-all">
            Save Draft
          </button>
          <button
            className="px-8 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
            style={{
              background: "linear-gradient(135deg, #00444b 0%, #005d67 100%)",
            }}
          >
            Publish to Public Site
          </button>
        </div>
      </div>
    </main>
  );
}
