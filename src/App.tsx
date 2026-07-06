import React, { useState, useEffect } from "react";
import { 
  Briefcase, CheckSquare, Calendar, Users, FolderOpen, Shield, User, LogOut, 
  Menu, Bell, ChevronLeft, ChevronRight, Sparkles, Loader2, RefreshCw, Layers 
} from "lucide-react";

import { api } from "./services/api";
import { Project, User as UserType } from "./types";

import AuthPage from "./components/AuthPage";
import DashboardView from "./components/DashboardView";
import ProjectsView from "./components/ProjectsView";
import KanbanView from "./components/KanbanView";
import CalendarView from "./components/CalendarView";
import TeamView from "./components/TeamView";
import FileView from "./components/FileView";
import AdminPanel from "./components/AdminPanel";
import WorkspaceCopilot from "./components/WorkspaceCopilot";
import UserAvatar from "./components/UserAvatar";

type Tab = "dashboard" | "projects" | "kanban" | "calendar" | "team" | "files" | "admin";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Layout and view states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auto check authentication
  useEffect(() => {
    const storedToken = localStorage.getItem("taskforge_token");
    const storedUser = localStorage.getItem("taskforge_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.setAuthToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Fetch Projects and notifications once authenticated
  useEffect(() => {
    if (token) {
      fetchWorkspaceData();
    }
  }, [token]);

  const fetchWorkspaceData = async () => {
    try {
      const prjs = await api.getProjects();
      setProjects(prjs);
      if (prjs.length > 0 && !activeProjectId) {
        setActiveProjectId(prjs[0].id);
      }
      
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error("Failed to load authenticated workspace variables", err);
    }
  };

  const handleAuthSuccess = (newToken: string, newUser: UserType) => {
    setToken(newToken);
    setUser(newUser);
    api.setAuthToken(newToken);
  };

  const handleLogOut = () => {
    localStorage.removeItem("taskforge_token");
    localStorage.removeItem("taskforge_user");
    setToken(null);
    setUser(null);
    api.setAuthToken("");
    setActiveProjectId(null);
  };

  const handleNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectProjectFromDashboard = (projId: string) => {
    setActiveProjectId(projId);
    setActiveTab("kanban");
  };

  if (loading) {
    return (
      <div id="loading-spinner" className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center items-center gap-4 font-sans">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Loading TaskForge Enterprise Core...</span>
      </div>
    );
  }

  // Not authenticated? Show Auth interface
  if (!token || !user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} apiClient={api} />;
  }

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div id="main-layout" className="min-h-screen bg-[#F8FAFC] text-slate-800 flex relative overflow-hidden font-sans">
      
      {/* Dynamic Background elements for glass panels */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside 
        id="app-sidebar"
        className={`bg-[#0F172A] border-r border-slate-800/40 transition-all duration-300 flex flex-col justify-between z-30 shrink-0 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex flex-col">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/40 bg-[#0F172A]">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  TaskForge
                </span>
              </div>
            ) : (
              <div className="w-7 h-7 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md mx-auto">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTab === "dashboard"
                  ? "bg-white/8 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTab === "projects"
                  ? "bg-white/8 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              {sidebarOpen && <span>Projects</span>}
            </button>

            <button
              onClick={() => setActiveTab("kanban")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTab === "kanban"
                  ? "bg-white/8 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              {sidebarOpen && <span>Kanban Board</span>}
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTab === "calendar"
                  ? "bg-white/8 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              {sidebarOpen && <span>Scheduler</span>}
            </button>

            <button
              onClick={() => setActiveTab("team")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTab === "team"
                  ? "bg-white/8 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              {sidebarOpen && <span>Teams</span>}
            </button>

            <button
              onClick={() => setActiveTab("files")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeTab === "files"
                  ? "bg-white/8 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              {sidebarOpen && <span>Documents</span>}
            </button>

            {(user.role === "Admin" || user.role === "Project Manager") && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                  activeTab === "admin"
                    ? "bg-white/8 text-white font-semibold"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Shield className="w-4 h-4" />
                {sidebarOpen && <span>Control Panel</span>}
              </button>
            )}
          </nav>
        </div>

        {/* User Account Controls Panel */}
        <div className="p-3 border-t border-slate-800/40 bg-[#0F172A]">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-2 min-w-0">
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatar}
                  className="w-8 h-8 text-xs border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-white truncate">{user.name}</span>
                  <span className="block text-[8px] text-slate-500 uppercase font-bold tracking-wider">{user.role}</span>
                </div>
              </div>
            ) : (
              <UserAvatar
                name={user.name}
                avatarUrl={user.avatar}
                className="w-8 h-8 text-xs border-slate-700 mx-auto"
              />
            )}

            {sidebarOpen && (
              <button
                onClick={handleLogOut}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                title="Log Out Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Primary Center Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Navigation Topbar */}
        <header id="app-topbar" className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 relative z-20">
          
          {/* Active project context selector */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">Current Project Context:</span>
            <select
              value={activeProjectId || ""}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500 max-w-xs transition-all"
            >
              <option value="">-- All Projects --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={fetchWorkspaceData}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all"
              title="Sync Context"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Notifications panel & Alerts */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notification Overlay Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 z-50 text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Workspace Alerts</span>
                    <span className="text-[9px] text-slate-400">{unreadNotifsCount} unread</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <span className="text-[10px] text-slate-400 block text-center py-6">No current alerts.</span>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationRead(notif.id)}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer text-[10px] leading-relaxed ${
                            notif.read
                              ? "bg-slate-50 border-slate-100 text-slate-400"
                              : "bg-blue-50 border-blue-100/70 text-slate-700 font-medium"
                          }`}
                        >
                          <p>{notif.content}</p>
                          <span className="text-[8px] text-slate-400 block mt-1">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200" />
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{user.name}</span>
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-slate-200"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Main tab contents view */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {activeTab === "dashboard" && (
            <DashboardView 
              onNavigateToTab={(tab) => setActiveTab(tab as Tab)} 
              onSelectProject={handleSelectProjectFromDashboard}
            />
          )}
          {activeTab === "projects" && (
            <ProjectsView 
              onSelectProject={(id) => {
                setActiveProjectId(id);
                setActiveTab("kanban");
              }}
              apiClient={api}
              userRole={user.role}
              activeUserId={user.id}
            />
          )}
          {activeTab === "kanban" && (
            <KanbanView 
              apiClient={api}
              activeProjectId={activeProjectId}
              activeUserId={user.id}
            />
          )}
          {activeTab === "calendar" && (
            <CalendarView 
              apiClient={api}
              activeProjectId={activeProjectId}
            />
          )}
          {activeTab === "team" && (
            <TeamView 
              apiClient={api}
              activeUserId={user.id}
            />
          )}
          {activeTab === "files" && (
            <FileView 
              apiClient={api}
              activeProjectId={activeProjectId}
            />
          )}
          {activeTab === "admin" && (
            <AdminPanel 
              apiClient={api}
              userRole={user.role}
            />
          )}
        </main>
      </div>

      {/* Floating Workspace Copilot */}
      <WorkspaceCopilot />

    </div>
  );
}
