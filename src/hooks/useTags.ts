import { useTaskTagsStore } from "../store/tagsStore";

export default function useTags() {
  return useTaskTagsStore();
}
