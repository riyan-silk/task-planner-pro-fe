import { useState, useEffect, useRef } from "react";
import MDEditor, { commands as mdCommands } from "@uiw/react-md-editor";
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
        dueDate: initialData.dueDate ? (initialData.dueDate as string).substring(0, 10) : "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: task.title,
      description: task.description || null,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || null,
    });
  };

  // custom underline command (wrap selection with <u>...</u>)
  const underlineCommand: any = {
    name: "underline",
    keyCommand: "u",
    buttonProps: { "aria-label": "Underline" },
    icon: <span className="font-semibold">U</span>,
    execute: (state: any, api: any) => {
      // API differs across versions; try multiple ways
      try {
        // prefer api.replaceSelection if provided
        if (api && typeof api.replaceSelection === "function") {
          const selected = state.selectedText ?? "";
          api.replaceSelection(`<u>${selected}</u>`);
        } else if (state && api && typeof api.setSelection === "function") {
          const selected = state.selectedText ?? "";
          api.setSelection(`<u>${selected}</u>`);
        } else {
          // fallback: append tags around selectedText and set value
          const selected = state.text ?? "";
          const newText = `${state.before}\u003cu\u003e${selected}\u003c/u\u003e${state.after}`;
          api.replaceText ? api.replaceText(newText) : null;
        }
      } catch (e) {
        // best-effort, ignore on failure
        // console.warn("underline exec failed", e);
      }
    },
  };

  // Build commands array with just the items you want
  const limitedCommands: any[] = [
    mdCommands.bold,
    mdCommands.italic,
    underlineCommand,
    mdCommands.strikethrough,
    mdCommands.quote,
    mdCommands.code,
    mdCommands.link,
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl shadow-md space-y-6 border border-border">
      <div>
        <label className="block text-sm font-semibold mb-2">Title</label>
        <input
          type="text"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          required
          className="w-full border border-border p-3 rounded-md bg-input text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Description</label>

        {/* wrapper to apply the same bg / rounding as other inputs */}
        <div className="rounded-md overflow-hidden border border-border bg-input">
          <MDEditor
            value={task.description}
            onChange={(val) => setTask({ ...task, description: val || "" })}
            preview="edit"
            height={300}
            commands={limitedCommands}
            textareaProps={{
              // apply same input style to the textarea
              className: "bg-input p-3 text-foreground",
              style: { minHeight: 200 },
            }}
            visiableDragbar={false}
            className="bg-input"
          />
        </div>
      </div>
{/* Priority + Status + Due Date → 3-column on large, stacked on small */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  
  {/* Priority */}
  <div>
    <label className="block text-sm font-semibold mb-2">Priority</label>
    <select
      value={task.priority}
      onChange={(e) => setTask({ ...task, priority: e.target.value as any })}
      className="w-full border border-border p-3 rounded-md bg-input text-foreground"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </div>

  {/* Status */}
  <div>
    <label className="block text-sm font-semibold mb-2">Status</label>
    <select
      value={task.status}
      onChange={(e) => setTask({ ...task, status: e.target.value as any })}
      className="w-full border border-border p-3 rounded-md bg-input text-foreground"
    >
      <option value="todo">To Do</option>
      <option value="in-progress">In Progress</option>
      <option value="done">Done</option>
    </select>
  </div>

  {/* Due Date (same style you already approved) */}
  <div className="relative">
    <label className="block text-sm font-semibold mb-2">Due Date</label>

    <input
      ref={dateRef}
      id="due-date"
      type="date"
      value={task.dueDate}
      onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
      className="w-full border border-border p-3 rounded-md bg-input text-foreground pr-10
             [&::-webkit-calendar-picker-indicator]:opacity-0
             [&::-webkit-calendar-picker-indicator]:absolute
             [&::-webkit-calendar-picker-indicator]:right-0
             [&::-webkit-calendar-picker-indicator]:w-full
             [&::-webkit-calendar-picker-indicator]:h-full"
    />

    <Calendar
      onClick={() => {
        dateRef.current?.focus();
        if ((dateRef.current as any)?.showPicker) (dateRef.current as any).showPicker();
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
