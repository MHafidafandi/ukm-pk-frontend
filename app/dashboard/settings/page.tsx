"use client";

import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useState, useRef } from "react";
import {
  Camera,
  UserCircle,
  AtSign,
  Mail,
  GraduationCap,
  Users,
  ShieldCheck,
  KeyRound,
  Key,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  MapPin,
  Trash2,
  Upload,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getMyUserInfo } from "@/features/auth/services/authService";
import { env } from "@/configs/env";

// ─── Reusable Field Components ────────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
    {children}
  </span>
);

type ReadonlyFieldProps = {
  icon: React.ReactNode;
  value: string;
};
const ReadonlyField = ({ icon, value }: ReadonlyFieldProps) => (
  <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
    <span className="text-outline shrink-0">{icon}</span>
    <span className="text-sm text-on-surface-variant font-medium truncate">
      {value || "—"}
    </span>
  </div>
);

type EditableFieldProps = {
  id: string;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (v: string) => void;
};
const EditableField = ({
  id,
  icon,
  value,
  placeholder,
  type = "text",
  onChange,
}: EditableFieldProps) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4 flex items-center justify-center shrink-0">
      {icon}
    </span>
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-11 pr-4 bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg rounded-b-none py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
    />
  </div>
);

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  show: boolean;
  placeholder: string;
  onChange: (v: string) => void;
  onToggle: () => void;
};
const PasswordField = ({
  id,
  label,
  value,
  show,
  placeholder,
  onChange,
  onToggle,
}: PasswordFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={id}>
      <FieldLabel>{label}</FieldLabel>
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
        <Lock className="w-4 h-4" />
      </span>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-11 bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg rounded-b-none py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <div className="px-8 py-6 bg-surface-container-low flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
      <span className="text-on-secondary-container">{icon}</span>
    </div>
    <div>
      <h2 className="font-['Manrope'] font-bold text-lg text-on-surface">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
      )}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const {
    currentUser,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    isUpdatingProfile,
    isChangingPassword,
    isUploadingAvatar,
    isDeletingAvatar,
    refreshUser,
  } = useAuth();

  // Profile form state
  const [nama, setNama] = useState<string | null>(null);
  const [nomorTelepon, setNomorTelepon] = useState<string | null>(null);
  const [alamat, setAlamat] = useState<string | null>(null);
  const [angkatan, setAngkatan] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: userInfo } = useQuery({
    queryKey: ["auth", "users", "me", currentUser?.id, currentUser?.updated_at],
    queryFn: getMyUserInfo,
    enabled: Boolean(currentUser),
  });

  const profileUser = userInfo ?? currentUser;
  const avatarSrc = userInfo?.avatar_url
    ? userInfo.avatar_url.startsWith("http")
      ? userInfo.avatar_url
      : `${env.MEDIA_URL}${userInfo.avatar_url}`
    : "";

  const getAvatarInitials = () => {
    const parts = (profileUser?.nama ?? "User")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const getDivisionName = () => {
    if (profileUser?.division && typeof profileUser.division === "object") {
      if ("nama_divisi" in profileUser.division)
        return profileUser.division.nama_divisi;
      if ("name" in profileUser.division)
        return (
          (profileUser.division as { name?: string }).name ?? "Tanpa Divisi"
        );
    }
    return "Tanpa Divisi";
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        nama: (nama ?? profileUser?.nama ?? "").trim(),
        nomor_telepon:
          (nomorTelepon ?? profileUser?.nomor_telepon ?? "").trim() ||
          undefined,
        alamat: (alamat ?? profileUser?.alamat ?? "").trim() || undefined,
        angkatan: (angkatan ?? String(profileUser?.angkatan ?? "")).trim()
          ? Number(angkatan ?? profileUser?.angkatan)
          : undefined,
      });
      refreshUser();
      setNama(null);
      setNomorTelepon(null);
      setAlamat(null);
      setAngkatan(null);
    } catch {
      // handled by AuthContext
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // handled by AuthContext
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    try {
      await uploadAvatar(file);
      refreshUser();
    } catch {
      // handled by AuthContext
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      refreshUser();
    } catch {
      // handled by AuthContext
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col gap-8 p-8 bg-surface min-h-full max-w-5xl mx-auto w-full">
      {/* ── Page Header ── */}
      <div>
        <h1 className="font-['Manrope'] font-bold text-3xl text-on-surface">
          Profil & Keamanan
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Kelola informasi profil pribadi dan keamanan akun kamu.
        </p>
      </div>

      {/* ── Hero Identity Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-container p-8 text-white shadow-lg">
        {/* Decorative blob */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
              <AvatarImage
                src={avatarSrc || undefined}
                alt={profileUser?.nama || "User"}
              />
              <AvatarFallback className="text-xl font-bold bg-primary-fixed text-on-primary-fixed">
                {getAvatarInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white text-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
              title="Ganti foto"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          {/* Identity text */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-['Manrope'] font-extrabold text-2xl tracking-tight">
              {profileUser?.nama || "User"}
            </h2>
            <p className="text-white/70 text-sm mt-0.5">
              {profileUser?.email || ""}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                {getDivisionName()}
              </span>
              {profileUser?.roles?.map((r) => (
                <span
                  key={r.id}
                  className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
                >
                  {r.name}
                </span>
              ))}
            </div>
          </div>

          {/* Avatar actions */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={handleDeleteAvatar}
              disabled={isDeletingAvatar || !avatarSrc}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isDeletingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Hapus
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left: Profile Form ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <SectionCard>
            <SectionHeader
              icon={<UserCircle className="w-5 h-5" />}
              title="Informasi Pribadi"
              subtitle="Data yang bisa kamu perbarui kapan saja"
            />

            <form
              onSubmit={handleProfileSubmit}
              className="px-8 py-6 space-y-5"
            >
              {/* Nama + Angkatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="nama">
                    <FieldLabel>Nama Lengkap</FieldLabel>
                  </label>
                  <EditableField
                    id="nama"
                    icon={<UserCircle className="w-4 h-4" />}
                    value={nama ?? profileUser?.nama ?? ""}
                    placeholder="Nama lengkap kamu"
                    onChange={setNama}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="angkatan">
                    <FieldLabel>Angkatan</FieldLabel>
                  </label>
                  <EditableField
                    id="angkatan"
                    icon={<GraduationCap className="w-4 h-4" />}
                    value={angkatan ?? String(profileUser?.angkatan ?? "")}
                    placeholder="Tahun angkatan"
                    type="number"
                    onChange={setAngkatan}
                  />
                </div>
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-2">
                <label htmlFor="phone">
                  <FieldLabel>Nomor Telepon</FieldLabel>
                </label>
                <EditableField
                  id="phone"
                  icon={<Phone className="w-4 h-4" />}
                  value={nomorTelepon ?? profileUser?.nomor_telepon ?? ""}
                  placeholder="Contoh: +628xxxxxxxxxx"
                  onChange={setNomorTelepon}
                />
              </div>

              {/* Alamat */}
              <div className="space-y-2">
                <label htmlFor="alamat">
                  <FieldLabel>Alamat</FieldLabel>
                </label>
                <EditableField
                  id="alamat"
                  icon={<MapPin className="w-4 h-4" />}
                  value={alamat ?? profileUser?.alamat ?? ""}
                  placeholder="Alamat lengkap kamu"
                  onChange={setAlamat}
                />
              </div>

              {/* Readonly fields */}
              <div className="pt-2 space-y-3">
                <FieldLabel>Data Hanya Baca</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReadonlyField
                    icon={<Mail className="w-4 h-4" />}
                    value={profileUser?.email ?? ""}
                  />
                  <ReadonlyField
                    icon={<AtSign className="w-4 h-4" />}
                    value={
                      profileUser?.roles?.map((r) => r.name).join(", ") || "—"
                    }
                  />
                </div>
              </div>

              {/* Badges: Division + Status */}
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                  <Users className="w-3.5 h-3.5" />
                  {getDivisionName()}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {profileUser?.status || "—"}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isUpdatingProfile && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </SectionCard>
        </div>

        {/* ── Right: Security + Org Info ── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Security Card */}
          <SectionCard>
            <SectionHeader
              icon={<KeyRound className="w-5 h-5" />}
              title="Keamanan Akun"
              subtitle="Perbarui password untuk menjaga keamanan"
            />

            <form
              onSubmit={handlePasswordSubmit}
              className="px-8 py-6 space-y-5"
            >
              <PasswordField
                id="currentPassword"
                label="Password Saat Ini"
                value={currentPassword}
                show={showCurrentPassword}
                placeholder="••••••••"
                onChange={setCurrentPassword}
                onToggle={() => setShowCurrentPassword((v) => !v)}
              />
              <PasswordField
                id="newPassword"
                label="Password Baru"
                value={newPassword}
                show={showNewPassword}
                placeholder="Minimal 8 karakter"
                onChange={setNewPassword}
                onToggle={() => setShowNewPassword((v) => !v)}
              />
              <PasswordField
                id="confirmPassword"
                label="Konfirmasi Password Baru"
                value={confirmPassword}
                show={showConfirmPassword}
                placeholder="Ulangi password baru"
                onChange={setConfirmPassword}
                onToggle={() => setShowConfirmPassword((v) => !v)}
              />
              <p className="text-xs text-on-surface-variant">
                Password harus mengandung huruf besar, angka, dan simbol.
              </p>

              <button
                type="submit"
                disabled={
                  isChangingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-outline-variant text-on-surface-variant text-sm font-bold hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                {isChangingPassword && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isChangingPassword ? "Mengupdate..." : "Update Password"}
              </button>
            </form>
          </SectionCard>

          {/* Org Info Card */}
          <SectionCard>
            <SectionHeader
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Info Organisasi"
              subtitle="Data keanggotaan kamu"
            />
            <div className="px-8 py-6 space-y-3">
              <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Divisi
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-0.5">
                    {getDivisionName()}
                  </p>
                </div>
                <Users className="w-5 h-5 text-on-surface-variant" />
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Role
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-0.5">
                    {profileUser?.roles?.map((r) => r.name).join(", ") || "—"}
                  </p>
                </div>
                <ShieldCheck className="w-5 h-5 text-on-surface-variant" />
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Status
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-0.5 capitalize">
                    {profileUser?.status || "—"}
                  </p>
                </div>
                <BadgeCheck className="w-5 h-5 text-on-surface-variant" />
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Angkatan
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-0.5">
                    {profileUser?.angkatan || "—"}
                  </p>
                </div>
                <GraduationCap className="w-5 h-5 text-on-surface-variant" />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
