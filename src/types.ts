// src/types.ts
export interface Task {
  id: number;
  userId: number;
  assigneeId?: number;
  assignerId?: number;
  teamId?: number;
  visibility: "private" | "team";
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
  tags?: number[] | never[];
  // Add tags, comments count, etc. if fetched
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  team_code: string;
  join_type: "auto" | "approval" | "invite";
  is_public: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  membersCount?: number;
}

export interface Member {
  id: number;
  userId: number;
  role: "admin" | "member";
  is_active: boolean;
  joinedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface JoinRequest {
  id: number;
  userId: number;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  processedBy?: number;
  processedAt?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}
