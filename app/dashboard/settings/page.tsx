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
} from "lucide-react";
import { toast } from "sonner";

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
  const [nama, setNama] = useState(currentUser?.nama ?? "");
  const [nomorTelepon, setNomorTelepon] = useState(currentUser?.nomor_telepon ?? "");
  const [alamat, setAlamat] = useState(currentUser?.alamat ?? "");
  const [angkatan, setAngkatan] = useState(String(currentUser?.angkatan ?? ""));

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        nama,
        nomor_telepon: nomorTelepon || undefined,
        alamat: alamat || undefined,
        angkatan: angkatan ? Number(angkatan) : undefined,
      });
      refreshUser();
    } catch {
      // Error handled by AuthContext mutation
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
      // Error handled by AuthContext mutation
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input
    e.target.value = "";

    // Validate file
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
      // Error handled by AuthContext mutation
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      refreshUser();
    } catch {
      // Error handled by AuthContext mutation
    }
  };

  const getDivisionName = () => {
    if (
      currentUser?.division &&
      typeof currentUser.division === "object" &&
      "nama_divisi" in currentUser.division
    ) {
      return currentUser.division.nama_divisi;
    }
    if (
      currentUser?.division &&
      typeof currentUser.division === "object" &&
      "name" in currentUser.division
    ) {
      return (currentUser.division as any).name;
    }
    return "Tanpa Divisi";
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-10 pb-20">
      {/* Header Section */}
      <header className="flex flex-col gap-2 mb-8">
        <h1 className="text-text-primary-light dark:text-text-primary-dark text-3xl font-bold tracking-tight">
          Profil & Keamanan Akun
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-base">
          Kelola informasi profil pribadi dan keamanan akun Anda di sini.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
            {/* Cover Image */}
            <div
              className="h-32 w-full bg-cover bg-center relative"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, rgba(127, 19, 236, 0.4) 0%, rgba(25, 16, 34, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuALygS4JfnMkfAXEvLaOwhNN-Rfw_OjH5h7Ay0t88nbHne8iCQHxSkW-_u-GdBtgFKQszkNAiCu6-28ZVCUJUWuR75ObD4hDWKggBJdQZBz2ofqAs_gIJwZYrCQ8O_qLrI8gGcpntBaOtHP9vxX5EL-QzyYJ-sh7QZha3fjXFt3TqVp9RdJtMIVIH31zGrPh2DcyTHM6HfJCNJ7oueGdX4dSjwDoEQbCLJk5xipxVcykHqkhmopw8yJTZa0-55EFyWhrSPF9VmgUKQz")',
              }}
            >
              <div className="absolute bottom-4 left-6">
                <h2 className="text-white text-xl font-bold drop-shadow-md">
                  Informasi Profil
                </h2>
              </div>
            </div>

            <div className="p-6 pt-0">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-10 mb-8 relative z-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-surface-light dark:border-surface-dark bg-gray-200 overflow-hidden shadow-md">
                    <img
                      alt="User Profile Picture"
                      className="w-full h-full object-cover"
                      src={
                        currentUser?.avatar_url
                          ? `${process.env.NEXT_PUBLIC_API_URL || ""}${currentUser.avatar_url}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.nama || "User")}&background=random`
                      }
                    />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-primary-hover transition-colors flex items-center justify-center h-8 w-8 disabled:opacity-50"
                    title="Change Avatar"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-3 flex-1 w-full sm:w-auto">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="flex-1 sm:flex-none items-center justify-center px-4 py-2.5 rounded-lg bg-background-light dark:bg-background-dark/50 text-text-primary-light dark:text-text-primary-dark text-sm font-bold border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    {isUploadingAvatar ? "Uploading..." : "Upload Foto Baru"}
                  </button>
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={isDeletingAvatar || !currentUser?.avatar_url}
                    className="flex-1 sm:flex-none items-center justify-center px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border border-transparent hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  >
                    {isDeletingAvatar ? "Menghapus..." : "Hapus Foto"}
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <form
                onSubmit={handleProfileSubmit}
                className="flex flex-col gap-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark"
                      htmlFor="fullName"
                    >
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-secondary-light/50"
                        id="fullName"
                        placeholder="Masukkan nama lengkap"
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark"
                      htmlFor="role"
                    >
                      Role
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed"
                        id="role"
                        defaultValue={currentUser?.roles?.map((r) => r.name).join(", ") || "-"}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed"
                        id="email"
                        defaultValue={currentUser?.email}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark"
                      htmlFor="angkatan"
                    >
                      Angkatan
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-secondary-light/50"
                        id="angkatan"
                        placeholder="Tahun angkatan"
                        type="number"
                        value={angkatan}
                        onChange={(e) => setAngkatan(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark"
                      htmlFor="phone"
                    >
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-secondary-light/50"
                        id="phone"
                        placeholder="Masukkan nomor telepon"
                        type="text"
                        value={nomorTelepon}
                        onChange={(e) => setNomorTelepon(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark"
                      htmlFor="address"
                    >
                      Alamat
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-secondary-light/50"
                        id="address"
                        placeholder="Masukkan alamat"
                        type="text"
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border-light dark:bg-border-dark w-full my-2"></div>

                {/* Read Only Badges */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                    Atribut Anggota
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <Users className="w-4 h-4 mr-1.5" />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {getDivisionName()}
                      </span>
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {currentUser?.status || "Status Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/30 disabled:opacity-50 flex items-center gap-2"
                    type="submit"
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Security Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm sticky top-6">
            <div className="p-6 border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/30 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold">
                  Keamanan Akun
                </h2>
              </div>
            </div>

            <div className="p-6">
              <form
                onSubmit={handlePasswordSubmit}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark"
                    htmlFor="currentPassword"
                  >
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
                    <input
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-secondary-light/50"
                      id="currentPassword"
                      placeholder="••••••••"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark"
                    htmlFor="newPassword"
                  >
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
                    <input
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-secondary-light/50"
                      id="newPassword"
                      placeholder="Minimal 8 karakter"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Password harus mengandung huruf besar, angka, dan simbol.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark"
                    htmlFor="confirmPassword"
                  >
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
                    <input
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-secondary-light/50"
                      id="confirmPassword"
                      placeholder="Ulangi password baru"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <button
                    className="w-full px-6 py-2.5 bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary rounded-lg font-bold text-sm transition-all focus:ring-2 focus:ring-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
                    type="submit"
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isChangingPassword ? "Mengupdate..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
