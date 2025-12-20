// src/components/TaskSection.tsx
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useTasks from "../../hooks/useTasks";
import useAuth from "../../hooks/useAuth";
import StatsCards from "../StatsCards";
import TaskFilters from "../TaskFilters";
import TaskTable from "../TaskTable";
import BulkActions from "../BulkActions";
import Pagination from "../Pagination";
import { Loader2 } from "lucide-react";

const TaskSection = () => {
  const [searchParams] = useSearchParams();
  const viewMode =
    (searchParams.get("view") as "pagination" | "infinite") || "pagination";

  const { tasks, stats, total, loading, fetchTasks } = useTasks();
  const { user } = useAuth();

  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastTaskRef = useRef<HTMLTableRowElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const offsetVal = Number(searchParams.get("offset")) || 0;
  const pageSize =
    viewMode === "infinite" ? 15 : Number(searchParams.get("limit")) || 10;
  const currentPage = Math.floor(offsetVal / pageSize) + 1;
  const totalPages = Math.max(
    1,
    Math.ceil((stats?.total || total || 0) / pageSize)
  );

  const fetchWithSpinner = async (filters: any) => {
    try {
      setIsFetching(true);
      await fetchTasks(filters);
    } finally {
      setIsFetching(false);
    }
  };

  // FIX: Use searchParams.toString() to prevent infinite re-renders
  const queryString = searchParams.toString();

  useEffect(() => {
    const filters = {
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      search: searchParams.get("search") || undefined,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
      limit: pageSize,
      offset: offsetVal,
      append: viewMode === "infinite" && offsetVal > 0 ? "true" : undefined,
    };

    fetchWithSpinner(filters);
    setSelectedIds([]); // Clear selection when filters change
  }, [
    queryString, // ← Only changes when actual query params change
    viewMode,
    pageSize,
    offsetVal,
    fetchTasks,
  ]);

  // Infinite scroll effect
  useEffect(() => {
    if (viewMode !== "infinite") {
      observer.current?.disconnect();
      return;
    }

    const totalCount = stats?.total ?? total ?? 0;
    if (tasks.length === 0 || tasks.length >= totalCount) {
      observer.current?.disconnect();
      return;
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isFetching) {
          const newOffset = tasks.length;
          if (newOffset > offsetVal) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("offset", String(newOffset));
            window.history.replaceState(null, "", `?${newParams.toString()}`);
          }
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    if (lastTaskRef.current) {
      observer.current.observe(lastTaskRef.current);
    }

    return () => observer.current?.disconnect();
  }, [
    viewMode,
    tasks.length,
    loading,
    isFetching,
    total,
    stats?.total,
    offsetVal,
    searchParams,
  ]);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {user && (
        <span className="block sm:hidden text-muted-foreground pt-2 pl-2">
          Welcome, <span className="font-medium">{user.name}</span>
        </span>
      )}

      <StatsCards stats={stats} />
      <TaskFilters />

      <TaskTable
        tasks={tasks}
        loading={loading}
        viewMode={viewMode}
        lastTaskRef={lastTaskRef}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />

      <BulkActions selectedIds={selectedIds} setSelectedIds={setSelectedIds} />

      {viewMode === "pagination" && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("offset", String((newPage - 1) * pageSize));
              window.history.replaceState(null, "", `?${newParams.toString()}`);
            }}
          />
        </div>
      )}

      {viewMode === "infinite" && loading && tasks.length > 0 && (
        <div className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default TaskSection;
