// src/store/attachmentStore.ts (Updated)
import { create } from "zustand";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

interface Attachment {
  id: number;
  taskId: number;
  userId?: number;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  createdAt: string;
  userName?: string;
}

interface AttachmentState {
  attachments: Attachment[];
  loading: boolean;
  fetchAttachments: (taskId: number) => Promise<void>;
  createAttachment: (
    taskId: number,
    formData: FormData
  ) => Promise<Attachment | null>;
  deleteAttachment: (id: number) => Promise<boolean>;
}

export const useTaskAttachmentsStore = create<AttachmentState>((set, get) => ({
  attachments: [],
  loading: false,
  fetchAttachments: async (taskId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get(`/task_attachments/${taskId}`);
      set({ attachments: res.data.data.attachments || [] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch attachments");
    } finally {
      set({ loading: false });
    }
  },
  createAttachment: async (taskId, formData) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return null;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(
        `/task_attachments/${taskId}/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const newAttachment = res.data.data.attachment;
      set((state) => ({ attachments: [...state.attachments, newAttachment] }));
      toast.success("Attachment uploaded!");
      return newAttachment;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload attachment");
      return null;
    } finally {
      set({ loading: false });
    }
  },
  deleteAttachment: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return false;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const taskId = get().attachments.find((a) => a.id === id)?.taskId;
      if (!taskId) return false;
      const res = await api.delete(`/task_attachments/${taskId}/${id}`);
      if (res.data.success) {
        set((state) => ({
          attachments: state.attachments.filter((a) => a.id !== id),
        }));
        toast.success("Attachment deleted!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete attachment");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
