import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../components/ui/alert-dialog";
import { useState } from "react";
import useTasks from "@/hooks/useTasks";

interface Props {
  task: any;
  onClose: () => void;
}

const TaskViewModal = ({ task, onClose }: Props) => {
  if (!task) return null;
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const { deleteTask } = useTasks();

  const navigate = useNavigate();

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
      <DialogContent className="max-w-3xl max-h-screen my-2 overflow-y-auto p-6 rounded-xl border border-border bg-card shadow-xl">
        <DialogHeader className="flex align-center">
          <div className="flex align-center">
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-tight">
              {task.title}
            </DialogTitle>
            <button
              onClick={() => {
                navigate(`/tasks/${task.id}`);
              }}
              className="text-blue-500 hover:underline flex items-center gap-1 mx-4"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden md:inline">Edit</span>
            </button>
            <button
              onClick={() => {
                setTaskToDelete(task);
              }}
              className="text-destructive hover:underline flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">Delete</span>
            </button>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">
                Status:
              </span>
              <span
                className={`uppercase px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(
                  task.status
                )}`}
              >
                {task.status.replace("-", " ")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">
                Priority:
              </span>
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
                <span className="font-semibold text-muted-foreground">
                  Due Date:
                </span>
                <span className="text-sm">
                  {new Date(task.dueDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-lg text-primary">
              Description
            </h3>

            <div className="rounded-lg border border-border bg-muted/40 dark:bg-muted/20 p-4 max-w-none">
              {task.description ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-xl font-semibold mt-4 mb-2"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-lg font-semibold mt-3 mb-2"
                        {...props}
                      />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4
                        className="text-base font-semibold mt-3 mb-1"
                        {...props}
                      />
                    ),
                    h5: ({ node, ...props }) => (
                      <h5
                        className="text-sm font-semibold mt-2 mb-1"
                        {...props}
                      />
                    ),
                    h6: ({ node, ...props }) => (
                      <h6
                        className="text-sm font-medium mt-2 mb-1"
                        {...props}
                      />
                    ),

                    p: ({ node, ...props }) => (
                      <p
                        className="mb-2 leading-relaxed text-foreground"
                        {...props}
                      />
                    ),

                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 pl-4 italic text-muted-foreground bg-muted/10 dark:bg-muted/20 py-2 my-3"
                        {...props}
                      />
                    ),

                    code: (props: any) => {
                      const { inline, className, children, ...rest } = props;

                      if (inline) {
                        return (
                          <code
                            className="bg-muted/20 dark:bg-muted/30 rounded px-1 py-0.5 text-sm font-mono"
                            {...rest}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <pre className="rounded-lg overflow-auto bg-[#0b1220] text-sm p-3 my-3">
                          <code className={`${className} text-white`} {...rest}>
                            {children}
                          </code>
                        </pre>
                      );
                    },

                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6 mb-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6 mb-2" {...props} />
                    ),
                    li: (props: any) => {
                      const { node, children, ...rest } = props;
                      const isTask =
                        node?.checked !== null && node?.checked !== undefined;

                      if (isTask) {
                        const checked = node.checked;
                        return (
                          <li className="mb-1 flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={!!checked}
                              disabled
                              className="mt-1"
                            />
                            <div>{children}</div>
                          </li>
                        );
                      }

                      return (
                        <li className="mb-1" {...rest}>
                          {children}
                        </li>
                      );
                    },

                    table: ({ node, ...props }) => (
                      <div className="overflow-auto my-3">
                        <table
                          className="min-w-full border-collapse table-auto text-sm"
                          {...props}
                        />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="text-left px-3 py-2 border-b border-border font-medium"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className="px-3 py-2 border-b border-border"
                        {...props}
                      />
                    ),

                    hr: ({ node, ...props }) => (
                      <hr className="my-4 border-t border-border" {...props} />
                    ),

                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      />
                    ),

                    img: ({ node, ...props }) => (
                      <img
                        {...props}
                        className="max-w-full rounded-md my-2"
                        alt={props.alt || ""}
                      />
                    ),
                    div: ({ node, ...props }) => <div {...props} />,
                    span: ({ node, ...props }) => <span {...props} />,
                    pre: ({ node, ...props }) => <pre {...props} />,
                  }}
                >
                  {String(task.description)}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">
                  No description available
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={() => setTaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task:
              <br />
              <span className="font-semibold text-foreground">
                {taskToDelete?.title}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (taskToDelete) deleteTask(taskToDelete.id);
                setTaskToDelete(null);
                onClose();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default TaskViewModal;
