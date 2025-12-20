// src/components/TaskTable.tsx
import { useState } from "react";
import type { Task } from "../../types";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TaskViewModal from "../TaskViewModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import useTasks from "../../hooks/useTasks";
import { Loader2 } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";

interface Props {
  tasks: Task[];
  loading: boolean;
  viewMode: "pagination" | "infinite";
  lastTaskRef?: React.Ref<HTMLTableRowElement>;
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
}

const TaskTable = ({
  tasks,
  loading,
  viewMode,
  lastTaskRef,
  selectedIds,
  setSelectedIds,
}: Props) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const { deleteTask } = useTasks();

  const handleSort = (field: string) => {
    const currentSortBy = searchParams.get("sortBy");
    const currentOrder = searchParams.get("sortOrder") || "desc";
    let newSortBy = field;
    let newOrder = "desc";
    if (currentSortBy === field) {
      newOrder = currentOrder === "desc" ? "asc" : "desc";
    }
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("sortBy", newSortBy);
    newParams.set("sortOrder", newOrder);
    newParams.set("offset", "0");
    setSearchParams(newParams, { replace: true });
  };

  const getSortIcon = (field: string) => {
    const sortBy = searchParams.get("sortBy");
    const order = searchParams.get("sortOrder");
    if (sortBy !== field) {
      return (
        <span className="ml-1 inline-block w-3 text-muted-foreground opacity-60">
          ↕
        </span>
      );
    }
    return order === "asc" ? (
      <span className="ml-1">▲</span>
    ) : (
      <span className="ml-1">▼</span>
    );
  };

  const allSelectedOnPage =
    tasks.length > 0 && tasks.every((t) => selectedIds.includes(Number(t.id)));
  const toggleSelectAllOnPage = (checked: boolean) => {
    if (!checked) {
      const newIds = selectedIds.filter(
        (id) => !tasks.some((t) => Number(t.id) === id)
      );
      setSelectedIds(newIds);
    } else {
      const pageIds = tasks.map((t) => Number(t.id));
      const newIds = Array.from(new Set([...selectedIds, ...pageIds]));
      setSelectedIds(newIds);
    }
  };
  const toggleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      if (selectedIds.includes(id)) return;
      const newIds = [...selectedIds, id];
      setSelectedIds(newIds);
    } else {
      const newIds = selectedIds.filter((x: number) => x !== id);
      setSelectedIds(newIds);
    }
  };

  const thStickyClass =
    "sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-sm";

  if (loading && tasks.length === 0)
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );

  return (
    <div className="relative overflow-x-auto rounded-xl shadow border border-border bg-card">
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th
              className={`${thStickyClass} p-4 font-semibold w-10 text-center`}
            >
              <Checkbox
                checked={allSelectedOnPage || false}
                onCheckedChange={(checked) => toggleSelectAllOnPage(!!checked)}
                className="w-3 h-3 md:w-4 md:h-4"
              />
            </th>
            <th
              className={`p-4 font-semibold cursor-pointer ${thStickyClass}`}
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center">
                Title {getSortIcon("title")}
              </div>
            </th>
            <th
              className={`p-4 font-semibold cursor-pointer ${thStickyClass}`}
              onClick={() => handleSort("priority")}
            >
              <div className="flex items-center">
                Priority {getSortIcon("priority")}
              </div>
            </th>
            <th
              className={`p-4 font-semibold cursor-pointer ${thStickyClass}`}
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status {getSortIcon("status")}
              </div>
            </th>
            <th
              className={`p-4 font-semibold cursor-pointer ${thStickyClass}`}
              onClick={() => handleSort("dueDate")}
            >
              <div className="flex items-center">
                Due {getSortIcon("dueDate")}
              </div>
            </th>
            <th className={`${thStickyClass} p-4 font-semibold text-right`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task: Task, index: number) => (
              <tr
                key={task.id}
                ref={
                  viewMode === "infinite" && index === tasks.length - 1
                    ? lastTaskRef
                    : undefined
                }
                className="border-b border-border hover:bg-muted/50 transition"
                onClick={() => setSelectedTask(task)}
              >
                <td className="p-4 text-center">
                  <Checkbox
                    checked={selectedIds.includes(Number(task.id))}
                    onCheckedChange={(checked) => {
                      toggleSelectOne(Number(task.id), !!checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3 h-3 md:w-4 md:h-4"
                  />
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="hidden lg:inline">
                    {task.title.length > 40
                      ? task.title.substring(0, 40) + "…"
                      : task.title}
                  </span>
                  <span className="lg:hidden">
                    {task.title.length > 16
                      ? task.title.substring(0, 16) + "…"
                      : task.title}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      task.priority === "low"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                  >
                    {String(task.priority).toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`uppercase whitespace-nowrap px-2 py-1 text-xs rounded-full font-medium ${
                      task.status === "todo"
                        ? "bg-muted text-muted-foreground"
                        : task.status === "in-progress"
                        ? "bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-green-200 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    }`}
                  >
                    {task.status.replace("-", " ")}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap">
                  {task.dueDate
                    ? new Date(task.dueDate)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replace(/,/g, "")
                    : "-"}
                </td>
                <td className="p-4 text-right space-x-3 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                    }}
                    className="text-gray-500 hover:underline flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden md:inline">View</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tasks/${task.id}`);
                    }}
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="hidden md:inline">Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskToDelete(task);
                    }}
                    className="text-destructive hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden md:inline">Delete</span>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-6 text-center text-muted-foreground">
                No tasks found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <TaskViewModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
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
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskTable;
