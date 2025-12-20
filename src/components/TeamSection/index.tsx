// src/components/TeamSection.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useTeams from "../../hooks/useTeams";
import TeamTable from "../TeamTable";
import TeamFilters from "../TeamFilters";
import { Loader2 } from "lucide-react";

const TeamSection = () => {
  const { teams, loading, fetchTeams } = useTeams();
  const [searchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const queryString = searchParams.toString();

  useEffect(() => {
    const filters = {
      search: searchParams.get("search") || undefined,
      join_type: searchParams.get("join_type") || undefined,
      is_public: searchParams.get("is_public") === "true" ? true : false,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
      limit: Number(searchParams.get("limit")) || 10,
      offset: Number(searchParams.get("offset")) || 0,
    };
    fetchTeams(filters);
    setSelectedIds([]);
  }, [queryString, fetchTeams]);

  if (loading && teams.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <TeamFilters />
      <TeamTable
        teams={teams}
        loading={loading}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
    </div>
  );
};

export default TeamSection;
