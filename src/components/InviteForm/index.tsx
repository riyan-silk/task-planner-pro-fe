// src/components/InviteForm.tsx (New: Form to send invites)
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import useTeams from "../../hooks/useTeams";

interface Props {
  teamId: number;
  onInviteSent: () => void;
}

const InviteForm = ({ teamId, onInviteSent }: Props) => {
  const [email, setEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(0);
  const { sendInvite } = useTeams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInvite(teamId, email, expiresInDays);
    onInviteSent();
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Expires in days"
        value={expiresInDays}
        onChange={(e) => setExpiresInDays(Number(e.target.value))}
      />
      <Button type="submit">Send Invite</Button>
    </form>
  );
};

export default InviteForm;
