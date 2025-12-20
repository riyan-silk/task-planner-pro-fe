// src/store/notificationStore.ts
import { create } from "zustand";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  entityType?: string;
  entityId?: number;
  link?: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: number) => Promise<boolean>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get("/notifications");
      const notifications = res.data.data.notifications || [];
      const unread = notifications.filter(
        (n: Notification) => !n.isRead
      ).length;
      set({ notifications, unreadCount: unread });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch notifications"
      );
    } finally {
      set({ loading: false });
    }
  },
  markRead: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.put(`/notifications/read/${id}`);
      if (res.data.success) {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          const unread = updated.filter((n) => !n.isRead).length;
          return { notifications: updated, unreadCount: unread };
        });
        toast.success("Marked as read!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to mark as read");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  markAllRead: async () => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.put("/notifications/read/all");
      if (res.data.success) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
          unreadCount: 0,
        }));
        toast.success("All notifications marked as read!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to mark all as read");
    } finally {
      set({ loading: false });
    }
  },
}));
