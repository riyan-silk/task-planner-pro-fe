// src/components/StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  BadgeCheck,
  Clock,
  Users,
  Globe,
  CircleCheck,
  TrendingUp,
} from "lucide-react";

interface Stats {
  total?: number;
  completed?: number;
  pending?: number;
  active?: number;
  public?: number;
  members?: number;
}

interface Props {
  stats?: Stats;
  isTeam?: boolean; // Optional flag to know if it's for teams or tasks
}

const StatsCards = ({ stats = {}, isTeam = false }: Props) => {
  // Default to 0 if undefined
  const total = stats.total ?? 0;
  const completed = stats.completed ?? 0;
  const pending = stats.pending ?? 0;
  const active = stats.active ?? 0;
  const publicCount = stats.public ?? 0;

  // For tasks
  if (!isTeam) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Tasks */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All tasks in view
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CircleCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Done and closed
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todo or In-progress
            </p>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall progress
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For teams
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Teams */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Teams
          </CardTitle>
          <Users className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">All your teams</p>
        </CardContent>
      </Card>

      {/* Active Teams */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Teams
          </CardTitle>
          <BadgeCheck className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{active}</div>
          <p className="text-xs text-muted-foreground mt-1">Currently active</p>
        </CardContent>
      </Card>

      {/* Public Teams */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Public Teams
          </CardTitle>
          <Globe className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{publicCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Visible to everyone
          </p>
        </CardContent>
      </Card>

      {/* Private Teams */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Private Teams
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-gray-600"
          >
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-600">
            {total - publicCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Restricted access
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
