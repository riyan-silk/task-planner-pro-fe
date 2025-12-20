// // src/components/TeamForm.tsx (New: Form for team create/edit)
// import { useState, useEffect } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { Input } from "../ui/input";
// import { Textarea } from "../../components/ui/textarea";
// import { Button } from "../ui/button";
// import { Switch } from "../ui/switch";

// interface TeamFormProps {
//   initialData?: any;
//   onSubmit: (data: any) => void;
// }

// const TeamForm = ({ initialData, onSubmit }: TeamFormProps) => {
//   const [team, setTeam] = useState({
//     name: "",
//     description: "",
//     join_type: "approval",
//     is_public: false,
//   });

//   useEffect(() => {
//     if (initialData) setTeam(initialData);
//   }, [initialData]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(team);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <label>Name</label>
//         <Input
//           value={team.name}
//           onChange={(e) => setTeam({ ...team, name: e.target.value })}
//         />
//       </div>
//       <div>
//         <label>Description</label>
//         <Textarea
//           value={team.description}
//           onChange={(e: any) =>
//             setTeam({ ...team, description: e.target.value })
//           }
//         />
//       </div>
//       <div>
//         <label>Join Type</label>
//         <Select
//           value={team.join_type}
//           onValueChange={(v) => setTeam({ ...team, join_type: v })}
//         >
//           <SelectTrigger>
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="auto">Auto Join</SelectItem>
//             <SelectItem value="approval">Approval</SelectItem>
//             <SelectItem value="invite">Invite Only</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       <div className="flex items-center space-x-2">
//         <Switch
//           checked={team.is_public}
//           onCheckedChange={(checked) =>
//             setTeam({ ...team, is_public: checked })
//           }
//         />
//         <label>Public Team</label>
//       </div>
//       <Button type="submit">Save Team</Button>
//     </form>
//   );
// };

// export default TeamForm;

// src/components/TeamForm.tsx
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

interface TeamFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
}

const TeamForm = ({ initialData, onSubmit }: TeamFormProps) => {
  const [team, setTeam] = useState({
    name: "",
    description: "",
    join_type: "approval",
    is_public: false,
  });

  useEffect(() => {
    console.log("Initial data: ", initialData);
    if (initialData)
      setTeam({
        name: initialData.name || "",
        description: initialData.description || "",
        join_type: initialData.join_type || "approval",
        is_public: initialData.public || false,
      });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(team);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <Input
          value={team.name}
          onChange={(e) => setTeam({ ...team, name: e.target.value })}
          placeholder="Enter team name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={team.description}
          onChange={(e) => setTeam({ ...team, description: e.target.value })}
          placeholder="Enter team description"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Join Type</label>
        <Select
          value={team.join_type}
          onValueChange={(v) => setTeam({ ...team, join_type: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select join type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto Join</SelectItem>
            <SelectItem value="approval">Approval Required</SelectItem>
            <SelectItem value="invite">Invite Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={team.is_public}
          onCheckedChange={(checked) =>
            setTeam({ ...team, is_public: checked })
          }
        />
        <label className="text-sm font-medium">Public Team</label>
      </div>
      <Button type="submit" className="w-full">
        Save Team
      </Button>
    </form>
  );
};

export default TeamForm;
