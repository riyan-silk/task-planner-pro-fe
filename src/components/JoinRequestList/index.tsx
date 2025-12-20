// src/components/JoinRequestList.tsx
import { Button } from "../../components/ui/button";
import { Check, X } from "lucide-react";
import useTeams from "../../hooks/useTeams";
import type { JoinRequest } from "../../types";

interface Props {
  teamId: number;
  requests: JoinRequest[];
  onProcess: () => void;
}

const JoinRequestList = ({ teamId, requests, onProcess }: Props) => {
  const { acceptJoinRequest, rejectJoinRequest } = useTeams();

  const handleAccept = async (requestId: number) => {
    await acceptJoinRequest(requestId, teamId);
    onProcess();
  };

  const handleReject = async (requestId: number) => {
    await rejectJoinRequest(requestId, teamId);
    onProcess();
  };

  if (requests.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Join Requests (0)</h2>
        <div className="text-center text-muted-foreground p-8">
          No pending join requests.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Join Requests ({requests.length})
      </h2>
      <div className="space-y-4">
        {requests
          .filter((req) => req.status === "pending")
          .map((req) => (
            <div
              key={req.id}
              className="flex justify-between items-center p-4 border rounded-lg bg-card"
            >
              <div className="flex-1">
                <p className="font-medium">{req.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {req.user.email}
                </p>
                {req.message && (
                  <p className="text-sm mt-1 italic">"{req.message}"</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Requested on {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAccept(req.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(req.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default JoinRequestList;
