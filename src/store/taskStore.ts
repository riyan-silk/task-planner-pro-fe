// src/store/taskStore.ts
import { create } from "zustand";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

interface Task {
  id: number;
  userId: number;
  assigneeId?: number;
  assignerId?: number;
  teamId?: number;
  visibility: "private" | "team";
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
  // Add tags, comments count, etc. if fetched
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
}

interface TaskState {
  tasks: Task[];
  stats?: Stats;
  total: number;
  loading: boolean;
  fetchTasks: (filters?: {
    status?: string;
    priority?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    teamId?: number;
    visibility?: string;
    limit?: number | string;
    offset?: number | string;
    sortBy?: string;
    sortOrder?: string;
    append?: string;
  }) => Promise<void>;
  // Other methods unchanged, but update create/update to include new fields
  createTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt"> & { tags?: number[] }
  ) => Promise<void>;
  updateTask: (
    id: number,
    updates: Partial<Task> & { tags?: number[] }
  ) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  getTask: (id: number) => Task | undefined;
  bulkDeleteTasks: (ids: number[]) => Promise<void>;
  bulkUpdateTasks: (
    ids: number[],
    updates: Partial<Task> & { tags?: number[] }
  ) => Promise<void>;
  fetchTaskById: (id: number) => Promise<Task | null>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  stats: { total: 0, completed: 0, pending: 0 },
  total: 0,
  loading: false,
  fetchTasks: async (filters = {}) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ loading: false });
        return;
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const paramsObj = {
        ...filters,
        teamId: filters.teamId?.toString() || "",
        visibility: filters.visibility || "",
      };
      const params = new URLSearchParams(
        Object.entries(paramsObj).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      );
      const res = await api.get(`/tasks?${params.toString()}`);
      const payload = res.data.data || {};
      const rows = payload.rows || [];
      const stats = payload.stats || { total: 0, completed: 0, pending: 0 };
      // Only append when filters.append === "true"
      const shouldAppend = String(filters.append) === "true";
      if (shouldAppend) {
        set((state) => {
          const existingIds = new Set(state.tasks.map((t) => t.id));
          const newRows = rows.filter((r: Task) => !existingIds.has(r.id));
          return {
            tasks: [...state.tasks, ...newRows],
            stats,
            total: stats.total || 0,
          };
        });
      } else {
        set({
          tasks: rows,
          stats,
          total: stats.total || 0,
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      set({ loading: false });
    }
  },
  fetchTaskById: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ loading: false });
        return null;
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get(`/tasks/${id}`);
      const task = res.data.data.task;
      set((state) => ({
        tasks: state.tasks.some((t) => t.id === id)
          ? state.tasks.map((t) => (t.id === id ? task : t))
          : [...state.tasks, task],
      }));
      return task;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch task");
      return null;
    } finally {
      set({ loading: false });
    }
  },
  createTask: async (task) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post("/tasks/create", task);
      set((state) => ({ tasks: [...state.tasks, res.data.data.task] }));
      toast.success("Task created!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      set({ loading: false });
    }
  },
  updateTask: async (id, updates) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.put(`/tasks/edit/${id}`, updates);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? res.data.data.task : t)),
      }));
      toast.success("Task updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update task");
    } finally {
      set({ loading: false });
    }
  },
  deleteTask: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.put(`/tasks/delete/${id}`);
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      toast.success("Task deleted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    } finally {
      set({ loading: false });
    }
  },
  getTask: (id) => get().tasks.find((t) => t.id === id),
  bulkDeleteTasks: async (ids) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.put("/tasks/delete/bulk", { ids });
      // remove locally
      set((state) => ({
        tasks: state.tasks.filter((t) => !ids.includes(t.id)),
      }));
      toast.success("Tasks deleted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete tasks");
    } finally {
      set({ loading: false });
    }
  },
  bulkUpdateTasks: async (ids, updates) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.put("/tasks/edit/bulk", { ids, updates });
      // If backend returns updated rows, use them to update local state
      const updatedRows: Task[] = res.data?.data?.updated || [];
      if (updatedRows && updatedRows.length > 0) {
        set((state) => {
          const updatedMap = new Map(updatedRows.map((r) => [r.id, r]));
          return {
            tasks: state.tasks.map((t) =>
              updatedMap.has(t.id) ? updatedMap.get(t.id)! : t
            ),
          };
        });
      } else {
        // fallback: optimistically update fields locally
        set((state) => ({
          tasks: state.tasks.map((t) =>
            ids.includes(t.id) ? { ...t, ...updates } : t
          ),
        }));
      }
      toast.success("Tasks updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update tasks");
    } finally {
      set({ loading: false });
    }
  },
}));
