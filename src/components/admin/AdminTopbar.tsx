import { FiMenu, FiSearch, FiShield } from 'react-icons/fi';

interface Props {
  onMenuClick: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
}

export function AdminTopbar({
  onMenuClick,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
}: Props) {
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

        {/* Admin badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30">
          <FiShield size={14} className="text-danger" />
          <span className="text-xs font-semibold text-danger">Admin Mode</span>
        </div>

        {/* Search */}
        {onSearchChange && (
          <div className="relative max-w-md w-full hidden md:block">
            <FiSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted hidden sm:block">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </header>
  );
}