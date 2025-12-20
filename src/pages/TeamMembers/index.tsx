// src/pages/TeamMembers.tsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useTeams from "../../hooks/useTeams";
import MemberList from "../../components/MemberList";
import InviteForm from "../../components/InviteForm";
import JoinRequestList from "../../components/JoinRequestList";
import type { JoinRequest, Member } from "@/types";

const TeamMembers = () => {
  const { id } = useParams<{ id: string }>();
  const teamId = Number(id);
  const { fetchMembers, fetchJoinRequests } = useTeams();
  const [members, setMembers] = useState<Member[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

  useEffect(() => {
    fetchMembers(teamId).then(setMembers);
    fetchJoinRequests(teamId).then(setJoinRequests);
  }, [teamId, fetchMembers, fetchJoinRequests]);

  const refreshMembers = () => fetchMembers(teamId).then(setMembers);
  const refreshRequests = () => fetchJoinRequests(teamId).then(setJoinRequests);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 hover:underline"
        >
          Back to Team
        </button>
      </div>
      <InviteForm teamId={teamId} onInviteSent={refreshMembers} />
      <MemberList members={members} teamId={teamId} onUpdate={refreshMembers} />
      <JoinRequestList
        teamId={teamId}
        requests={joinRequests}
        onProcess={refreshRequests}
      />
    </div>
  );
};

export default TeamMembers;
