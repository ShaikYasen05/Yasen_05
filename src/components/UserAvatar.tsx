import React from "react";

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  className?: string;
  key?: React.Key;
}

export default function UserAvatar({ name = "Anonymous", avatarUrl, className = "w-6 h-6 text-[10px]" }: UserAvatarProps) {
  // If we have a custom avatar that is not a placeholder unsplash image, we can render it.
  // Otherwise, fallback to the professional initials badge.
  const hasPhoto = avatarUrl && avatarUrl.trim() !== "" && !avatarUrl.includes("images.unsplash.com");

  if (hasPhoto) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${className} rounded-full object-cover shrink-0 border border-slate-200`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Extract initials
  const trimmedName = name.trim();
  const parts = trimmedName.split(/\s+/).filter(Boolean);
  let initials = "?";
  if (parts.length > 0) {
    if (parts.length === 1) {
      initials = parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    } else {
      initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
  }

  // Consistent, elegant pastel colors based on name hash
  const getAvatarStyle = (userName: string) => {
    const colorSchemes = [
      "bg-blue-50 text-blue-600 border-blue-200/60",
      "bg-indigo-50 text-indigo-600 border-indigo-200/60",
      "bg-violet-50 text-violet-600 border-violet-200/60",
      "bg-emerald-50 text-emerald-600 border-emerald-200/60",
      "bg-amber-50 text-amber-600 border-amber-200/60",
      "bg-rose-50 text-rose-600 border-rose-200/60",
      "bg-teal-50 text-teal-600 border-teal-200/60",
      "bg-sky-50 text-sky-600 border-sky-200/60",
    ];
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorSchemes.length;
    return colorSchemes[index];
  };

  const colorClasses = getAvatarStyle(name);

  return (
    <div
      className={`${className} rounded-full flex items-center justify-center font-bold font-display tracking-wider shrink-0 border ${colorClasses} select-none`}
      title={name}
    >
      {initials}
    </div>
  );
}
