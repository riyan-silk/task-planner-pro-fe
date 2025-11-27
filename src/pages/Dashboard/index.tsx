import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useTasks from "../../hooks/useTasks";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../utils/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// interface Task {
//   id: number;
//   title: string;
//   priority: 'low' | 'medium' | 'high';
//   status: 'todo' | 'in-progress' | 'done';
//   dueDate?: string;
//   createdAt?: string;
// }

// type SortField = 'title' | 'priority' | 'status' | 'dueDate' | 'createdAt';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { fetchTasks, loading, deleteTask } = useTasks();
  const filters = useMemo(
  () => ({
    status: searchParams.get("status") || undefined,
    priority: searchParams.get("priority") || undefined,
    search: searchParams.get("search") || undefined,
    fromDate: searchParams.get("fromDate") || undefined,
    toDate: searchParams.get("toDate") || undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
    limit: Number(searchParams.get("limit")) || 10,
    offset: Number(searchParams.get("offset")) || 0,
  }),
  [searchParams.toString()]
);
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
  });
  // const getSortableValue = (task: Task, field: SortField): string | number => {
  //   switch (field) {
  //     case "title":
  //       return task.title?.toLowerCase() || "";
  //     case "priority":
  //       const prioMap: Record<Task['priority'], number> = { low: 1, medium: 2, high: 3 };
  //       return prioMap[task.priority] || 0;
  //     case "status":
  //       const statMap: Record<Task['status'], number> = { todo: 1, "in-progress": 2, done: 3 };
  //       return statMap[task.status] || 0;
  //     case "dueDate":
  //     case "createdAt":
  //       return task[field] ? new Date(task[field]).getTime() : 0;
  //     default:
  //       return "";
  //   }
  // };
//   const sortedTasks = useMemo(() => {
//   return [...tasks].sort((a, b) => {
//     const aVal = getSortableValue(a as Task, filters.sortBy as SortField);
//     const bVal = getSortableValue(b as Task, filters.sortBy as SortField);
//     const multiplier = filters.sortOrder === "asc" ? 1 : -1;

//     if (typeof aVal === "number" && typeof bVal === "number") {
//       return (aVal - bVal) * multiplier;
//     }

//     return String(aVal).localeCompare(String(bVal)) * multiplier;
//   });
// }, [tasks, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
  fetchTasks(filters);
}, [filters]);
  const updateFilter = (key: string, value: string) => {
    const newParams = {
      ...Object.fromEntries(searchParams.entries()),
      [key]: value,
    };
    setSearchParams(newParams);
  };
  const handleSort = (field: string) => {
    let newSortBy = field;
    let newSortOrder = "desc";
    if (filters.sortBy === field) {
      newSortOrder = filters.sortOrder === "desc" ? "asc" : "desc";
    }
    updateFilter("sortBy", newSortBy);
    updateFilter("sortOrder", newSortOrder);
  };
  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) return null;
    const symbol = filters.sortOrder === "asc" ? "↑" : "↓";
    return <span className="ml-1 text-sm opacity-70">{symbol}</span>;
  };
  const handleApply = () => {
    const newParams = new URLSearchParams(searchParams);
    if (localFilters.search) {
      newParams.set("search", localFilters.search);
    } else {
      newParams.delete("search");
    }
    if (localFilters.status) {
      newParams.set("status", localFilters.status);
    } else {
      newParams.delete("status");
    }
    if (localFilters.priority) {
      newParams.set("priority", localFilters.priority);
    } else {
      newParams.delete("priority");
    }
    if (localFilters.fromDate) {
      newParams.set("fromDate", localFilters.fromDate);
    } else {
      newParams.delete("fromDate");
    }
    if (localFilters.toDate) {
      newParams.set("toDate", localFilters.toDate);
    } else {
      newParams.delete("toDate");
    }
    setSearchParams(newParams);
  };
  const handleClear = () => {
    setLocalFilters({
      search: "",
      status: "",
      priority: "",
      fromDate: "",
      toDate: "",
    });
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    newParams.delete("status");
    newParams.delete("priority");
    newParams.delete("fromDate");
    newParams.delete("toDate");
    setSearchParams(newParams);
  };
  const { tasks, total } = useTasks(); 

const completed = tasks.filter((t) => t.status === "done").length;
const pending = total - completed;

const pageSize = filters.limit;
const totalPages = Math.ceil(total / pageSize);

const paginatedTasks = tasks; // backend already did pagination
  if (loading) return <Loader />;
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl shadow border border-border">
          <h3 className="text-muted-foreground">Total Tasks</h3>
          <p className="text-4xl font-bold text-primary">{total}</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow border border-border">
          <h3 className="text-muted-foreground">Completed</h3>
          <p className="text-4xl font-bold text-green-500">{completed}</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow border border-border">
          <h3 className="text-muted-foreground">Pending</h3>
          <p className="text-4xl font-bold text-destructive">{pending}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          value={localFilters.search}
          onChange={(e) =>
            setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
          }
          placeholder="Search tasks..."
          className="bg-card border-border"
        />
        <Select
          value={localFilters.status}
          onValueChange={(v) =>
            setLocalFilters((prev) => ({ ...prev, status: v }))
          }
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={localFilters.priority}
          onValueChange={(v) =>
            setLocalFilters((prev) => ({ ...prev, priority: v }))
          }
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          type="date"
          value={localFilters.fromDate}
          onChange={(e) =>
            setLocalFilters((prev) => ({ ...prev, fromDate: e.target.value }))
          }
          className="bg-card border-border"
          placeholder="From Date"
        />
        <Input
          type="date"
          value={localFilters.toDate}
          onChange={(e) =>
            setLocalFilters((prev) => ({ ...prev, toDate: e.target.value }))
          }
          className="bg-card border-border"
          placeholder="To Date"
        />
        <Select
  value={String(filters.limit)}
  onValueChange={(v) => {
    setSearchParams((p) => {
      p.set("limit", v);
      p.set("offset", "0");
      return p;
    });
  }}
>
  <SelectTrigger className="bg-card w-32">
    <SelectValue placeholder="Page Size" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="5">5</SelectItem>
    <SelectItem value="10">10</SelectItem>
    <SelectItem value="20">20</SelectItem>
    <SelectItem value="50">50</SelectItem>
  </SelectContent>
</Select>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApply} className="flex-1">
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear} className="flex-1">
            Clear
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl shadow border border-border bg-card">
        <table className="min-w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th
                className="p-4 font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("title")}
              >
                Title{getSortIcon("title")}
              </th>
              <th
                className="p-4 font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("priority")}
              >
                Priority{getSortIcon("priority")}
              </th>
              <th
                className="p-4 font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                Status{getSortIcon("status")}
              </th>
              <th
                className="p-4 font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("dueDate")}
              >
                Due{getSortIcon("dueDate")}
              </th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-border hover:bg-muted/50 transition"
              >
                <td className="p-4">{task.title}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium
                      ${
                        task.priority === "low"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                      }
                  `}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium
                    ${
                      task.status === "todo"
                        ? "bg-muted text-muted-foreground"
                        : task.status === "in-progress"
                        ? "bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-green-200 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    }
                  `}
                  >
                    {task.status.replace("-", " ")}
                  </span>
                </td>
                <td className="p-4">{task.dueDate?.substring(0, 10)}</td>
                <td className="p-4 text-right space-x-3">
                  <button
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      confirm("Delete task?") && deleteTask(task.id)
                    }
                    className="text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={(newPage) => {
  const offset = (newPage - 1) * filters.limit;
  setPage(newPage);
  setSearchParams((p) => {
    p.set("offset", String(offset));
    return p;
  });
}}
/>
      <button
        onClick={() => navigate("/tasks/new")}
        className="bg-primary text-primary-foreground fixed bottom-6 right-6 px-6 py-3 rounded-full shadow-xl hover:bg-primary/80 transition"
      >
        + New Task
      </button>
    </div>
  );
};

export default Dashboard;