import React, { useState, useEffect } from "react";
import { 
  Plus, Calendar, AlertCircle, Trash2, Edit3, DollarSign, Tag, Users, Shield, Target, Award, PlayCircle 
} from "lucide-react";
import { Project, ProjectPriority, ProjectStatus } from "../types";
import { api } from "../services/api";
import UserAvatar from "./UserAvatar";

interface ProjectsViewProps {
  onSelectProject: (projectId: string) => void;
  apiClient: any;
  userRole: string;
  activeUserId: string;
}

export default function ProjectsView({ onSelectProject, apiClient, userRole, activeUserId }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>(ProjectPriority.MEDIUM);
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.PLANNING);
  const [budget, setBudget] = useState("");
  const [tags, setTags] = useState("");
  const [managerId, setManagerId] = useState(activeUserId);
  const [coverUrl, setCoverUrl] = useState("");
  const [milestones, setMilestones] = useState<{ title: string; dueDate: string }[]>([
    { title: "Project Kickoff", dueDate: "" }
  ]);

  const fetchProjectsAndUsers = async () => {
    setLoading(true);
    try {
      const prjs = await apiClient.getProjects();
      setProjects(prjs);
      const usrs = await apiClient.getUsers();
      setUsers(usrs);
    } catch (err) {
      console.error("Failed to fetch projects data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !deadline) return;

    try {
      const parsedMilestones = milestones
        .filter(m => m.title && m.dueDate)
        .map((m, idx) => ({ id: `m-new-${idx}`, title: m.title, dueDate: m.dueDate, completed: false }));

      const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);

      await apiClient.createProject({
        name,
        description,
        deadline,
        priority,
        status,
        managerId,
        budget: budget ? Number(budget) : undefined,
        tags: tagArray,
        milestones: parsedMilestones,
        coverImage: coverUrl || undefined
      });

      setShowCreateModal(false);
      // Reset form
      setName("");
      setDescription("");
      setDeadline("");
      setBudget("");
      setTags("");
      setCoverUrl("");
      setMilestones([{ title: "Project Kickoff", dueDate: "" }]);
      fetchProjectsAndUsers();
    } catch (err) {
      alert("Failed to create project: " + err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project? All associated tasks will be removed.")) return;
    try {
      await apiClient.deleteProject(id);
      fetchProjectsAndUsers();
    } catch (err) {
      alert("Failed to delete project: " + err);
    }
  };

  const addMilestoneRow = () => {
    setMilestones([...milestones, { title: "", dueDate: "" }]);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-96 bg-white border border-slate-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  const canCreate = true;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Workspace Projects</h2>
          <p className="text-xs text-slate-500">Manage, launch, and monitor your active workspace deliverables.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-900/10 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" /> Create Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-16 glass-panel border border-slate-100 rounded-2xl space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No active projects</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a brand-new project with your product engineering specs to begin tasking.</p>
          </div>
        ) : (
          projects.map((project) => {
            const manager = users.find(u => u.id === project.managerId);
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="group glass-panel rounded-2xl overflow-hidden cursor-pointer hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                {/* Project Cover Image */}
                <div className="h-32 w-full relative overflow-hidden bg-slate-50 border-b border-slate-100">
                  <img
                    src={project.coverImage || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800"}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
                  
                  {/* Status Indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/95 text-slate-700 shadow-xs text-[9px] font-semibold">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      project.status === "Completed" ? "bg-emerald-500" :
                      project.status === "In Progress" ? "bg-blue-500" : "bg-amber-500"
                    }`} />
                    <span>{project.status}</span>
                  </div>

                  {/* Health indicator */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[9px] font-semibold border shadow-xs ${
                    project.health === "Healthy" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    project.health === "At Risk" ? "bg-orange-50 text-orange-700 border-orange-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {project.health}
                  </div>
                </div>

                {/* Info body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-800 font-display group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Tag capsules */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Progress slide bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                      <span>PROJECT COMPLETED</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <UserAvatar
                      name={manager?.name || "No Manager"}
                      avatarUrl={manager?.avatar}
                      className="w-5 h-5 text-[8px] ring-1 ring-slate-200 shrink-0"
                    />
                    <span className="font-semibold text-slate-700">{manager?.name || "No Manager"}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {project.deadline}</span>
                    {canCreate && (
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-1 text-slate-600 hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Project Overlay Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="w-full max-w-lg glass-panel text-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0">
              <h3 className="text-base font-bold text-slate-800 font-display">Create Brand-New Project</h3>
              <p className="text-[10px] text-slate-500">Build structured timelines, design deliverables, and budget bounds.</p>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleCreate} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Project Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Apollo Launchpad Platform"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the key goals, scopes, and target clients of this sprint..."
                    rows={3}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Budget ($)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="85000"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-colors"
                  >
                    {Object.values(ProjectPriority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Project Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-colors"
                  >
                    {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Project Cover URL (Optional)</label>
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Design, SaaS, React, Enterprise"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Milestones subsection */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Project Milestones</span>
                  <button
                    type="button"
                    onClick={addMilestoneRow}
                    className="text-[10px] text-blue-600 hover:text-blue-500 font-semibold"
                  >
                    + Add Milestone
                  </button>
                </div>
                <div className="space-y-2">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={m.title}
                        onChange={(e) => {
                          const val = [...milestones];
                          val[idx].title = e.target.value;
                          setMilestones(val);
                        }}
                        placeholder="Milestone title"
                        className="bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-1.5 text-[10px] text-slate-800 focus:outline-none transition-colors"
                      />
                      <input
                        type="date"
                        required
                        value={m.dueDate}
                        onChange={(e) => {
                          const val = [...milestones];
                          val[idx].dueDate = e.target.value;
                          setMilestones(val);
                        }}
                        className="bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-1.5 text-[10px] text-slate-800 focus:outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold transition-all border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-100"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
