import { useState, useEffect, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import type { Task } from "../../types";
import { Calendar } from "lucide-react";

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
    dueDate: "",
  });

  const dateRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialData) {
      setTask({
        title: initialData.title || "",
        description: initialData.description || "",
        priority: (initialData.priority as string) || "low",
        status: (initialData.status as string) || "todo",
        dueDate: initialData.dueDate
          ? (initialData.dueDate as string).substring(0, 10)
          : "",
      });
    }
  }, [initialData]);

  const [errors, setErrors] = useState({
  title: "",
  description: "",
  dueDate: "",
});

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
    const today = new Date().toISOString().split("T")[0];
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
      dueDate: task.dueDate || null,
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
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Description</label>
        <div className="rounded-md overflow-hidden border border-border bg-input">
          <MDEditor
            value={task.description}
            onChange={(val) => setTask({ ...task, description: val || "" })}
            preview="edit"
            height={300}
            // commands={limitedCommands}
            textareaProps={{
              className: "bg-input p-3 text-foreground",
              style: { minHeight: 200 },
            }}
            visiableDragbar={false}
            className="bg-input"
          />
          
        </div>
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Priority</label>
          <select
            value={task.priority}
            onChange={(e) =>
              setTask({ ...task, priority: e.target.value as any })
            }
            className="w-full border border-border p-3 rounded-md bg-input text-foreground"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Status</label>
          <select
            value={task.status}
            onChange={(e) =>
              setTask({ ...task, status: e.target.value as any })
            }
            className="w-full border border-border p-3 rounded-md bg-input text-foreground"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-semibold mb-2">Due Date</label>

          <input
            ref={dateRef}
            id="due-date"
            type="date"
            value={task.dueDate}
            onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
            min={new Date().toISOString().split("T")[0]} 
            className="w-full border border-border p-3 rounded-md bg-input text-foreground pr-10
             [&::-webkit-calendar-picker-indicator]:opacity-0
             [&::-webkit-calendar-picker-indicator]:absolute
             [&::-webkit-calendar-picker-indicator]:right-0
             [&::-webkit-calendar-picker-indicator]:w-full
             [&::-webkit-calendar-picker-indicator]:h-full"
          />

          {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}


          <Calendar
            onClick={() => {
              dateRef.current?.focus();
              if ((dateRef.current as any)?.showPicker)
                (dateRef.current as any).showPicker();
            }}
            className="absolute right-3 bottom-3 h-5 w-5 cursor-pointer text-muted-foreground"
          />
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
