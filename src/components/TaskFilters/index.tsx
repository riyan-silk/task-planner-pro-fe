// src/components/TaskFilters.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { CalendarIcon, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../utils/constants";
import type { DateRange } from "react-day-picker";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";

const TaskFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
  });
  const [viewMode, setViewMode] = useState<"pagination" | "infinite">(
    (searchParams.get("view") as any) || "pagination"
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const searchDebounceRef = useRef<number | null>(null);
  const queryString = useMemo(() => searchParams.toString(), [searchParams]);

  const selectValueOrAll = (v?: string) => (v && v !== "" ? v : "all");

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

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setParams((p) => {
      if (range?.from) {
        p.set("fromDate", format(range.from, "yyyy-MM-dd"));
      } else {
        p.delete("fromDate");
      }
      if (range?.to) {
        p.set("toDate", format(range.to, "yyyy-MM-dd"));
      } else {
        p.delete("toDate");
      }
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

  // Sync dateRange with URL params
  useEffect(() => {
    const fromStr = searchParams.get("fromDate");
    const toStr = searchParams.get("toDate");
    let newRange: DateRange | undefined;
    if (fromStr && toStr) {
      newRange = {
        from: new Date(fromStr),
        to: new Date(toStr),
      };
    } else if (fromStr) {
      newRange = { from: new Date(fromStr) };
    } else if (toStr) {
      newRange = { to: new Date(toStr) };
    } else {
      newRange = undefined;
    }
    setDateRange(newRange);
  }, [queryString]);

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
    });
    setDateRange(undefined);
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

  const filters = useMemo(
    () => ({
      limit:
        viewMode === "infinite" ? 15 : Number(searchParams.get("limit")) || 10,
      offset: Number(searchParams.get("offset")) || 0,
    }),
    [searchParams.toString(), viewMode]
  );

  return (
    <>
      <div className="hidden sm:flex items-center gap-2 mb-2 text-primary font-semibold">
        <Filter className="w-5 h-5" />
        <span>Filters</span>
      </div>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
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
              setLocalFilters((prev) => ({
                ...prev,
                priority: normalized,
              }));
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-max">
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
    </>
  );
};

export default TaskFilters;
