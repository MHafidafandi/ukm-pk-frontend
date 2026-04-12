"use client";

import { useState, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Save,
  Star,
  StarOff,
  Trash2,
  X,
  LayoutGrid,
} from "lucide-react";
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
import { Activity } from "@/features/activities/services/activityService";
import Link from "next/link";

type CreateContentPayload = Omit<
  LandingContent,
  "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
>;

type UpdateMutationVars = {
  id: string;
  data: Partial<LandingContent>;
  imageFile?: File;
};

type CreateMutationVars = {
  data: CreateContentPayload;
  imageFile?: File;
};

type ToggleActiveVars = {
  id: string;
  active: boolean;
};

// ── Inline Edit Form ───────────────────────────────────────────────────────

function ContentEditForm({
  item,
  onSave,
  onCancel,
  isSaving,
}: {
  item: LandingContent;
  onSave: (data: Partial<LandingContent>, imageFile?: File) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [imageFile, setImageFile] = useState<File | undefined>();

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 dark:bg-primary/10">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
          Judul
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
          Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
          <ImageIcon className="mr-1 inline size-3" />
          Gambar baru (kosongkan untuk pertahankan yang lama)
        </label>
        {item.image && !imageFile && (
          <p className="mb-1.5 truncate text-xs text-slate-400">{item.image}</p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0])}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
        />
        {imageFile && (
          <p className="mt-1 text-xs text-slate-500">{imageFile.name}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ title, description }, imageFile)}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="size-3.5" />
          {isSaving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <X className="size-3.5" />
          Batal
        </button>
      </div>
    </div>
  );
}

// ── Add Content Form ───────────────────────────────────────────────────────

function AddContentForm({
  type,
  onAdd,
  onCancel,
  isAdding,
}: {
  type: ContentType;
  onAdd: (
    data: Omit<
      LandingContent,
      "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
    >,
    imageFile?: File,
  ) => void;
  onCancel: () => void;
  isAdding: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>();

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/20">
      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
        + Tambah item baru
      </p>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
          Judul
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
          Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
          <ImageIcon className="mr-1 inline size-3" />
          Gambar (opsional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0])}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
        />
        {imageFile && (
          <p className="mt-1 text-xs text-slate-500">{imageFile.name}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            onAdd(
              { type, title, description, active: true, image: null },
              imageFile,
            )
          }
          disabled={isAdding || !title.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          {isAdding ? "Menambahkan..." : "Tambah"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <X className="size-3.5" />
          Batal
        </button>
      </div>
    </div>
  );
}

// ── New Type Form ──────────────────────────────────────────────────────────

function NewTypeForm({
  existingTypes,
  onAdd,
  onCancel,
  isAdding,
}: {
  existingTypes: string[];
  onAdd: (
    data: Omit<
      LandingContent,
      "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
    >,
    imageFile?: File,
  ) => void;
  onCancel: () => void;
  isAdding: boolean;
}) {
  const [typeName, setTypeName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [typeError, setTypeError] = useState("");

  const handleAdd = () => {
    const normalized = typeName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!normalized) return setTypeError("Type wajib diisi");
    if (existingTypes.includes(normalized))
      return setTypeError("Type sudah ada");
    setTypeError("");
    onAdd(
      { type: normalized, title, description, active: true, image: null },
      imageFile,
    );
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-900 dark:bg-violet-900/20">
      <p className="mb-4 text-sm font-bold text-violet-700 dark:text-violet-400">
        Buat Section Baru
      </p>
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Nama Type{" "}
            <span className="font-normal text-slate-400">
              (huruf kecil, underscore, contoh: about_us)
            </span>
          </label>
          <input
            value={typeName}
            onChange={(e) => {
              setTypeName(e.target.value);
              setTypeError("");
            }}
            placeholder="about_us"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
          />
          {typeError && (
            <p className="mt-1 text-xs text-red-500">{typeError}</p>
          )}
          {typeName && (
            <p className="mt-1 text-xs text-slate-400">
              Akan disimpan sebagai:{" "}
              <code className="text-violet-600">
                {typeName.trim().toLowerCase().replace(/\s+/g, "_")}
              </code>
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Judul
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            <ImageIcon className="mr-1 inline size-3" />
            Gambar (opsional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0])}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            disabled={isAdding || !typeName.trim() || !title.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            <Plus className="size-3.5" />
            {isAdding ? "Membuat..." : "Buat Section"}
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X className="size-3.5" />
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Content Section Card ───────────────────────────────────────────────────

function ContentSectionCard({
  type,
  items,
  editingId,
  addingType,
  updateMutation,
  createMutation,
  deleteMutation,
  toggleActiveMutation,
  onSetEditingId,
  onSetAddingType,
}: {
  type: string;
  items: LandingContent[];
  editingId: string | null;
  addingType: string | null;
  updateMutation: UseMutationResult<
    { message: string },
    Error,
    UpdateMutationVars
  >;
  createMutation: UseMutationResult<
    { message: string },
    Error,
    CreateMutationVars
  >;
  deleteMutation: UseMutationResult<{ message: string }, Error, string>;
  toggleActiveMutation: UseMutationResult<
    { message: string },
    Error,
    ToggleActiveVars
  >;
  onSetEditingId: (id: string | null) => void;
  onSetAddingType: (type: string | null) => void;
}) {
  const multiple = isMultipleType(type);
  const canAdd = multiple || items.length === 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-900 dark:text-white">
              {typeLabel(type)}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <code className="text-xs text-slate-400">{type}</code>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {multiple ? "multiple" : "single"}
              </span>
            </div>
          </div>
        </div>
        {canAdd && addingType !== type && (
          <button
            onClick={() => onSetAddingType(type)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold transition hover:border-primary hover:text-primary dark:border-slate-700"
          >
            <Plus className="size-3.5" />
            Tambah
          </button>
        )}
      </div>

      <div className="p-5">
        {items.length === 0 && addingType !== type ? (
          <p className="py-4 text-center text-sm text-slate-400">
            Belum ada konten.{" "}
            <button
              onClick={() => onSetAddingType(type)}
              className="font-semibold text-primary hover:underline"
            >
              Tambah sekarang
            </button>
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id}>
                <div
                  className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors ${
                    item.active
                      ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
                      : "border-slate-100 bg-slate-50/50 opacity-60 dark:border-slate-800"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title || (
                          <span className="italic text-slate-400">
                            Tanpa judul
                          </span>
                        )}
                      </p>
                      {!item.active && (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                    {item.image && (
                      <p className="mt-1 truncate text-xs text-primary/70">
                        {item.image}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: item.id,
                          active: !item.active,
                        })
                      }
                      title={item.active ? "Nonaktifkan" : "Aktifkan"}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    >
                      {item.active ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        onSetEditingId(editingId === item.id ? null : item.id)
                      }
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                    >
                      <Edit3 className="size-4" />
                    </button>
                    {/* Hapus hanya untuk multiple type atau custom type */}
                    {(multiple ||
                      !["hero", "visi", "misi", "struktur_organisasi"].includes(
                        type,
                      )) && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus "${item.title}"?`))
                            deleteMutation.mutate(item.id);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                {editingId === item.id && (
                  <ContentEditForm
                    item={item}
                    onSave={(data, imageFile) =>
                      updateMutation.mutate({ id: item.id, data, imageFile })
                    }
                    onCancel={() => onSetEditingId(null)}
                    isSaving={updateMutation.isPending}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {addingType === type && (
          <AddContentForm
            type={type}
            onAdd={(data, imageFile) =>
              createMutation.mutate({ data, imageFile })
            }
            onCancel={() => onSetAddingType(null)}
            isAdding={createMutation.isPending}
          />
        )}
      </div>
    </section>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function LandingPageManagerPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<string | null>(null);
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);

  // ── Contents ──
  const { data: contentsData, isLoading: isLoadingContents } = useQuery({
    queryKey: [...queryKeys.landingContents.list(), "all"],
    queryFn: () => getLandingPageContents(),
  });

  const allContents = useMemo<LandingContent[]>(
    () => contentsData?.data ?? [],
    [contentsData?.data],
  );

  // Group by type dynamically
  const contentsByType = useMemo(() => {
    const map: Record<string, LandingContent[]> = {};
    allContents.forEach((c) => {
      if (!map[c.type]) map[c.type] = [];
      map[c.type].push(c);
    });
    return map;
  }, [allContents]);

  const existingTypes = useMemo(
    () => getUniqueTypes(allContents),
    [allContents],
  );

  const invalidateContents = () =>
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.landingContents.list(), "all"],
    });

  // ── Mutations ──
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      imageFile,
    }: {
      id: string;
      data: Partial<LandingContent>;
      imageFile?: File;
    }) => updateContent(id, data, imageFile),
    onSuccess: () => {
      invalidateContents();
      setEditingId(null);
      toast.success("Konten diperbarui");
    },
    onError: () => toast.error("Gagal memperbarui konten"),
  });

  const createMutation = useMutation({
    mutationFn: ({ data, imageFile }: CreateMutationVars) =>
      createContent(data, imageFile),
    onSuccess: () => {
      invalidateContents();
      setAddingType(null);
      setShowNewTypeForm(false);
      toast.success("Konten ditambahkan");
    },
    onError: () => toast.error("Gagal menambah konten"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContent(id),
    onSuccess: () => {
      invalidateContents();
      toast.success("Konten dihapus");
    },
    onError: () => toast.error("Gagal menghapus konten"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateContent(id, { active }),
    onSuccess: () => {
      invalidateContents();
      toast.success("Status diperbarui");
    },
    onError: () => toast.error("Gagal mengubah status"),
  });

  // ── Activities (dari context) ──
  const { activities, updateActivityFeatured, isFetchingActivities } =
    useActivityContext();

  const featuredCount = activities.filter((a) => a.is_featured).length;

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await updateActivityFeatured({ id, data: { is_featured: isFeatured } });
      toast.success("Status featured diperbarui");
    } catch {
      toast.error("Gagal mengubah featured");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Landing Page Manager
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Kelola semua konten landing page secara dinamis.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowNewTypeForm(true);
              setAddingType(null);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
          >
            <LayoutGrid className="size-4" />
            Section Baru
          </button>
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary dark:border-slate-700"
          >
            <Eye className="size-4" />
            Preview
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>

      {/* New Type Form */}
      {showNewTypeForm && (
        <NewTypeForm
          existingTypes={existingTypes}
          onAdd={(data, imageFile) =>
            createMutation.mutate({ data, imageFile })
          }
          onCancel={() => setShowNewTypeForm(false)}
          isAdding={createMutation.isPending}
        />
      )}

      {/* Dynamic Content Sections */}
      {isLoadingContents ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : existingTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
          <LayoutGrid className="mb-3 size-10 text-slate-300 dark:text-slate-700" />
          <p className="font-semibold text-slate-500 dark:text-slate-400">
            Belum ada section
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Klik{" "}
            <button
              onClick={() => setShowNewTypeForm(true)}
              className="font-semibold text-primary hover:underline"
            >
              Section Baru
            </button>{" "}
            untuk mulai.
          </p>
        </div>
      ) : (
        existingTypes.map((type) => (
          <ContentSectionCard
            key={type}
            type={type}
            items={contentsByType[type] ?? []}
            editingId={editingId}
            addingType={addingType}
            updateMutation={updateMutation}
            createMutation={createMutation}
            deleteMutation={deleteMutation}
            toggleActiveMutation={toggleActiveMutation}
            onSetEditingId={setEditingId}
            onSetAddingType={setAddingType}
          />
        ))
      )}

      {/* Featured Activities */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Featured Activities
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Pilih aktivitas yang tampil di landing page.{" "}
              <span className="font-semibold text-primary">
                {featuredCount} dipilih
              </span>{" "}
              (disarankan maks. 3)
            </p>
          </div>
          <Link
            href="/dashboard/activities"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold transition hover:border-primary hover:text-primary dark:border-slate-700"
          >
            Kelola <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="p-5">
          {isFetchingActivities ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              Belum ada aktivitas.
            </p>
          ) : (
            <div className="space-y-2">
              {activities.map((activity: Activity) => (
                <div
                  key={activity.id}
                  className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                    activity.is_featured
                      ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {activity.is_featured && (
                        <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                      )}
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {activity.judul}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {activity.status} ·{" "}
                      {new Date(activity.tanggal).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleFeatured(activity.id, !activity.is_featured)
                    }
                    className={`ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      activity.is_featured
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900"
                    }`}
                  >
                    {activity.is_featured ? (
                      <>
                        <StarOff className="size-3.5" /> Unfeature
                      </>
                    ) : (
                      <>
                        <Star className="size-3.5" /> Feature
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
