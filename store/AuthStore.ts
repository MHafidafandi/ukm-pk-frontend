/**
 * AuthStore — DEPRECATED untuk token storage.
 *
 * Store ini TIDAK lagi menyimpan token (dipindahkan ke in-memory di lib/api/client.ts).
 * Dipertahankan hanya sebagai compatibility layer jika ada komponen lama yang menggunakannya.
 * Migrasi: gunakan useAuthContext() dari AuthContext.tsx.
 */
import { create } from "zustand";

interface AuthState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
