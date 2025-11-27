import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks"; // converts single newlines to <br>

interface Props {
  task: any;
  onClose: () => void;
}

const TaskViewModal = ({ task, onClose }: Props) => {
  if (!task) return null;

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "";
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "todo":
        return "bg-muted text-muted-foreground";
      case "in-progress":
        return "bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "done":
        return "bg-green-200 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      default:
        return "";
    }
  };

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto p-6 rounded-xl border border-border bg-card shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-primary leading-tight">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Status & Priority */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">Status:</span>
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(
                  task.status
                )}`}
              >
                {task.status.replace("-", " ")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">Priority:</span>
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityStyle(
                  task.priority
                )}`}
              >
                {String(task.priority).toUpperCase()}
              </span>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Due Date:</span>
                <span className="text-sm">{task.dueDate.substring(0, 10)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 text-lg text-primary">Description</h3>

            <div className="rounded-lg border border-border bg-muted/40 dark:bg-muted/20 p-4 prose dark:prose-invert max-w-none">
              {task.description ? (
                // remark-breaks makes single newlines render as <br>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {task.description}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">No description available</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskViewModal;
