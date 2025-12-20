// src/pages/TeamList.tsx (New: List of teams)
import { useNavigate } from "react-router-dom";
import TeamSection from "../../components/TeamSection";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";

const TeamList = () => {
  const navigate = useNavigate();

  return (
    <div className="px-2 md:px-6 max-w-7xl mx-auto pb-16">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Button onClick={() => navigate("/teams/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </Button>
      </div>
      <TeamSection />
    </div>
  );
};

export default TeamList;
