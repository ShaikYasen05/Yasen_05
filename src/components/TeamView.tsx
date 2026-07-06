import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, Target, Award, PlayCircle, Plus, AlertCircle, Shield, Briefcase, Award as Trophy 
} from "lucide-react";
import { Team, User } from "../types";
import UserAvatar from "./UserAvatar";

interface TeamViewProps {
  apiClient: any;
  activeUserId: string;
}

export default function TeamView({ apiClient, activeUserId }: TeamViewProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form States
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allTeams = await apiClient.getTeams();
      setTeams(allTeams);
      const allUsers = await apiClient.getUsers();
      setUsers(allUsers);
      if (allUsers.length > 0) {
        setLeaderId(allUsers[0].id);
      }
    } catch (err) {
      console.error("Failed to load team workspace", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      await apiClient.createTeam({
        name: teamName,
        leaderId,
        memberIds: [leaderId, ...selectedMembers],
        description
      });
      setShowCreateModal(false);
      setTeamName("");
      setDescription("");
      setSelectedMembers([]);
      fetchData();
    } catch (err) {
      alert("Failed to create team: " + err);
    }
  };

  const toggleMemberSelection = (uid: string) => {
    if (selectedMembers.includes(uid)) {
      setSelectedMembers(selectedMembers.filter(id => id !== uid));
    } else {
      setSelectedMembers([...selectedMembers, uid]);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-44 bg-white border border-slate-100 rounded-2xl shadow-2xs" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header and Toolbar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Workspace Teams</h2>
          <p className="text-xs text-slate-500">Coordinate and allocate project contributor teams inside your organization.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-200/50"
        >
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      {/* Teams Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No active groups</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a team to bundle project backlogs for specific design and intelligence objectives.</p>
          </div>
        ) : (
          teams.map((team) => {
            const leader = users.find(u => u.id === team.leaderId);
            return (
              <div key={team.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between hover:border-slate-200 hover:shadow-xs transition-all space-y-4 shadow-2xs">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-blue-500" /> {team.name}
                    </h3>
                    <span className="text-[8px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded uppercase">
                      Active team
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {team.description || "Building core platform deliverables in this organization sprint."}
                  </p>
                </div>

                {/* Team contributors list */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>TEAM LEADER</span>
                    <span className="font-bold text-slate-700">{leader?.name || "Unassigned"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">CONTRIBUTORS ({team.memberIds.length})</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {team.memberIds.map((memberId) => {
                        const contributor = users.find(u => u.id === memberId);
                        return (
                          <UserAvatar
                            key={memberId}
                            name={contributor?.name || "User"}
                            avatarUrl={contributor?.avatar}
                            className="w-5 h-5 text-[8px] ring-2 ring-white shrink-0"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Creation Modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white text-slate-700 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-800">Assemble Workspace Team</h3>
                <p className="text-[10px] text-slate-500">Group members for sprint milestones.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-800"><Plus className="w-4 h-4 rotate-45" /></button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Intelligence Automation Lab"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Team Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Integrate custom backends and pipeline workflows..."
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Team Leader</label>
                <select
                  value={leaderId}
                  onChange={(e) => setLeaderId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
                >
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>

              {/* Members selection list */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Select Workspace Contributors</label>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {users.map(u => (
                    <div
                      key={u.id}
                      onClick={() => toggleMemberSelection(u.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedMembers.includes(u.id)
                          ? "bg-blue-50 border-blue-300 text-blue-700 font-medium"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <span>{u.name}</span>
                      <span className="text-[9px] text-slate-400">{u.department || "Engineering"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-200/50"
                >
                  Assemble Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
