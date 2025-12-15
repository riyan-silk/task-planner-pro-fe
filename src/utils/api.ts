import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "http://localhost:8000/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      const { refresh } = useAuthStore.getState();
      await refresh();
      if (localStorage.getItem("token")) {
        originalRequest.headers.Authorization = `Bearer ${localStorage.getItem(
          "token"
        )}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export { api };
