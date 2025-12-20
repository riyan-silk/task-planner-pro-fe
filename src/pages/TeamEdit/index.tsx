// // src/pages/TeamEdit.tsx (New: Create/Edit team form)
// import { useParams, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import useTeams from "../../hooks/useTeams";
// import TeamForm from "../../components/TeamForm";
// import Loader from "../../components/Loader";

// const TeamEdit = () => {
//   const { id } = useParams<{ id: string }>();
//   const isEdit = !!id;
//   const navigate = useNavigate();
//   const { getTeam, createTeam, updateTeam, fetchTeamById } = useTeams();
//   const [initialData, setInitialData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadTeam = async () => {
//       if (isEdit) {
//         const team = getTeam(Number(id));
//         if (team) {
//           setInitialData(team);
//         } else {
//           const fetched = await fetchTeamById(Number(id));
//           if (fetched) setInitialData(fetched);
//         }
//       }
//       setLoading(false);
//     };
//     loadTeam();
//   }, [id]);

//   const handleSubmit = async (data: any) => {
//     if (isEdit) await updateTeam(Number(id), data);
//     else await createTeam(data);
//     navigate("/teams");
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="min-h-screen bg-background py-12">
//       <div className="max-w-2xl mx-auto px-4">
//         <h1 className="text-3xl font-bold mb-8">
//           {isEdit ? "Edit Team" : "New Team"}
//         </h1>
//         <TeamForm initialData={initialData} onSubmit={handleSubmit} />
//       </div>
//     </div>
//   );
// };

// export default TeamEdit;

// src/pages/TeamEdit.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTeamStore } from "../../store/teamStore";
import TeamForm from "../../components/TeamForm";
import Loader from "../../components/Loader";

const TeamEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getTeam, createTeam, updateTeam, fetchTeamById } = useTeamStore();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      if (isEdit) {
        const team = getTeam(Number(id));
        if (team) {
          setInitialData(team);
        } else {
          const fetched = await fetchTeamById(Number(id));
          if (fetched) setInitialData(fetched);
        }
      }
      setLoading(false);
    };
    loadTeam();
  }, [id, isEdit, getTeam, fetchTeamById]);

  const handleSubmit = async (data: any) => {
    if (isEdit) await updateTeam(Number(id), data);
    else await createTeam(data);
    navigate("/teams");
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          {isEdit ? "Edit Team" : "New Team"}
        </h1>
        <TeamForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default TeamEdit;
