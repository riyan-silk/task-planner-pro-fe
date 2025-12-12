import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import type { Task } from "../../types";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Button } from "../../components/ui/button";
import { Calendar as CalendarComponent } from "../../components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../lib/utils";
import { format } from "date-fns";

interface Props {
  initialData?: Partial<Task> | null;
  onSubmit: (task: any) => void;
}

const TaskForm = ({ initialData, onSubmit }: Props) => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    priority: "low",
    status: "todo",
    dueDate: undefined as Date | undefined,
  });
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  useEffect(() => {
    if (initialData) {
      setTask({
        title: initialData.title || "",
        description: initialData.description || "",
        priority: (initialData.priority as "low" | "medium" | "high") || "low",
        status:
          (initialData.status as "todo" | "in-progress" | "done") || "todo",
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate)
          : undefined,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: any = {};
    if (!task.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (task.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (task.title.trim().length > 255) {
      newErrors.title = "Title cannot exceed 255 characters.";
    }
    if (task.description && task.description.length > 5000) {
      newErrors.description = "Description cannot exceed 5000 characters.";
    }
    if (task.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (task.dueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({
      title: task.title,
      description: task.description || null,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card p-6 rounded-xl shadow-md space-y-6 border border-border"
    >
      <div>
        <label className="block text-sm font-semibold mb-2">Title</label>
        <input
          type="text"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          required
          className="w-full border border-border p-3 rounded-md bg-input text-foreground"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Description</label>
        <div className="rounded-md overflow-hidden border border-border bg-input">
          <MDEditor
            value={task.description}
            onChange={(val) => setTask({ ...task, description: val || "" })}
            preview="edit"
            height={300}
            visiableDragbar={false}
            className="bg-input text-foreground"
          />
        </div>
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Priority</label>
          <Select
            value={task.priority}
            onValueChange={(value) => setTask({ ...task, priority: value })}
          >
            <SelectTrigger className="w-full border border-border p-3 rounded-md bg-input text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Status</label>
          <Select
            value={task.status}
            onValueChange={(value) => setTask({ ...task, status: value })}
          >
            <SelectTrigger className="w-full border border-border p-3 rounded-md bg-input text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <label className="block text-sm font-semibold mb-2">Due Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-input text-foreground border-border p-3 rounded-md",
                  !task.dueDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {task.dueDate ? (
                  format(task.dueDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={task.dueDate}
                onSelect={(date) => setTask({ ...task, dueDate: date })}
                initialFocus
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </PopoverContent>
          </Popover>
          {errors.dueDate && (
            <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
          )}
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition"
      >
        {initialData ? "Update Task" : "Create Task"}
      </button>
    </form>
  );
};

export default TaskForm;
