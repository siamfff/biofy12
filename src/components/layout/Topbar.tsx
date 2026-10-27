import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiBell, FiExternalLink, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

interface Props {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: Props) {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const [search, setSearch] = useState('');

  return (
    <header className="h-16 shrink-0 border-b border-border bg-bg-soft backdrop-blur-xl flex items-center justify-between gap-4 px-4 sm:px-6">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-bg-card text-muted hover:text-white"
          aria-label="Menu"
        >
          <FiMenu size={20} />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-soft pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full bg-bg-card border border-border rounded-xl pl-9 pr-14 py-2 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono bg-bg-elevated border border-border rounded px-1.5 py-0.5">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {profile?.username && (
          <a
            href={`/u/${profile.username}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted hover:text-brand-soft px-3 py-2 rounded-lg hover:bg-bg-card transition"
          >
            View profile <FiExternalLink size={12} />
          </a>
        )}
        <Link
          to="/dashboard/notifications"
          className="relative p-2 rounded-lg hover:bg-bg-card text-muted hover:text-brand-soft transition"
        >
          <FiBell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}