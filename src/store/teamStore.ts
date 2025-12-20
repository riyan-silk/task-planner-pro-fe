// src/store/teamStore.ts
import { create } from "zustand";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

interface Team {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  team_code: string;
  join_type: "auto" | "approval" | "invite";
  is_public: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  membersCount?: number;
}

interface Member {
  id: number;
  userId: number;
  role: "admin" | "member";
  is_active: boolean;
  joinedAt: string;
  user: { id: number; name: string; email: string };
}

interface Invite {
  id: number;
  invite_code: string;
  email?: string;
  invitedBy: number;
  expiresAt: string;
  acceptedBy?: number;
  acceptedAt?: string;
}

interface JoinRequest {
  id: number;
  userId: number;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  processedBy?: number;
  processedAt?: string;
  user: { id: number; name: string; email: string };
}

interface TeamState {
  teams: Team[];
  members: Member[];
  invites: Invite[];
  joinRequests: JoinRequest[];
  loading: boolean;
  fetchTeams: (filters?: {
    search?: string;
    join_type?: string;
    is_public?: boolean;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  fetchPublicTeams: (filters?: {
    search?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  createTeam: (
    teamData: Omit<Team, "id" | "createdAt" | "updatedAt" | "team_code">
  ) => Promise<Team | null>;
  updateTeam: (
    id: number,
    updates: Partial<Omit<Team, "id" | "createdAt" | "updatedAt" | "team_code">>
  ) => Promise<Team | null>;
  deleteTeam: (id: number) => Promise<void>;
  getTeam: (id: number) => Team | undefined;
  fetchTeamById: (id: number) => Promise<Team | null>;
  fetchMembers: (teamId: number) => Promise<Member[]>;
  addMember: (
    teamId: number,
    userId: number,
    role?: "admin" | "member"
  ) => Promise<boolean>;
  updateMemberRole: (
    teamId: number,
    userId: number,
    role: "admin" | "member"
  ) => Promise<boolean>;
  removeMember: (teamId: number, userId: number) => Promise<boolean>;
  fetchInvites: (teamId: number) => Promise<Invite[]>;
  sendInvite: (
    teamId: number,
    email: string,
    expiresInDays?: number
  ) => Promise<Invite | null>;
  acceptInvite: (code: string) => Promise<boolean>;
  revokeInvite: (code: string) => Promise<boolean>;
  fetchJoinRequests: (teamId: number) => Promise<JoinRequest[]>;
  requestJoin: (
    teamId: number,
    message?: string
  ) => Promise<JoinRequest | null>;
  acceptJoinRequest: (requestId: number, teamId: number) => Promise<boolean>;
  rejectJoinRequest: (requestId: number, teamId: number) => Promise<boolean>;
  joinTeam: (teamId: number) => Promise<boolean>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  members: [],
  invites: [],
  joinRequests: [],
  loading: false,
  fetchTeams: async (filters = {}) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const paramsObj = {
        ...filters,
        is_public: filters.is_public ? "1" : "",
      };
      const params = new URLSearchParams(
        Object.entries(paramsObj).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      );
      const res = await api.get(`/teams?${params.toString()}`);
      set({ teams: res.data.data.teams.rows || [] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch teams");
    } finally {
      set({ loading: false });
    }
  },
  fetchPublicTeams: async (filters = {}) => {
    set({ loading: true });
    try {
      const paramsObj = { ...filters };
      const params = new URLSearchParams(
        Object.entries(paramsObj).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      );
      const res = await api.get(`/teams/public?${params.toString()}`);
      set({ teams: res.data.data.teams || [] });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch public teams"
      );
    } finally {
      set({ loading: false });
    }
  },
  createTeam: async (teamData) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post("/teams/create", teamData);
      const newTeam = res.data.data.team;
      set((state) => ({ teams: [...state.teams, newTeam] }));
      toast.success("Team created!");
      return newTeam;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create team");
      return null;
    } finally {
      set({ loading: false });
    }
  },
  updateTeam: async (id, updates) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.put(`/teams/edit/${id}`, updates);
      const updatedTeam = res.data.data.team;
      set((state) => ({
        teams: state.teams.map((t) => (t.id === id ? updatedTeam : t)),
      }));
      toast.success("Team updated!");
      return updatedTeam;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update team");
      return null;
    } finally {
      set({ loading: false });
    }
  },
  deleteTeam: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.delete(`/teams/delete/${id}`);
      set((state) => ({ teams: state.teams.filter((t) => t.id !== id) }));
      toast.success("Team deleted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete team");
    } finally {
      set({ loading: false });
    }
  },
  getTeam: (id) => get().teams.find((t) => t.id === id),
  fetchTeamById: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ loading: false });
        return null;
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get(`/teams/${id}`);
      const team = res.data.data.team;
      set((state) => ({
        teams: state.teams.some((t) => t.id === id)
          ? state.teams.map((t) => (t.id === id ? team : t))
          : [...state.teams, team],
      }));
      return team;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch team");
      return null;
    } finally {
      set({ loading: false });
    }
  },
  fetchMembers: async (teamId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get(`/teams/${teamId}/members`);
      set({ members: res.data.data.members || [] });
      return res.data.data.members;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch members");
      return [];
    } finally {
      set({ loading: false });
    }
  },
  addMember: async (teamId, userId, role = "member") => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(`/teams/${teamId}/members/add`, {
        userId,
        role,
      });
      if (res.data.success) {
        // Refetch members or add locally
        await get().fetchMembers(teamId);
        toast.success("Member added!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add member");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  updateMemberRole: async (teamId, userId, role) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.put(`/teams/${teamId}/members/${userId}/role`, {
        role,
      });
      if (res.data.success) {
        await get().fetchMembers(teamId);
        toast.success("Role updated!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  removeMember: async (teamId, userId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.delete(`/teams/${teamId}/members/${userId}`);
      if (res.data.success) {
        await get().fetchMembers(teamId);
        toast.success("Member removed!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove member");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  fetchInvites: async (teamId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get(`/teams/${teamId}/invites`);
      set({ invites: res.data.data.invites || [] });
      return res.data.data.invites;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch invites");
      return [];
    } finally {
      set({ loading: false });
    }
  },
  sendInvite: async (teamId, email, expiresInDays = 7) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(`/teams/${teamId}/invite`, {
        email,
        expiresInDays,
      });
      const newInvite = res.data.data.invite;
      set((state) => ({ invites: [...state.invites, newInvite] }));
      toast.success("Invite sent!");
      return newInvite;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send invite");
      return null;
    } finally {
      set({ loading: false });
    }
  },
  acceptInvite: async (code) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(`/invites/${code}/accept`);
      if (res.data.success) {
        toast.success("Invite accepted!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept invite");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  revokeInvite: async (code) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.delete(`/invites/${code}/revoke`);
      if (res.data.success) {
        set((state) => ({
          invites: state.invites.filter((i) => i.invite_code !== code),
        }));
        toast.success("Invite revoked!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revoke invite");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  fetchJoinRequests: async (teamId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get(`/teams/${teamId}/join-requests`);
      set({ joinRequests: res.data.data.requests || [] });
      return res.data.data.requests;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch join requests"
      );
      return [];
    } finally {
      set({ loading: false });
    }
  },
  requestJoin: async (teamId, message = "") => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(`/teams/${teamId}/request-join`, { message });
      const newRequest = res.data.data.request;
      set((state) => ({ joinRequests: [...state.joinRequests, newRequest] }));
      toast.success("Join request sent!");
      return newRequest;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send join request");
      return null;
    } finally {
      set({ loading: false });
    }
  },
  acceptJoinRequest: async (requestId, teamId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(
        `/teams/${teamId}/join-requests/${requestId}/accept`
      );
      if (res.data.success) {
        // Refetch
        await get().fetchJoinRequests(teamId);
        toast.success("Join request accepted!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to accept join request"
      );
      return false;
    } finally {
      set({ loading: false });
    }
  },
  rejectJoinRequest: async (requestId, teamId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(
        `/teams/${teamId}/join-requests/${requestId}/reject`
      );
      if (res.data.success) {
        await get().fetchJoinRequests(teamId);
        toast.success("Join request rejected!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to reject join request"
      );
      return false;
    } finally {
      set({ loading: false });
    }
  },
  joinTeam: async (teamId) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.post(`/teams/${teamId}/join`);
      if (res.data.success) {
        toast.success("Joined team!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to join team");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
