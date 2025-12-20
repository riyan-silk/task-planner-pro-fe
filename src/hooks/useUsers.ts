import { useUserStore } from "../store/userStore";

export default function useUsers() {
  return useUserStore();
}
