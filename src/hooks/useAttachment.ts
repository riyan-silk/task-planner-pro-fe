import { useTaskAttachmentsStore } from "../store/attachmentStore";

export default function useAttachment() {
  return useTaskAttachmentsStore();
}
