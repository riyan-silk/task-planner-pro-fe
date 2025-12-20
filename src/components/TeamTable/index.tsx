// src/components/TeamTable.tsx
import { useState } from "react";
import type { Team } from "../../types";
import { Button } from "../../components/ui/button";
import { Pencil, Trash2, Users } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useTeams from "../../hooks/useTeams";
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
import { Checkbox } from "../../components/ui/checkbox";

interface Props {
  teams: Team[];
  loading: boolean;
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
}

const TeamTable = ({ teams, loading, selectedIds, setSelectedIds }: Props) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const { deleteTeam } = useTeams();

  const handleSort = (field: string) => {
    const currentSortBy = searchParams.get("sortBy");
    const currentOrder = searchParams.get("sortOrder") || "desc";
    let newSortBy = field;
    let newOrder = "desc";
    if (currentSortBy === field) {
      newOrder = currentOrder === "desc" ? "asc" : "desc";
    }
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("sortBy", newSortBy);
    newParams.set("sortOrder", newOrder);
    newParams.set("offset", "0");
    setSearchParams(newParams, { replace: true });
  };

  const getSortIcon = (field: string) => {
    const sortBy = searchParams.get("sortBy");
    const order = searchParams.get("sortOrder");
    if (sortBy !== field) {
      return (
        <span className="ml-1 inline-block w-3 text-muted-foreground opacity-60">
          ↕
        </span>
      );
    }
    return order === "asc" ? (
      <span className="ml-1">▲</span>
    ) : (
      <span className="ml-1">▼</span>
    );
  };

  const allSelectedOnPage =
    teams.length > 0 && teams.every((t) => selectedIds.includes(Number(t.id)));
  const toggleSelectAllOnPage = (checked: boolean) => {
    if (!checked) {
      const newIds = selectedIds.filter(
        (id) => !teams.some((t) => Number(t.id) === id)
      );
      setSelectedIds(newIds);
    } else {
      const pageIds = teams.map((t) => Number(t.id));
      const newIds = Array.from(new Set([...selectedIds, ...pageIds]));
      setSelectedIds(newIds);
    }
  };
  const toggleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      if (selectedIds.includes(id)) return;
      const newIds = [...selectedIds, id];
      setSelectedIds(newIds);
    } else {
      const newIds = selectedIds.filter((x: number) => x !== id);
      setSelectedIds(newIds);
    }
  };

  if (loading && teams.length === 0)
    return <div className="p-8 text-center">Loading teams...</div>;

  return (
    <div className="overflow-x-auto rounded-xl shadow border border-border bg-card">
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="p-4 font-semibold w-10 text-center sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-sm">
              <Checkbox
                checked={allSelectedOnPage || false}
                onCheckedChange={(checked) => toggleSelectAllOnPage(!!checked)}
                className="w-3 h-3 md:w-4 md:h-4"
              />
            </th>
            <th
              className="p-4 font-semibold cursor-pointer sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-sm"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center">
                Name {getSortIcon("name")}
              </div>
            </th>
            <th
              className="p-4 font-semibold cursor-pointer sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-sm"
              onClick={() => handleSort("join_type")}
            >
              <div className="flex items-center">
                Join Type {getSortIcon("join_type")}
              </div>
            </th>
            <th
              className="p-4 font-semibold cursor-pointer sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-sm"
              onClick={() => handleSort("is_public")}
            >
              <div className="flex items-center">
                Visibility {getSortIcon("is_public")}
              </div>
            </th>
            <th className="p-4 font-semibold text-right sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-sm">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {teams.length > 0 ? (
            teams.map((team) => (
              <tr
                key={team.id}
                className="border-b border-border hover:bg-muted/50 transition"
              >
                <td className="p-4 text-center">
                  <Checkbox
                    checked={selectedIds.includes(Number(team.id))}
                    onCheckedChange={(checked) => {
                      toggleSelectOne(Number(team.id), !!checked);
                    }}
                    className="w-3 h-3 md:w-4 md:h-4"
                  />
                </td>
                <td className="p-4">{team.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-muted">
                    {team.join_type}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      team.is_public
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                  >
                    {team.is_public ? "Public" : "Private"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/teams/${team.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/teams/${team.id}/members`)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setTeamToDelete(team)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-6 text-center text-muted-foreground">
                No teams found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <AlertDialog
        open={!!teamToDelete}
        onOpenChange={() => setTeamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              team:
              <br />
              <span className="font-semibold text-foreground">
                {teamToDelete?.name}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (teamToDelete) deleteTeam(teamToDelete.id);
                setTeamToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamTable;
