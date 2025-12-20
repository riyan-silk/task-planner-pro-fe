// src/components/MemberList.tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Trash2 } from "lucide-react";
import useTeams from "../../hooks/useTeams";
import type { Member } from "../../types";

interface Props {
  members: Member[];
  teamId: number;
  onUpdate: () => void;
}

const MemberList = ({ members, teamId, onUpdate }: Props) => {
  const { updateMemberRole, removeMember } = useTeams();

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Members ({members.length})</h2>
      <div className="overflow-x-auto rounded-xl shadow border border-border bg-card">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b border-border hover:bg-muted/50"
              >
                <td className="p-4">{member.user.name}</td>
                <td className="p-4">{member.user.email}</td>
                <td className="p-4">
                  <Select
                    value={member.role}
                    onValueChange={(role) => {
                      updateMemberRole(
                        teamId,
                        member.userId,
                        role as "admin" | "member"
                      ).then(onUpdate);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      removeMember(teamId, member.userId).then(onUpdate)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {members.length === 0 && (
        <div className="text-center text-muted-foreground p-8">
          No members yet. Add some!
        </div>
      )}
    </div>
  );
};

export default MemberList;
