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
} from "../../components/ui/select";
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
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Calendar,
  Loader2,
  Eye,
  Filter,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const VALID_SORTS = ["title", "priority", "status", "dueDate", "createdAt"];

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"pagination" | "infinite">(
    (searchParams.get("view") as any) || "pagination"
  );

  const {
    tasks,
    stats,
    total,
    fetchTasks,
    loading,
    deleteTask,
    bulkDeleteTasks,
    bulkUpdateTasks,
  } = useTasks();
  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const lastTaskRef = useRef<HTMLTableRowElement | null>(null);

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
      limit:
        viewMode === "infinite" ? 15 : Number(searchParams.get("limit")) || 10,
      offset: offsetVal,
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
  const dateRef = useRef<HTMLInputElement | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<{
    status: string;
    priority: string;
    dueDate: string;
  }>({
    status: "",
    priority: "",
    dueDate: "",
  });
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchWithSpinner = async (f: any) => {
    try {
      setIsFetching(true);
      await fetchTasks(f);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchWithSpinner(filters);
    // clear selection when filters/view change
    setSelectedIds([]);
  }, [
    filters.limit,
    filters.offset,
    filters.sortBy,
    filters.sortOrder,
    filters.status,
    filters.priority,
    filters.search,
    filters.fromDate,
    filters.toDate,
    viewMode,
  ]);

  useEffect(() => {
    if (viewMode !== "infinite") {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
      return;
    }

    const totalCount = stats?.total ?? total ?? 0;
    if (tasks.length === 0 || tasks.length >= totalCount) {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
      return;
    }

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        const ent = entries[0];
        if (!ent) return;
        if (ent.isIntersecting && !loading) {
          const newOffset = tasks.length;
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

    const el = lastTaskRef.current;
    if (el) observer.current.observe(el);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, [viewMode, tasks.length, loading, stats?.total, total, searchParams]);

  const setParams = (
    updater: (p: URLSearchParams) => URLSearchParams | void
  ) => {
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
      return (
        <span className="ml-1 inline-block w-3 text-muted-foreground opacity-60">
          ↕
        </span>
      );
    }
    return (
      <span className="ml-1 inline-block text-sm opacity-90">
        {sorder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  useEffect(() => {
    if (searchDebounceRef.current)
      window.clearTimeout(searchDebounceRef.current);
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
      if (searchDebounceRef.current)
        window.clearTimeout(searchDebounceRef.current);
    };
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
    setSelectedIds([]);
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
  const totalPages = Math.max(
    1,
    Math.ceil((stats?.total || total || 0) / pageSize)
  );

  const InlineSpinner = () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Updating…</span>
    </div>
  );

  const thStickyClass =
    "sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-sm";

  const allSelectedOnPage =
    tasks.length > 0 &&
    tasks.every((t: any) => selectedIds.includes(Number(t.id)));

  const toggleSelectAllOnPage = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) =>
        prev.filter((id) => !tasks.some((t: any) => Number(t.id) === id))
      );
    } else {
      const pageIds = tasks.map((t: any) => Number(t.id));
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      } else {
        return prev.filter((x) => x !== id);
      }
    });
  };

  // ---- Bulk actions API calls ----

  const callBulkDelete = async () => {
    if (!selectedIds.length || !user) return;
    try {
      setBulkLoading(true);
      await bulkDeleteTasks(selectedIds);
      setBulkDeleteOpen(false);
      setSelectedIds([]);
      await fetchWithSpinner(filters);
    } catch (e) {
      console.error("Bulk delete error", e);
    } finally {
      setBulkLoading(false);
    }
  };

  const callBulkUpdate = async () => {
    if (!selectedIds.length || !user) return;

    const updates: any = {};
    if (bulkEditData.status) updates.status = bulkEditData.status;
    if (bulkEditData.priority) updates.priority = bulkEditData.priority;
    if (bulkEditData.dueDate) updates.dueDate = bulkEditData.dueDate;

    if (Object.keys(updates).length === 0) {
      setBulkEditOpen(false);
      return;
    }

    try {
      setBulkLoading(true);
      await bulkUpdateTasks(selectedIds, updates);
      setBulkEditOpen(false);
      setBulkEditData({ status: "", priority: "", dueDate: "" });
      setSelectedIds([]);
      await fetchWithSpinner(filters);
    } catch (e) {
      console.error("Bulk update error", e);
    } finally {
      setBulkLoading(false);
    }
  };

  if (!tasks || loading === undefined) return <Loader />;

  return (
    <div className="px-2 md:px-6 max-w-7xl mx-auto pb-16">
      {user && (
        <span className="block sm:hidden text-muted-foreground pt-2 pl-2 md:pl-4">
          Welcome, <span className="font-medium">{user.name}</span>
        </span>
      )}

      <div className="flex items-center justify-between my-4">
        <h1 className="text-3xl font-bold text-primary mx-1 md:mx-4">
          Dashboard
        </h1>
        <div>{isFetching ? <InlineSpinner /> : null}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-6 mb-8">
        <div className="bg-card p-2 md:p-6 rounded-xl shadow border border-border">
          <h3 className="text-muted-foreground text-sm sm:text-lg md:text-xl">
            Total Tasks
          </h3>
          <p className="text-3xl sm:text-4xl font-bold text-primary mt-2">
            {stats?.total ?? total ?? 0}
          </p>
        </div>
        <div className="bg-card p-2 md:p-6 rounded-xl shadow border border-border">
          <h3 className="text-muted-foreground text-sm sm:text-lg md:text-xl">
            Completed
          </h3>
          <p className="text-3xl sm:text-4xl font-bold text-green-500 mt-2">
            {completed}
          </p>
        </div>
        <div className="bg-card p-2 md:p-6 rounded-xl shadow border border-border">
          <h3 className="text-muted-foreground text-sm sm:text-lg md:text-xl">
            Pending
          </h3>
          <p className="text-3xl sm:text-4xl font-bold text-destructive mt-2">
            {pending}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 mb-2 text-primary font-semibold">
        <Filter className="w-5 h-5" />
        <span>Filters</span>
      </div>

      {/* Mobile Filters (Sheet) */}
      <div className="sm:hidden mb-4">
        <Sheet>
          <div className="flex w-full gap-3">
            <SheetTrigger asChild>
              <Button className="flex-1 flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </SheetTrigger>

            <Button variant="outline" onClick={handleClear} className="flex-1">
              Clear Filters
            </Button>
          </div>

          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>

            <div className="space-y-4">
              <Input
                value={localFilters.search}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
                placeholder="Search tasks..."
                className="bg-card border-border"
              />

              <Select
                value={selectValueOrAll(localFilters.status)}
                onValueChange={(v) => {
                  const normalized = v === "all" ? "" : v;
                  setLocalFilters((prev) => ({ ...prev, status: normalized }));
                  applyImmediate("status", v);
                }}
              >
                <SelectTrigger className="bg-card w-full">
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

              <Select
                value={selectValueOrAll(localFilters.priority)}
                onValueChange={(v) => {
                  const normalized = v === "all" ? "" : v;
                  setLocalFilters((prev) => ({
                    ...prev,
                    priority: normalized,
                  }));
                  applyImmediate("priority", v);
                }}
              >
                <SelectTrigger className="bg-card w-full">
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

              <div className="space-y-3">
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
                      if ((fromRef.current as any)?.showPicker)
                        (fromRef.current as any).showPicker();
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
                      if ((toRef.current as any)?.showPicker)
                        (toRef.current as any).showPicker();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                  />
                </div>
              </div>

              <Select
                value={viewMode}
                onValueChange={(v: any) => handleViewModeChange(v)}
              >
                <SelectTrigger className="bg-card w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagination">Pagination</SelectItem>
                  <SelectItem value="infinite">Infinite Scroll</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={handleClear}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden sm:flex flex-wrap gap-3 items-center mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            value={localFilters.search}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
            }
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
                if ((fromRef.current as any)?.showPicker)
                  (fromRef.current as any).showPicker();
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
                if ((toRef.current as any)?.showPicker)
                  (toRef.current as any).showPicker();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
            />
          </div>
        </div>
        <div>
          <Select
            value={viewMode}
            onValueChange={(v: any) => handleViewModeChange(v)}
          >
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
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            className="px-3"
          >
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
              <th
                className={`${thStickyClass} p-4 font-semibold w-10 text-center`}
              >
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
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
              tasks.map((task: any, index: number) => (
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
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(Number(task.id))}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        toggleSelectOne(Number(task.id), e.target.checked)
                      }
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
                    <button className="text-gray-500 hover:underline flex items-center gap-1">
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
                <td
                  colSpan={6}
                  className="p-6 text-center text-muted-foreground"
                >
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

      <TaskViewModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <button
        onClick={() => navigate("/tasks/new")}
        className={`${
          selectedIds.length !== 0 ? "hidden" : ""
        } bg-primary z-50 text-primary-foreground fixed bottom-6 right-6 px-4 py-4 md:py-3 rounded-full shadow-xl hover:bg-primary/80 transition flex align-center justify-center gap-x-1`}
      >
        <span className="flex justify-center items-center">
          <Plus className="h-4 w-4" />
        </span>
        <span className="hidden md:inline">New Task</span>
      </button>

      {/* Single Delete Dialog */}
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

      {/* Sticky Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-40">
          <div className="text-sm text-muted-foreground">
            {selectedIds.length} task
            {selectedIds.length > 1 ? "s" : ""} selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkEditOpen(true)}
            >
              Edit Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">
                {selectedIds.length} task
                {selectedIds.length > 1 ? "s" : ""}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkLoading}
              onClick={callBulkDelete}
            >
              {bulkLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit selected tasks</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              callBulkUpdate();
            }}
          >
            <p className="text-sm text-muted-foreground">
              Only the fields you set below will be updated for{" "}
              <span className="font-semibold">
                {selectedIds.length} selected task
                {selectedIds.length > 1 ? "s" : ""}
              </span>
              .
            </p>

            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <Select
                value={bulkEditData.status || "none"}
                onValueChange={(v) =>
                  setBulkEditData((prev) => ({
                    ...prev,
                    status: v === "none" ? "" : v,
                  }))
                }
              >
                <SelectTrigger className="bg-card w-full">
                  <SelectValue placeholder="Don't change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Don't change</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Priority
              </label>
              <Select
                value={bulkEditData.priority || "none"}
                onValueChange={(v) =>
                  setBulkEditData((prev) => ({
                    ...prev,
                    priority: v === "none" ? "" : v,
                  }))
                }
              >
                <SelectTrigger className="bg-card w-full">
                  <SelectValue placeholder="Don't change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Don't change</SelectItem>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={bulkEditData.dueDate}
                onChange={(e) =>
                  setBulkEditData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
                className="w-full border border-border p-3 rounded-md text-foreground pr-10
             [&::-webkit-calendar-picker-indicator]:opacity-0
             [&::-webkit-calendar-picker-indicator]:absolute
             [&::-webkit-calendar-picker-indicator]:right-0
             [&::-webkit-calendar-picker-indicator]:w-full
             [&::-webkit-calendar-picker-indicator]:h-full"
                ref={dateRef}
                min={new Date().toISOString().split("T")[0]}
              />
              <Calendar
                onClick={() => {
                  dateRef.current?.focus();
                  if ((dateRef.current as any)?.showPicker)
                    (dateRef.current as any).showPicker();
                }}
                className="absolute right-3 bottom-3 h-5 w-5 cursor-pointer text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to keep existing due dates.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={bulkLoading}
                onClick={() => {
                  setBulkEditOpen(false);
                  setBulkEditData({ status: "", priority: "", dueDate: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={bulkLoading}>
                {bulkLoading ? "Saving..." : "Apply Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
