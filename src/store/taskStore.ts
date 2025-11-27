import { create } from "zustand";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
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
    limit?: number | string;
    offset?: number | string;
    sortBy?: string;
    sortOrder?: string;
    append?: string;
  }) => Promise<void>;
  fetchTaskById: (id: number) => Promise<Task | null>;
  createTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  getTask: (id: number) => Task | undefined;
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
      const params = new URLSearchParams(filters as any);

      const res = await api.get(`/tasks?${params.toString()}`);
      const payload = res.data.data || {};
      const rows = payload.rows || [];
      const stats = payload.stats || { total: 0, completed: 0, pending: 0 };

      // Only append when filters.append === "true"
      const shouldAppend = String((filters as any).append) === "true";

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
    } catch (err) {
      toast.error("Failed to fetch tasks");
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

      await api.delete(`/tasks/delete/${id}`);
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      toast.success("Task deleted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    } finally {
      set({ loading: false });
    }
  },

  getTask: (id) => get().tasks.find((t) => t.id === id),
}));
