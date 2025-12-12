import { create } from "zustand";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { WEB_PUSH } from "@/utils/constants";
import { useAuthStore } from "./authStore";

interface ProfileState {
  notificationsEnabled: boolean;
  checkingSubscription: boolean;

  checkSubscription: () => Promise<void>;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  notificationsEnabled: false,
  checkingSubscription: true,

  checkSubscription: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const res = await api.post("/push/check-subscription", { token });

      set({
        notificationsEnabled: res.data.data?.enabled === true,
        checkingSubscription: false,
      });
    } catch (err) {
      set({ notificationsEnabled: false, checkingSubscription: false });
    }
  },

  enableNotifications: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      toast.error("Notifications not supported on this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Permission denied.");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: WEB_PUSH.public_key,
      });

      await api.post("/push/subscribe", { subscription });

      set({ notificationsEnabled: true });
      toast.success("Notifications enabled!");
    } catch (err) {
      console.error("Enable failed:", err);
      toast.error("Failed to enable notifications.");
    }
  },

  disableNotifications: async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      await api.post("/push/unsubscribe");

      set({ notificationsEnabled: false });
      toast.success("Notifications disabled!");
    } catch (err) {
      console.error("Disable failed:", err);
      toast.error("Failed to disable notifications.");
    }
  },
}));
