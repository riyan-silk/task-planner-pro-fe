import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "../utils/api";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/login", { email, password });
          const { user, accessToken, refreshToken } = res.data.data;

          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          set({ user, token: accessToken, refreshToken });

          toast.success("Login successful!");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Login failed");
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/register", {
            name,
            email,
            password,
          });

          const { user, accessToken, refreshToken } = res.data.data;

          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          set({ user, token: accessToken, refreshToken });

          toast.success("Account created!");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Registration failed");
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null });
        toast.success("Logged out");
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await api.post("/auth/profile", {
            token,
          });
          set({ user: res.data.data.user });
        } catch {
          get().refresh();
        }
      },

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return get().logout();

        try {
          const res = await api.post("/auth/refresh", { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;

          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          set({ token: accessToken, refreshToken: newRefresh });

          await get().checkAuth();
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
