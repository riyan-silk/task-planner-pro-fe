// src/store/commentStore.ts (Updated)
import { create } from "zustand";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

interface Comment {
  id: number;
  taskId: number;
  userId: number;
  comment: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

interface CommentState {
  comments: Comment[];
  loading: boolean;
  fetchComments: (taskId: number) => Promise<void>;
  createComment: (
    taskId: number,
    comment: string,
    parentId?: number
  ) => Promise<Comment | null>;
  updateComment: (id: number, comment: string) => Promise<Comment | null>;
  deleteComment: (id: number) => Promise<boolean>;
}

export const useTaskCommentsStore = create<CommentState>((set, get) => ({
  comments: [],
  loading: false,
  fetchComments: async (taskId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get(`/task_comments/${taskId}`);
      set({ comments: res.data.data.comments || [] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch comments");
    } finally {
      set({ loading: false });
    }
  },
  createComment: async (taskId, comment, parentId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return null;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(`/task_comments/${taskId}/create`, {
        comment,
        parentId,
      });
      const newComment = res.data.data.comment;
      set((state) => ({ comments: [...state.comments, newComment] }));
      toast.success("Comment added!");
      return newComment;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create comment");
      return null;
    } finally {
      set({ loading: false });
    }
  },
  updateComment: async (id, comment) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return null;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const taskId = get().comments.find((c) => c.id === id)?.taskId;
      if (!taskId) return null;
      const res = await api.put(`/task_comments/${taskId}/${id}`, { comment });
      const updatedComment = res.data.data.comment;
      set((state) => ({
        comments: state.comments.map((c) => (c.id === id ? updatedComment : c)),
      }));
      toast.success("Comment updated!");
      return updatedComment;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update comment");
      return null;
    } finally {
      set({ loading: false });
    }
  },
  deleteComment: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return false;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const taskId = get().comments.find((c) => c.id === id)?.taskId;
      if (!taskId) return false;
      const res = await api.delete(`/task_comments/${taskId}/${id}`);
      if (res.data.success) {
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        }));
        toast.success("Comment deleted!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
