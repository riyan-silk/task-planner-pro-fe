import { useTaskStore } from "../store/taskStore";

export default function useTasks() {
  return useTaskStore();
}
