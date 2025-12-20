// src/components/TaskSubSections.tsx (New: Tabs for comments, attachments, tags)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";

interface Props {
  taskId: number;
}

const TaskSubSections = ({ taskId }: Props) => {
  const [activeTab, setActiveTab] = useState("comments");

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="comments">
          {/* Embed TaskComments component or fetch here */}
        </TabsContent>
        <TabsContent value="attachments">
          {/* Embed TaskAttachments */}
        </TabsContent>
        <TabsContent value="tags">{/* Embed TaskTags */}</TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskSubSections;
