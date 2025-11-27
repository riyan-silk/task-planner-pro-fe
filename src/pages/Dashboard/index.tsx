import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useTasks from "../../hooks/useTasks";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import TaskViewModal from "../../components/TaskViewModal";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../utils/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, Eye } from "lucide-react";

const VALID_SORTS = ["title", "priority", "status", "dueDate", "createdAt"];

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"pagination" | "infinite">(
    (searchParams.get("view") as any) || "pagination"
  );

  const { tasks, stats, total, fetchTasks, loading, deleteTask } = useTasks();
  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);

  // lastTaskRef should be a table row element
  const lastTaskRef = useRef<HTMLTableRowElement | null>(null);

  // compute offset separately so we can use it for append flag
  const offsetVal = Number(searchParams.get("offset")) || 0;

  const filters = useMemo(
    () => ({
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      search: searchParams.get("search") || undefined,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
      sortBy: (searchParams.get("sortBy") as string) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as string) || "desc",
      limit: viewMode === "infinite" ? 15 : Number(searchParams.get("limit")) || 10,
      offset: offsetVal,
      // append only when infinite mode AND offset > 0 (i.e. load additional pages)
      append: viewMode === "infinite" && offsetVal > 0 ? "true" : undefined,
    }),
    [searchParams.toString(), viewMode, offsetVal]
  );

  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
  });

  const fromRef = useRef<HTMLInputElement | null>(null);
  const toRef = useRef<HTMLInputElement | null>(null);
  const searchDebounceRef = useRef<number | null>(null);

  const fetchWithSpinner = async (f: any) => {
    try {
      setIsFetching(true);
      await fetchTasks(f);
    } finally {
      setIsFetching(false);
    }
  };

  // initial fetch + whenever filters change
  useEffect(() => {
    fetchWithSpinner(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.limit, filters.offset, filters.sortBy, filters.sortOrder, filters.status, filters.priority, filters.search, filters.fromDate, filters.toDate, viewMode]);

  // IntersectionObserver for infinite scroll:
  useEffect(() => {
    if (viewMode !== "infinite") {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
      return;
    }

    // only set up observer if we have at least one task and more to load
    const totalCount = stats?.total ?? total ?? 0;
    if (tasks.length === 0 || tasks.length >= totalCount) {
      // nothing to observe or already loaded everything
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
      return;
    }

    // create observer
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        const ent = entries[0];
        if (!ent) return;
        if (ent.isIntersecting && !loading) {
          // calculate next offset as current loaded count
          const newOffset = tasks.length;
          // don't trigger if offset already equals tasks length
          const currentOffset = Number(searchParams.get("offset")) || 0;
          if (newOffset > currentOffset) {
            setSearchParams((p) => {
              p.set("offset", String(newOffset));
              return p;
            });
          }
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    // observe last row (if exists)
    const el = lastTaskRef.current;
    if (el) observer.current.observe(el);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, tasks.length, loading, stats?.total, total, searchParams]);

  const setParams = (updater: (p: URLSearchParams) => URLSearchParams | void) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      const result = updater(p) || p;
      return result;
    });
  };

  const applyImmediate = (key: string, value: string) => {
    setParams((p) => {
      if (!value || value === "all") p.delete(key);
      else p.set(key, value);
      p.set("offset", "0");
      return p;
    });
  };

  const handleSort = (field: string) => {
    if (!VALID_SORTS.includes(field)) return;
    setParams((p) => {
      const currentSortBy = p.get("sortBy") || "createdAt";
      const currentOrder = p.get("sortOrder") || "desc";
      if (currentSortBy === field) {
        p.set("sortOrder", currentOrder === "desc" ? "asc" : "desc");
      } else {
        p.set("sortBy", field);
        p.set("sortOrder", "desc");
      }
      p.set("offset", "0");
      return p;
    });
  };

  const getSortIcon = (field: string) => {
    const sby = searchParams.get("sortBy") || "createdAt";
    const sorder = searchParams.get("sortOrder") || "desc";
    if (sby !== field) {
      return <span className="ml-1 inline-block w-3 text-muted-foreground opacity-60">↕</span>;
    }
    return <span className="ml-1 inline-block text-sm opacity-90">{sorder === "asc" ? "↑" : "↓"}</span>;
  };

  useEffect(() => {
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    if (!localFilters.search) {
      setParams((p) => {
        p.delete("search");
        p.set("offset", "0");
        return p;
      });
      return;
    }
    searchDebounceRef.current = window.setTimeout(() => {
      setParams((p) => {
        p.set("search", localFilters.search);
        p.set("offset", "0");
        return p;
      });
    }, 500);

    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters.search]);

  const handleClear = () => {
    setLocalFilters({
      search: "",
      status: "",
      priority: "",
      fromDate: "",
      toDate: "",
    });
    setParams((p) => {
      p.delete("search");
      p.delete("status");
      p.delete("priority");
      p.delete("fromDate");
      p.delete("toDate");
      p.set("offset", "0");
      return p;
    });
  };

  const handleViewModeChange = (mode: "pagination" | "infinite") => {
    setViewMode(mode);
    setParams((p) => {
      p.set("view", mode);
      p.set("offset", "0");
      return p;
    });
  };

  const selectValueOrAll = (v?: string) => (v && v !== "" ? v : "all");
  const completed = stats?.completed ?? 0;
  const pending = stats?.pending ?? (total || 0) - completed;
  const pageSize = filters.limit || 10;
  const currentPage = Math.floor((filters.offset || 0) / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((stats?.total || total || 0) / pageSize));

  const InlineSpinner = () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Updating…</span>
    </div>
  );

  const thStickyClass = "sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-sm";

  if (!tasks || loading === undefined) return <Loader />;

  return (
    <div className="px-2 md:px-6 max-w-7xl mx-auto pb-8">
      <div className="flex items-center justify-between my-4">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <div>{isFetching ? <InlineSpinner /> : null}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl shadow border border-border">
          <h3 className="text-muted-foreground">Total Tasks</h3>
          <p className="text-4xl font-bold text-primary">{stats?.total ?? total ?? 0}</p>
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

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            value={localFilters.search}
            onChange={(e) => setLocalFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search tasks..."
            className="bg-card border-border"
          />
        </div>
        <div>
          <Select
            value={selectValueOrAll(localFilters.status)}
            onValueChange={(v) => {
              const normalized = v === "all" ? "" : v;
              setLocalFilters((prev) => ({ ...prev, status: normalized }));
              applyImmediate("status", v);
            }}
          >
            <SelectTrigger className="bg-card min-w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={selectValueOrAll(localFilters.priority)}
            onValueChange={(v) => {
              const normalized = v === "all" ? "" : v;
              setLocalFilters((prev) => ({ ...prev, priority: normalized }));
              applyImmediate("priority", v);
            }}
          >
            <SelectTrigger className="bg-card min-w-[160px]">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Input
              ref={fromRef}
              id="from-date"
              type="date"
              value={localFilters.fromDate}
              onChange={(e) => {
                const val = e.target.value;
                setLocalFilters((prev) => ({ ...prev, fromDate: val }));
                applyImmediate("fromDate", val);
              }}
              className="bg-card border-border pr-10"
              placeholder="From"
            />
            <Calendar
              onClick={() => {
                fromRef.current?.focus();
                if ((fromRef.current as any)?.showPicker) (fromRef.current as any).showPicker();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
            />
          </div>

          <div className="relative">
            <Input
              ref={toRef}
              id="to-date"
              type="date"
              value={localFilters.toDate}
              onChange={(e) => {
                const val = e.target.value;
                setLocalFilters((prev) => ({ ...prev, toDate: val }));
                applyImmediate("toDate", val);
              }}
              className="bg-card border-border pr-10"
              placeholder="To"
            />
            <Calendar
              onClick={() => {
                toRef.current?.focus();
                if ((toRef.current as any)?.showPicker) (toRef.current as any).showPicker();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
            />
          </div>
        </div>
        <div>
          <Select value={viewMode} onValueChange={(v: any) => handleViewModeChange(v)}>
            <SelectTrigger className="bg-card w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pagination">Pagination</SelectItem>
              <SelectItem value="infinite">Infinite Scroll</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {viewMode === "pagination" && (
          <div>
            <Select
              value={String(filters.limit)}
              onValueChange={(v) => {
                setParams((p) => {
                  p.set("limit", v);
                  p.set("offset", "0");
                  return p;
                });
              }}
            >
              <SelectTrigger className="bg-card w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Button size="sm" variant="outline" onClick={handleClear} className="px-3">
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-xl shadow border border-border bg-card">
        {isFetching && viewMode === "infinite" && tasks.length > 0 && (
          <div className="absolute inset-0 z-30 flex items-start justify-center pointer-events-none">
            <div className="mt-4 rounded px-3 py-1 bg-card/90 border border-border backdrop-blur-sm">
              <InlineSpinner />
            </div>
          </div>
        )}
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className={`p-4 font-semibold cursor-pointer ${thStickyClass}`} onClick={() => handleSort("title")}>
                <div className="flex items-center">Title {getSortIcon("title")}</div>
              </th>
              <th className={`p-4 font-semibold cursor-pointer ${thStickyClass}`} onClick={() => handleSort("priority")}>
                <div className="flex items-center">Priority {getSortIcon("priority")}</div>
              </th>
              <th className={`p-4 font-semibold cursor-pointer ${thStickyClass}`} onClick={() => handleSort("status")}>
                <div className="flex items-center">Status {getSortIcon("status")}</div>
              </th>
              <th className={`p-4 font-semibold cursor-pointer ${thStickyClass}`} onClick={() => handleSort("dueDate")}>
                <div className="flex items-center">Due {getSortIcon("dueDate")}</div>
              </th>
              <th className={`${thStickyClass} p-4 font-semibold text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task: any, index: number) => (
                <tr
                  key={task.id}
                  ref={viewMode === "infinite" && index === tasks.length - 1 ? lastTaskRef : undefined}
                  className="border-b border-border hover:bg-muted/50 transition"
                >
                  <td className="p-4">{task.title}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${task.priority === "low"
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
                      className={`px-2 py-1 text-xs rounded-full font-medium ${task.status === "todo"
                          ? "bg-muted text-muted-foreground"
                          : task.status === "in-progress"
                            ? "bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-green-200 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        }`}
                    >
                      {task.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="p-4">{task.dueDate?.substring(0, 10) || "-"}</td>
                  <td className="p-4 text-right space-x-3">
                    <button onClick={() => setSelectedTask(task)} className="text-blue-500 hover:underline">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => navigate(`/tasks/${task.id}`)} className="text-blue-500 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {viewMode === "infinite" && loading && tasks.length > 0 && (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        )}
      </div>

      {viewMode === "pagination" && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              const offset = (newPage - 1) * pageSize;
              setParams((p) => {
                p.set("offset", String(offset));
                return p;
              });
            }}
          />
        </div>
      )}

      <TaskViewModal task={selectedTask} onClose={() => setSelectedTask(null)} />

      <button
        onClick={() => navigate("/tasks/new")}
        className="bg-primary text-primary-foreground fixed bottom-6 right-6 px-6 py-3 rounded-full shadow-xl hover:bg-primary/80 transition"
      >
        + New Task
      </button>
      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task:
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

export default Dashboard;
