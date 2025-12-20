// src/pages/TaskComments.tsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useTaskComments from "../../hooks/useComments";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Send } from "lucide-react";

const TaskComments = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const taskIdNum = Number(taskId);
  const { comments, createComment, fetchComments } = useTaskComments();
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (taskIdNum) {
      fetchComments(taskIdNum);
    }
  }, [taskIdNum, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await createComment(taskIdNum, newComment);
    setNewComment("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Comments</h1>
      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1"
        />
        <Button type="submit" disabled={!newComment.trim()}>
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </form>
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold">
                  {comment.userName || "Anonymous"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
              <p>{comment.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskComments;
