import React, { useState, useEffect } from "react";
import { 
  Shield, Activity, Users, Lock, Server, Terminal, RefreshCw, AlertTriangle, UserCheck, Key, FileSpreadsheet 
} from "lucide-react";
import UserAvatar from "./UserAvatar";

interface AdminPanelProps {
  apiClient: any;
  userRole: string;
}

export default function AdminPanel({ apiClient, userRole }: AdminPanelProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const stats = await apiClient.getDashboardStats();
      if (stats && stats.recentActivity) {
        setLogs(stats.recentActivity);
      }
      const allUsers = await apiClient.getUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to fetch admin statistics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (userRole !== "Admin" && userRole !== "Project Manager") {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3 text-center">
        <Lock className="w-12 h-12 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm">Your workspace role ({userRole}) does not have permissions to access administrative tools.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white border border-slate-100 rounded-2xl" />
        <div className="h-84 bg-white border border-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Shield className="w-5.5 h-5.5 text-violet-500" /> Organization Control Panel
          </h2>
          <p className="text-xs text-slate-500">System configuration, activity logs, and user roles permissions.</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="p-2 hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Summary Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-semibold block">Total Contributors</span>
            <span className="text-xl font-bold text-slate-800 font-display block">{users.length} Users</span>
            <span className="text-[8px] text-emerald-600 font-semibold uppercase">100% active</span>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-semibold block">Workspace Connection</span>
            <span className="text-xl font-bold text-slate-800 font-display block">Online Sync</span>
            <span className="text-[8px] text-indigo-600 font-semibold uppercase">Websocket active</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-semibold block">Workspace Security</span>
            <span className="text-xl font-bold text-slate-800 font-display block">TLS Session</span>
            <span className="text-[8px] text-emerald-600 font-semibold uppercase">Standard Tokens</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User list with roles */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Active Users
            </h3>
            <p className="text-[9px] text-slate-500">Assign role credentials inside organization.</p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar
                    name={u.name}
                    avatarUrl={u.avatar}
                    className="w-7 h-7 text-xs"
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-slate-800 truncate">{u.name}</span>
                    <span className="block text-[9px] text-slate-500 truncate">{u.email}</span>
                  </div>
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  u.role === "Admin" ? "bg-red-50 text-red-600 border-red-100" :
                  u.role === "Project Manager" ? "bg-blue-50 text-blue-600 border-blue-100" :
                  "bg-slate-50 text-slate-500 border-slate-200"
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Audit Logs Trail */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 lg:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-violet-500" /> Workspace Activity Logs
            </h3>
            <p className="text-[9px] text-slate-500">Record of recent administrative actions and changes.</p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">
                No workspace activities logged yet.
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={log.id || idx} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl flex items-start gap-3 transition-colors">
                  <div className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-slate-700 leading-normal">
                      <span className="font-semibold text-slate-800">{log.userName}</span> {log.details}
                    </p>
                    <div className="flex items-center gap-3 text-[9px] text-slate-400">
                      <span>USER ID: <span className="font-mono">{log.userId}</span></span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="font-bold uppercase text-slate-600">{log.action}</span>
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
