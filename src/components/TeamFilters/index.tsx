// src/components/TeamFilters.tsx
import { useState, useEffect, useRef } from "react";
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
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { JOIN_TYPE_OPTIONS } from "../../utils/constants";

const TeamFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get("search") || "",
    join_type: searchParams.get("join_type") || "",
    is_public: searchParams.get("is_public") || "",
  });

  const searchDebounceRef = useRef<number | null>(null);

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
      join_type: "",
      is_public: "",
    });
    setParams((p) => {
      p.delete("search");
      p.delete("join_type");
      p.delete("is_public");
      p.set("offset", "0");
      return p;
    });
  };

  const selectValueOrAll = (v?: string) => (v && v !== "" ? v : "all");

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
                placeholder="Search teams..."
                className="bg-card border-border"
              />
              <Select
                value={selectValueOrAll(localFilters.join_type)}
                onValueChange={(v) => {
                  const normalized = v === "all" ? "" : v;
                  setLocalFilters((prev) => ({
                    ...prev,
                    join_type: normalized,
                  }));
                  applyImmediate("join_type", v);
                }}
              >
                <SelectTrigger className="bg-card w-full">
                  <SelectValue placeholder="All Join Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Join Types</SelectItem>
                  {JOIN_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={localFilters.is_public || "all"}
                onValueChange={(v) => {
                  const normalized = v === "all" ? "" : v;
                  setLocalFilters((prev) => ({
                    ...prev,
                    is_public: normalized,
                  }));
                  applyImmediate("is_public", v);
                }}
              >
                <SelectTrigger className="bg-card w-full">
                  <SelectValue placeholder="All Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="true">Public</SelectItem>
                  <SelectItem value="false">Private</SelectItem>
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
            placeholder="Search teams..."
            className="bg-card border-border"
          />
        </div>
        <div>
          <Select
            value={selectValueOrAll(localFilters.join_type)}
            onValueChange={(v) => {
              const normalized = v === "all" ? "" : v;
              setLocalFilters((prev) => ({ ...prev, join_type: normalized }));
              applyImmediate("join_type", v);
            }}
          >
            <SelectTrigger className="bg-card min-w-[160px]">
              <SelectValue placeholder="All Join Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Join Types</SelectItem>
              {JOIN_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={localFilters.is_public || "all"}
            onValueChange={(v) => {
              const normalized = v === "all" ? "" : v;
              setLocalFilters((prev) => ({ ...prev, is_public: normalized }));
              applyImmediate("is_public", v);
            }}
          >
            <SelectTrigger className="bg-card min-w-[160px]">
              <SelectValue placeholder="All Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              <SelectItem value="true">Public</SelectItem>
              <SelectItem value="false">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

export default TeamFilters;
