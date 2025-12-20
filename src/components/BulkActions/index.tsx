// src/components/BulkActions.tsx
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { CalendarIcon } from "lucide-react";
import useTasks from "../../hooks/useTasks";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../utils/constants";
import useAuth from "../../hooks/useAuth";
import { useRef } from "react";

interface Props {
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
}

const BulkActions = ({ selectedIds, setSelectedIds }: Props) => {
  const { bulkUpdateTasks, bulkDeleteTasks } = useTasks();
  const { user } = useAuth();
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    status: "",
    priority: "",
    dueDate: "",
  });
  const [bulkLoading, setBulkLoading] = useState(false);
  const dateRef = useRef<HTMLInputElement | null>(null);

  const callBulkDelete = async () => {
    if (!selectedIds.length || !user) return;
    try {
      setBulkLoading(true);
      await bulkDeleteTasks(selectedIds);
      setBulkDeleteOpen(false);
      setSelectedIds([]);
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
    } catch (e) {
      console.error("Bulk update error", e);
    } finally {
      setBulkLoading(false);
    }
  };

  if (selectedIds.length <= 1) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-40">
        <div className="text-sm text-muted-foreground">
          {selectedIds.length} task{selectedIds.length > 1 ? "s" : ""} selected
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
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">
                {selectedIds.length} task{selectedIds.length > 1 ? "s" : ""}
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
                className="w-full border border-border p-3 rounded-md text-foreground pr-10 bg-background
             [&::-webkit-calendar-picker-indicator]:opacity-0
             [&::-webkit-calendar-picker-indicator]:absolute
             [&::-webkit-calendar-picker-indicator]:right-0
             [&::-webkit-calendar-picker-indicator]:w-full
             [&::-webkit-calendar-picker-indicator]:h-full"
                ref={dateRef}
                min={new Date().toISOString().split("T")[0]}
              />
              <CalendarIcon
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
    </>
  );
};

export default BulkActions;
