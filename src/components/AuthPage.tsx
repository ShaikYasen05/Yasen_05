import React, { useState } from "react";
import { Shield, Briefcase, User, Mail, Lock, Phone, Key, HelpCircle, ArrowRight, Loader2, LogIn, UserPlus, Layers } from "lucide-react";
import { UserRole } from "../types";

interface AuthPageProps {
  onAuthSuccess: (token: string, user: any) => void;
  apiClient: any;
}

type AuthMode = "login" | "register" | "forgot" | "reset";

export default function AuthPage({ onAuthSuccess, apiClient }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.TEAM_MEMBER);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await apiClient.login({ email, password });
        localStorage.setItem("taskforge_token", res.token);
        localStorage.setItem("taskforge_user", JSON.stringify(res.user));
        onAuthSuccess(res.token, res.user);
      } else if (mode === "register") {
        const res = await apiClient.register({ name, email, password, role });
        localStorage.setItem("taskforge_token", res.token);
        localStorage.setItem("taskforge_user", JSON.stringify(res.user));
        onAuthSuccess(res.token, res.user);
      } else if (mode === "forgot") {
        const res = await apiClient.forgotPassword(email);
        setSuccessMessage(res.message);
        setMode("reset");
      } else if (mode === "reset") {
        const res = await apiClient.resetPassword({ email, code: resetCode, newPassword });
        setSuccessMessage(res.message);
        setMode("login");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.login({ email: demoEmail, password: demoPass });
      localStorage.setItem("taskforge_token", res.token);
      localStorage.setItem("taskforge_user", JSON.stringify(res.user));
      onAuthSuccess(res.token, res.user);
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-screen w-full flex bg-[#F8FAFC] text-slate-800 overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/5 blur-[120px]" />

      {/* Brand Column (Desktop only) */}
      <div className="hidden lg:flex w-[45%] bg-[#0F172A] border-r border-slate-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        
        {/* Logo Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            TaskForge
          </span>
        </div>

        {/* Dynamic SaaS Illustration/Feature Grid */}
        <div className="my-auto space-y-8 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            Secure Enterprise Workspace
          </div>
          <h1 className="text-4xl font-extrabold font-display leading-[1.15] text-white">
            Plan. Collaborate. Deliver.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            TaskForge integrates modern workspace features, Gantt calendars, Kanban boards, and high-performance workflow coordination into a high-performance productivity platform.
          </p>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <span className="block text-2xl font-bold font-display text-white">100ms</span>
              <span className="text-xs text-slate-500">Keyboard Interaction Speed</span>
            </div>
            <div>
              <span className="block text-2xl font-bold font-display text-violet-400">Live Sync</span>
              <span className="text-xs text-slate-500">Dynamic Workspace Coordinates</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-slate-500 relative z-10">
          © 2026 TaskForge Inc. All rights reserved. Enterprise-grade compliance.
        </p>
      </div>

      {/* Form Column */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo header */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold font-display tracking-tight text-slate-800">
              TaskForge
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800 font-display">
                {mode === "login" && "Sign In"}
                {mode === "register" && "Create Workspace Account"}
                {mode === "forgot" && "Reset Password Request"}
                {mode === "reset" && "Verify Reset Code"}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === "login" && "Enter your enterprise credentials to access your workspaces."}
                {mode === "register" && "Join TaskForge today and invite your engineering teams."}
                {mode === "forgot" && "We'll send a code to reset your account password."}
                {mode === "reset" && "Enter the reset code sent to your email to define new password."}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Email, Username, or Alias</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email or full name (e.g. Sarika Salunke)"
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {(mode === "login" || mode === "register") && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Password</label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[10px] text-blue-600 hover:text-blue-500 font-medium transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Workspace Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(UserRole).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-1 text-[10px] rounded-xl border font-medium transition-all duration-200 cursor-pointer ${
                          role === r
                            ? "bg-blue-50 text-blue-700 border-blue-200 shadow-2xs"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "reset" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Verification Code</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="RESET-TF"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === "login" && "Sign In to TaskForge"}
                    {mode === "register" && "Create Developer Account"}
                    {mode === "forgot" && "Send Code"}
                    {mode === "reset" && "Update Password"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch Authentication modes */}
            <div className="text-center pt-2">
              {mode === "login" ? (
                <p className="text-xs text-slate-500">
                  New to TaskForge?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-all cursor-pointer"
                  >
                    Create account
                  </button>
                </p>
              ) : mode === "register" ? (
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-all cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <button
                  onClick={() => setMode("login")}
                  className="text-xs text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-all cursor-pointer"
                >
                  Return to sign in
                </button>
              )}
            </div>
          </div>

          {/* Seed User Demo Account Access Cards */}
          {(mode === "login" || mode === "register") && (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Predefined Key Auth Access (Instant Bypass):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleDemoLogin("sarika@taskforge.com", "admin")}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700">Sarika Salunke</span>
                    <span className="block text-[8px] text-rose-600 font-semibold uppercase tracking-wider mt-0.5">Admin</span>
                  </div>
                  <span className="block text-[8px] text-slate-400 mt-2">Key: <strong className="text-slate-600">admin</strong></span>
                </button>
                <button
                  onClick={() => handleDemoLogin("rahul@taskforge.com", "pm")}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700">Rahul Sharma</span>
                    <span className="block text-[8px] text-blue-600 font-semibold uppercase tracking-wider mt-0.5">Product Mgr</span>
                  </div>
                  <span className="block text-[8px] text-slate-400 mt-2">Key: <strong className="text-slate-600">pm</strong></span>
                </button>
                <button
                  onClick={() => handleDemoLogin("abdul@taskforge.com", "user")}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700">Abdul Khan</span>
                    <span className="block text-[8px] text-purple-600 font-semibold uppercase tracking-wider mt-0.5">Developer</span>
                  </div>
                  <span className="block text-[8px] text-slate-400 mt-2">Key: <strong className="text-slate-600">user</strong></span>
                </button>
                <button
                  onClick={() => handleDemoLogin("daya@taskforge.com", "user")}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700">Inspector Daya</span>
                    <span className="block text-[8px] text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">Designer</span>
                  </div>
                  <span className="block text-[8px] text-slate-400 mt-2">Key: <strong className="text-slate-600">user</strong></span>
                </button>
                <button
                  onClick={() => handleDemoLogin("salunke@taskforge.com", "user")}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-left transition-colors cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1"
                >
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700">Dr. Salunke</span>
                    <span className="block text-[8px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">DevOps QA</span>
                  </div>
                  <span className="block text-[8px] text-slate-400 mt-2">Key: <strong className="text-slate-600">user</strong></span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
