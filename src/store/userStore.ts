// src/store/userStore.ts
import { create } from "zustand";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  fetchUsers: (filters?: { search?: string; teamId?: number }) => Promise<void>;
  getUser: (id: number) => User | undefined;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  fetchUsers: async (filters = {}) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const paramsObj = {
        ...filters,
        search: filters.search || "",
        teamId: filters.teamId?.toString() || "",
      };
      const params = new URLSearchParams(
        Object.entries(paramsObj).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      );
      const res = await api.get(`/user?${params.toString()}`);
      set({ users: res.data.data.users || [] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ loading: false });
    }
  },
  getUser: (id) => get().users.find((u) => u.id === id),
}));

const useUsers = () => {
  const { users, loading, fetchUsers } = useUserStore();
  return { users, loading, fetchUsers };
};

export default useUsers;
