// src/store/tagsStore.ts (Updated)
import { create } from "zustand";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

interface Tag {
  id: number;
  name: string;
  createdAt: string;
}

interface TaskTagsState {
  tags: Tag[]; // All global tags
  taskTags: Tag[]; // Tags attached to current task
  availableTags: Tag[]; // Tags not attached to current task
  loading: boolean;
  fetchTags: () => Promise<void>;
  fetchTaskTags: (taskId: number) => Promise<void>;
  attachTag: (taskId: number, tagId: number) => Promise<boolean>;
  detachTag: (taskId: number, tagId: number) => Promise<boolean>;
}

export const useTaskTagsStore = create<TaskTagsState>((set, get) => ({
  tags: [],
  taskTags: [],
  availableTags: [],
  loading: false,
  fetchTags: async () => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get("/tags");
      set({ tags: res.data.data.tags || [] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch tags");
    } finally {
      set({ loading: false });
    }
  },
  fetchTaskTags: async (taskId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get(`/tasks/${taskId}/tags`);
      const taskTags = res.data.data.tags || [];
      const allTags =
        get().tags.length > 0
          ? get().tags
          : (await get().fetchTags(), get().tags);
      const availableTags = allTags.filter(
        (tag) => !taskTags.some((tt: Tag) => tt.id === tag.id)
      );
      set({ taskTags, availableTags });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch task tags");
    } finally {
      set({ loading: false });
    }
  },
  attachTag: async (taskId, tagId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return false;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(`/tasks/${taskId}/tags/attach`, { tagId });
      if (res.data.success) {
        await get().fetchTaskTags(taskId);
        toast.success("Tag attached!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to attach tag");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  detachTag: async (taskId, tagId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return false;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.delete(`/tasks/${taskId}/tags/${tagId}`);
      if (res.data.success) {
        await get().fetchTaskTags(taskId);
        toast.success("Tag detached!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to detach tag");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
