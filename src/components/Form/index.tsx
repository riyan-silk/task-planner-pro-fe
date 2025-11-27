import { useState, useEffect } from "react";
import type { Task } from "../../types";
import useTheme from "@/hooks/useTheme";

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

  const { theme } = useTheme();

  useEffect(() => {
    if (initialData) {
      setTask({
        title: initialData.title || "",
        description: initialData.description || "",
        priority: initialData.priority || "low",
        status: initialData.status || "todo",
        dueDate: initialData.dueDate ? initialData.dueDate.substring(0, 10) : "",
      });
    }
  }, [initialData]);

  const handleChange = (e: any) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card dark:bg-gray-900 p-6 rounded-xl shadow-md space-y-4 border border-border dark:border-gray-800"
    >
      <div>
        <label className="block text-sm font-semibold mb-1 text-foreground dark:text-gray-200">Title</label>
        <input
          type="text"
          name="title"
          value={task.title}
          onChange={handleChange}
          required
          className="w-full border border-border p-2 rounded-md bg-input dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-foreground dark:text-gray-200">Description</label>
        <textarea
          name="description"
          value={task.description}
          onChange={handleChange}
          className="w-full border border-border p-2 rounded-md bg-input dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-foreground dark:text-gray-200">Priority</label>
          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className="w-full border border-border p-2 rounded-md bg-input dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-foreground dark:text-gray-200">Status</label>
          <select
            name="status"
            value={task.status}
            onChange={handleChange}
            className="w-full border border-border p-2 rounded-md bg-input dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-foreground dark:text-gray-200">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={task.dueDate}
          onChange={handleChange}
          className="w-full border border-border p-2 rounded-md bg-input dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
      </div>

{
theme === "light" ? <button
        type="submit"
        className="mt-4 bg-primary text-white w-full p-3 rounded-lg shadow hover:bg-primary-600 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        {initialData ? "Update Task" : "Add Task"}
      </button> :  <button
        type="submit"
        className="mt-4 bg-blue-500 text-white w-full p-3 rounded-lg shadow hover:bg-primary-600 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        {initialData ? "Update Task" : "Add Task"}
      </button>
}
      
    </form>
  );
};

export default TaskForm;


