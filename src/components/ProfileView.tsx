import React, { useState } from "react";
import { 
  User, Mail, Phone, Lock, Save, Sparkles, Key, KeyRound, Award, Shield, AlertCircle 
} from "lucide-react";
import UserAvatar from "./UserAvatar";

interface ProfileViewProps {
  apiClient: any;
  currentUser: any;
  onUpdateUser: (updatedUser: any) => void;
}

export default function ProfileView({ apiClient, currentUser, onUpdateUser }: ProfileViewProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [department, setDepartment] = useState(currentUser?.department || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [skills, setSkills] = useState((currentUser?.skills || []).join(", "));
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const parsedSkills = skills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await apiClient.updateProfile({
        name,
        phone,
        department,
        bio,
        skills: parsedSkills,
        avatar: avatar || undefined
      });

      localStorage.setItem("taskforge_user", JSON.stringify(res.user));
      onUpdateUser(res.user);
      setSuccess("Workspace profile updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await apiClient.changePassword({ currentPassword, newPassword });
      setSuccess("Account password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to modify password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Hub Banner */}
      <div className="relative h-44 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 overflow-hidden border border-slate-200/50 flex items-end shrink-0 shadow-xs">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:24px_24px]" />
        <div className="p-6 flex items-center gap-4 relative z-10 w-full bg-gradient-to-t from-slate-950/90 to-transparent">
          <UserAvatar
            name={currentUser?.name}
            avatarUrl={currentUser?.avatar}
            className="w-16 h-16 text-lg border-2 border-white/20 shadow-xl"
          />
          <div>
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              {currentUser?.name} <span className="text-xs bg-white/10 text-white border border-white/20 px-2.5 py-0.5 rounded-full">{currentUser?.role}</span>
            </h2>
            <p className="text-xs text-slate-300">{currentUser?.email} • Contributors group</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main form: Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 lg:col-span-2 space-y-5">
          <h3 className="text-sm font-semibold text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <User className="w-4.5 h-4.5 text-blue-500" /> Contributor Details
          </h3>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Product Engineering"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Avatar Image URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Skills (Comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="TypeScript, React, Node.js, A11y"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Professional Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a brief professional description about your engineering focus..."
                rows={3}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            <div className="col-span-2 flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-200/50"
              >
                <Save className="w-4 h-4" /> Save Profile Details
              </button>
            </div>
          </form>
        </div>

        {/* Right sidebar: Security & Password change */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <KeyRound className="w-4.5 h-4.5 text-violet-500" /> Account Security
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Update Password
            </button>
          </form>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="block text-[9px] font-bold text-slate-700 uppercase">System Audited</span>
              <p className="text-[8px] text-slate-400">Your password is encrypted using robust SHA256 hashing standards.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
