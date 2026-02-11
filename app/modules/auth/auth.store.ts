import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "./auth.service";
import type { LoginSchema, RegisterSchema } from "./auth.schema";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null | undefined;
  role: string;
  point: number;
  referralCode: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (payload: LoginSchema) => Promise<void>;
  register: (payload: RegisterSchema) => Promise<void>;
  logout: () => void;
  setAuth: (data: { user: User; token: string }) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      // LOGIN
      async login(payload) {
        const data = await authService.login(payload);

        // Use setAuth logic or handle manually if needed, but for now match the types
        set({
          user: {
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            role: data.role,
            point: data.point,
            referralCode: data.referralCode,
            phone: data.phone,
          },
          token: data.accessToken, // Assuming API returns accessToken here too if we keep this action
          isAuthenticated: true,
        });
        localStorage.setItem("accessToken", data.accessToken);
      },

      // REGISTER
      async register(payload) {
        const data = await authService.register(payload);

        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        });
      },

      logout() {
        localStorage.removeItem("accessToken");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setAuth(data: { user: User; token: string }) {
        localStorage.setItem("accessToken", data.token);
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        });
      },

      setHasHydrated: (state) => {
        set({
          hasHydrated: state,
        });
      },
    }),
    {
      name: "auth-storage-v2",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
