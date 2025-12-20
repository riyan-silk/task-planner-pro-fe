import { useTaskCommentsStore } from "../store/commentStore";

export default function useComments() {
  return useTaskCommentsStore();
}
