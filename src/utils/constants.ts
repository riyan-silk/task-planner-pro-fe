export const TASK_SCHEMA = {
  type: "object",
  required: ["title"],
  properties: {
    title: { type: "string", title: "Title", minLength: 3 },
    description: { type: "string", title: "Description" },
    priority: {
      type: "string",
      title: "Priority",
      enum: ["low", "medium", "high"],
    },
    status: {
      type: "string",
      title: "Status",
      enum: ["todo", "in-progress", "done"],
    },
    dueDate: { type: "string", title: "Due Date", format: "date" },
  },
};

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export const WEB_PUSH = {
  public_key:
    "BArkN-TwEf7ur5hSdkYNt9MbUy85l42jy2E9Xmd-XGjw1NpWfgtvfaooOD49vSyKtBEnTsv0-O5VJ9-ntXCCM6w",
};
