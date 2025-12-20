// src/pages/TaskAttachments.tsx
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import useTaskAttachments from "../../hooks/useAttachment";
import { Download, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";

const TaskAttachments = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const taskIdNum = Number(taskId);
  const { attachments, fetchAttachments, deleteAttachment } =
    useTaskAttachments();

  useEffect(() => {
    if (taskIdNum) {
      fetchAttachments(taskIdNum);
    }
  }, [taskIdNum, fetchAttachments]);

  const handleDelete = (id: number) => {
    deleteAttachment(id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Attachments</h1>
      <div className="space-y-4">
        {attachments.length === 0 ? (
          <p className="text-muted-foreground">No attachments yet.</p>
        ) : (
          attachments.map((att) => (
            <div
              key={att.id}
              className="flex justify-between items-center p-4 border rounded-lg bg-card"
            >
              <div>
                <p className="font-medium">{att.file_name}</p>
                {att.file_size && (
                  <p className="text-sm text-muted-foreground">
                    {(att.file_size / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={att.file_path} download={att.file_name}>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(att.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskAttachments;
