// src/components/Form/index.tsx
import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import type { Task } from "../../types";
import { Calendar, X, Tag, Clock, User, Users, Eye, Hash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Button } from "../../components/ui/button";
import { Calendar as CalendarComponent } from "../../components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import useTeams from "../../hooks/useTeams";
import useUsers from "../../hooks/useUsers"; // Assume hook for users/assignees
import useTaskTags from "../../hooks/useTags"; // Assume hook for tags
interface Props {
  initialData?: Partial<Task> | null;
  onSubmit: (task: any) => void;
  isEdit?: boolean;
}
const TaskForm = ({ initialData, onSubmit, isEdit = false }: Props) => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    priority: "low" as "low" | "medium" | "high",
    status: "todo" as "todo" | "in-progress" | "done",
    dueDate: undefined as Date | undefined,
    dueTime: "",
    teamId: "",
    assigneeId: "",
    visibility: "private" as "private" | "team",
    tags: [] as number[],
  });
  const { teams } = useTeams();
  const { users } = useUsers();
  const { tags, attachTag } = useTaskTags(); // Assume fetches available tags
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    dueDate: "",
    teamId: "",
    assigneeId: "",
    visibility: "",
  });
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  useEffect(() => {
    if (initialData) {
      setTask({
        title: initialData.title || "",
        description: initialData.description || "",
        priority: initialData.priority || "medium",
        status: initialData.status || "todo",
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate)
          : undefined,
        dueTime: initialData.dueTime ? initialData.dueTime.substring(0, 5) : "",
        teamId: initialData.teamId?.toString() || "",
        assigneeId: initialData.assigneeId?.toString() || "",
        visibility: initialData.visibility || "private",
        tags: initialData.tags || [],
      });
      setSelectedTags(initialData.tags || []);
    }
  }, [initialData]);
  const validateForm = () => {
    const newErrors: any = {};
    if (!task.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (task.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (task.title.trim().length > 255) {
      newErrors.title = "Title cannot exceed 255 characters.";
    }
    if (task.description && task.description.length > 5000) {
      newErrors.description = "Description cannot exceed 5000 characters.";
    }
    if (task.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (task.dueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past.";
      }
    }
    if (task.visibility === "team" && !task.teamId) {
      newErrors.teamId = "Team selection is required for team visibility.";
    }
    if (task.teamId && !teams.find((t) => t.id.toString() === task.teamId)) {
      newErrors.teamId = "Invalid team selected.";
    }
    if (
      task.assigneeId &&
      !users.find((u: any) => u.id.toString() === task.assigneeId)
    ) {
      newErrors.assigneeId = "Invalid assignee selected.";
    }
    if (!["private", "team"].includes(task.visibility)) {
      newErrors.visibility = "Invalid visibility.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const submitData = {
      ...task,
      dueDate: task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : null,
      tags: selectedTags,
    };
    if (isEdit && initialData?.id) {
      // Attach new tags if any
      const newTags = selectedTags.filter((id) => !task.tags?.includes(id));
      for (const tagId of newTags) {
        await attachTag(initialData.id, tagId);
      }
    }
    onSubmit(submitData);
  };
  const addTag = (tagId: number) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId));
  };
  const showTeam = task.visibility === "team";
  const showAssignee = showTeam && !!task.teamId;
  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-4">
      {/* Title Section */}
      <div className="space-y-2">
        <Label
          htmlFor="title"
          className="text-sm font-semibold flex items-center gap-2"
        >
          <Hash className="h-4 w-4" />
          Title *
        </Label>
        <Input
          id="title"
          type="text"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          className={cn(
            "w-full text-lg border-2 focus:border-primary",
            errors.title && "border-destructive"
          )}
          placeholder="Enter a descriptive task title"
        />
        {errors.title && (
          <p className="text-destructive text-sm">{errors.title}</p>
        )}
      </div>
      {/* Description Section */}
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-semibold flex items-center gap-2"
        >
          <Hash className="h-4 w-4" />
          Description
        </Label>
        <div className="border-2 border-border rounded-lg overflow-hidden focus-within:border-primary">
          <MDEditor
            id="description"
            value={task.description}
            onChange={(val) => setTask({ ...task, description: val || "" })}
            preview="edit"
            height={300}
            visibleDragbar={false}
            className="rounded-lg"
          />
        </div>
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description}</p>
        )}
      </div>
      {/* Task Details Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full" />
          <h3 className="text-lg font-semibold">Task Details</h3>
        </div>
        <div className="flex flex-wrap gap-6">
          {/* Priority */}
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Priority
            </Label>
            <Select
              value={task.priority}
              onValueChange={(value) =>
                setTask({
                  ...task,
                  priority: value as "low" | "medium" | "high",
                })
              }
            >
              <SelectTrigger className="w-full border-2 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Status */}
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Status
            </Label>
            <Select
              value={task.status}
              onValueChange={(value) =>
                setTask({
                  ...task,
                  status: value as "todo" | "in-progress" | "done",
                })
              }
            >
              <SelectTrigger className="w-full border-2 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Visibility */}
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visibility
            </Label>
            <Select
              value={task.visibility}
              onValueChange={(v) => {
                setTask((prev) => ({
                  ...prev,
                  visibility: v as "private" | "team",
                  ...(v === "private" ? { teamId: "", assigneeId: "" } : {}),
                }));
              }}
            >
              <SelectTrigger className="w-full border-2 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
            {errors.visibility && (
              <p className="text-destructive text-sm">{errors.visibility}</p>
            )}
          </div>
          {/* Team - Conditional */}
          {showTeam && (
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team (Required)
              </Label>
              <Select
                value={task.teamId}
                onValueChange={(v) => {
                  setTask((prev) => ({
                    ...prev,
                    teamId: v,
                    ...(v === "" ? { assigneeId: "" } : {}),
                  }));
                }}
              >
                <SelectTrigger className="w-full border-2 focus:border-primary">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teamId && (
                <p className="text-destructive text-sm">{errors.teamId}</p>
              )}
            </div>
          )}
          {/* Assignee - Conditional */}
          {showAssignee && (
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Assignee (Optional)
              </Label>
              <Select
                value={task.assigneeId}
                onValueChange={(v) => setTask({ ...task, assigneeId: v })}
              >
                <SelectTrigger className="w-full border-2 focus:border-primary">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assigneeId && (
                <p className="text-destructive text-sm">{errors.assigneeId}</p>
              )}
            </div>
          )}
        </div>
        {/* Due Date and Time */}
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start border-2 focus:border-primary",
                    !task.dueDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {task.dueDate ? (
                    format(task.dueDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={task.dueDate}
                  onSelect={(date) => setTask({ ...task, dueDate: date })}
                  initialFocus
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && (
              <p className="text-destructive text-sm">{errors.dueDate}</p>
            )}
          </div>
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Due Time
            </Label>
            <Input
              type="time"
              value={task.dueTime}
              onChange={(e) => setTask({ ...task, dueTime: e.target.value })}
              className="w-full border-2 focus:border-primary"
            />
          </div>
        </div>
      </div>
      {/* Tags Section */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags
        </Label>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagId) => {
              const tag = tags.find((t: any) => t.id === tagId);
              return (
                <div
                  key={tagId}
                  className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm"
                >
                  {tag?.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tagId)}
                    className="h-4 w-4 ml-2 p-0 hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Select onValueChange={(v) => addTag(Number(v))}>
            <SelectTrigger className="w-full border-2 focus:border-primary">
              <SelectValue placeholder="Add a tag..." />
            </SelectTrigger>
            <SelectContent>
              {tags
                .filter((t: any) => !selectedTags.includes(t.id))
                .map((tag: any) => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    {tag.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
      >
        {isEdit ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
};
export default TaskForm;
