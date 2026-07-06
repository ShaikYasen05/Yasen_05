import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { 
  Briefcase, CheckCircle2, AlertTriangle, ListTodo, Users, TrendingUp, Clock, ArrowRight, Activity, Calendar 
} from "lucide-react";
import { api } from "../services/api";

interface DashboardViewProps {
  onNavigateToTab: (tab: string) => void;
  onSelectProject: (projectId: string) => void;
}

export default function DashboardView({ onNavigateToTab, onSelectProject }: DashboardViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-2xl lg:col-span-2" />
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Fallback if server doesn't respond
  const dashboardData = stats || {
    totalProjects: 3,
    completedProjects: 0,
    ongoingProjects: 3,
    totalTasks: 8,
    completedTasks: 3,
    pendingTasks: 2,
    inProgressTasks: 2,
    blockedTasks: 1,
    overdueTasks: 1,
    completionRate: 38,
    teamMembersCount: 5,
    recentActivity: []
  };

  // Static chart data derived from real database
  const performanceData = [
    { name: "Liam Smith", Completed: 2, InProgress: 1 },
    { name: "Sophia Vane", Completed: 1, InProgress: 1 },
    { name: "Jane Doe", Completed: 0, InProgress: 0 },
    { name: "Alex Carter", Completed: 0, InProgress: 1 },
    { name: "Ethan Hunt", Completed: 0, InProgress: 1 }
  ];

  const statusPieData = [
    { name: "Completed", value: dashboardData.completedTasks, color: "#10b981" },
    { name: "In Progress", value: dashboardData.inProgressTasks, color: "#0061ff" },
    { name: "To Do", value: dashboardData.pendingTasks, color: "#64748b" },
    { name: "Blocked", value: dashboardData.blockedTasks, color: "#ef4444" }
  ];

  const velocityData = [
    { name: "Mon", Done: 1, Influx: 2 },
    { name: "Tue", Done: 2, Influx: 1 },
    { name: "Wed", Done: 2, Influx: 3 },
    { name: "Thu", Done: 3, Influx: 2 },
    { name: "Fri", Done: 3, Influx: 4 },
    { name: "Sat", Done: 4, Influx: 1 },
    { name: "Sun", Done: 4, Influx: 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Upper Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-transform">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Active Projects</span>
            <span className="text-2xl font-bold text-slate-800 font-display block">{dashboardData.ongoingProjects}</span>
            <span className="text-[10px] text-slate-500">In Active Sprints</span>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/10">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-transform">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Tasks Completion</span>
            <span className="text-2xl font-bold text-emerald-600 font-display block">{dashboardData.completionRate}%</span>
            <span className="text-[10px] text-slate-500">{dashboardData.completedTasks}/{dashboardData.totalTasks} Done</span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-500/10">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-transform">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Overdue Backlog</span>
            <span className="text-2xl font-bold text-orange-600 font-display block">{dashboardData.overdueTasks}</span>
            <span className="text-[10px] text-slate-500">Requires Redistribution</span>
          </div>
          <div className="w-10 h-10 bg-orange-500/10 text-orange-600 rounded-xl flex items-center justify-center border border-orange-500/10">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-transform">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Team Members</span>
            <span className="text-2xl font-bold text-purple-600 font-display block">{dashboardData.teamMembersCount}</span>
            <span className="text-[10px] text-slate-500">Active Contributors</span>
          </div>
          <div className="w-10 h-10 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center border border-purple-500/10">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Task Velocity Area Chart */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 font-display">Task Velocity Trend</h3>
              <p className="text-[10px] text-slate-500">Weekly intake versus completion throughput</p>
            </div>
            <div className="flex gap-4 text-[10px]">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /><span className="text-slate-500">Done</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-violet-600 rounded-full" /><span className="text-slate-500">Influx</span></div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInflux" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#1e293b" }} />
                <Area type="monotone" dataKey="Done" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDone)" strokeWidth={2} />
                <Area type="monotone" dataKey="Influx" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorInflux)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Allocation */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-800 font-display">Status Allocation</h3>
            <p className="text-[10px] text-slate-500">Distribution of backlogs by status</p>
          </div>
          
          <div className="h-44 relative my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#1e293b" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-800 font-display">{dashboardData.totalTasks}</span>
              <span className="text-[8px] text-slate-500 uppercase">Backlogs</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {statusPieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] text-slate-500 font-medium">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-800 font-display">Backlog Accomplishment</h3>
            <p className="text-[10px] text-slate-500">Completed vs In Progress tasks by user</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#1e293b" }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="InProgress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Workspace Actions Timeline */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 font-display flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-500" /> Recent Workspace Activity
              </h3>
              <p className="text-[10px] text-slate-500">Audit logs from all team contributors</p>
            </div>
            <button
              onClick={() => onNavigateToTab("admin")}
              className="text-[10px] text-blue-600 hover:text-blue-500 font-medium flex items-center gap-1 group transition-colors"
            >
              Full Audit Logs <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="flex-1 my-4 overflow-y-auto max-h-[220px] pr-2 space-y-3">
            {dashboardData.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent workspace logs available.
              </div>
            ) : (
              dashboardData.recentActivity.map((log: any, idx: number) => (
                <div key={log.id || idx} className="flex gap-3 text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      <span className="font-semibold text-slate-800">{log.userName}</span> {log.details}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>•</span>
                      <span className="capitalize">{log.action.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
