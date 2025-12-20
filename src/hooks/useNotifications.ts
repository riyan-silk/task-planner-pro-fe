import { useNotificationsStore } from "../store/notificationStore";

export default function useNotifications() {
  return useNotificationsStore();
}
