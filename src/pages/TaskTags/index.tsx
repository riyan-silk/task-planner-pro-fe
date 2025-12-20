// src/pages/TaskTags.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useTaskTags from "../../hooks/useTags";
import { Button } from "../../components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const TaskTags = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const taskIdNum = Number(taskId);
  const { tags, availableTags, attachTag, detachTag, fetchTaskTags } =
    useTaskTags();
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    if (taskIdNum) {
      fetchTaskTags(taskIdNum);
    }
  }, [taskIdNum, fetchTaskTags]);

  const handleAttach = () => {
    if (selectedTag) {
      attachTag(taskIdNum, Number(selectedTag));
      setSelectedTag("");
    }
  };

  const handleDetach = (tagId: number) => {
    detachTag(taskIdNum, tagId);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Task Tags</h1>
      <div className="mb-8">
        <div className="flex gap-3">
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select tag to add" />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id.toString()}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAttach} disabled={!selectedTag}>
            Add Tag
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Attached Tags ({tags.length})</h2>
        {tags.length === 0 ? (
          <p className="text-muted-foreground">No tags attached yet.</p>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex justify-between items-center p-4 border rounded-lg bg-card"
            >
              <span className="font-medium">{tag.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDetach(tag.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskTags;
