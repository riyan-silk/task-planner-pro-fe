import type { Task } from "../../types";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface Props {
  task: Task;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const TaskCard = ({ task, onEdit, onDelete }: Props) => {
  const priorityColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }[task.priority];

  const statusColor = {
    todo: "bg-gray-100 text-gray-800",
    "in-progress": "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800",
  }[task.status];

  return (
    <div className="bg-card border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}
        >
          {task.priority.toUpperCase()}
        </span>
      </div>
      {task.description && (
        <p className="text-muted mb-4">{task.description}</p>
      )}
      <div className="flex justify-between items-center text-sm text-muted">
        <span className={`px-2 py-1 rounded-full ${statusColor}`}>
          {task.status.replace("-", " ")}
        </span>
        {task.dueDate && (
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>{format(new Date(task.dueDate), "MMM dd")}</span>
          </div>
        )}
      </div>
      {onEdit && onDelete && (
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => onEdit(task.id)}
            className="text-primary hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
