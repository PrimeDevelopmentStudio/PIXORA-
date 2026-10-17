import React, { useState } from 'react';
import { AdminAnnouncement } from '../../types/admin';
import { Sparkles, Megaphone, Info, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface AnnouncementBannerProps {
  announcement: AdminAnnouncement;
  onActionClick?: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcement,
  onActionClick,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || !announcement.enabled || !announcement.message || dismissed) {
    return null;
  }

  const themes = {
    purple: 'bg-gradient-to-r from-violet-900/90 via-purple-900/90 to-indigo-900/90 border-violet-500/40 text-violet-100',
    info: 'bg-gradient-to-r from-blue-900/90 via-sky-900/90 to-cyan-900/90 border-blue-500/40 text-blue-100',
    success: 'bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-green-900/90 border-emerald-500/40 text-emerald-100',
    warning: 'bg-gradient-to-r from-amber-900/90 via-orange-900/90 to-red-900/90 border-amber-500/40 text-amber-100',
  };

  const currentTheme = themes[announcement.type] || themes.purple;

  return (
    <div className={`relative px-4 py-2.5 text-xs font-medium border-b flex items-center justify-between gap-3 shadow-md z-40 transition-all ${currentTheme}`}>
      <div className="flex items-center gap-2.5 mx-auto overflow-hidden">
        <span className="p-1 rounded-full bg-white/10 flex-shrink-0 animate-pulse">
          {announcement.type === 'warning' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
          ) : announcement.type === 'success' ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
          ) : (
            <Megaphone className="w-3.5 h-3.5 text-violet-300" />
          )}
        </span>

        <span className="truncate">{announcement.message}</span>

        {announcement.actionText && (
          <button
            onClick={onActionClick}
            className="ml-2 underline font-bold hover:text-white flex-shrink-0 cursor-pointer"
          >
            {announcement.actionText} →
          </button>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-white/60 hover:text-white rounded hover:bg-white/10 transition-colors flex-shrink-0"
        title="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
