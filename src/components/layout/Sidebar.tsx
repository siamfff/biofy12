import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  FiHome, FiEdit3, FiLink, FiAward, FiCheckCircle, FiStar, FiGift,
  FiBarChart2, FiBell, FiSettings, FiLogOut,
} from 'react-icons/fi';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { logoutUser } from '../../services/authService';

const NAV = [
  { to: '/dashboard', label: 'Account', icon: FiHome, end: true },
  { to: '/dashboard/customize', label: 'Customize', icon: FiEdit3 },
  { to: '/dashboard/links', label: 'Links', icon: FiLink },
  { to: '/dashboard/badges', label: 'Badges', icon: FiAward },
  { to: '/dashboard/verification', label: 'Verification', icon: FiCheckCircle },
  { to: '/dashboard/premium', label: 'Premium', icon: FiStar },
  { to: '/dashboard/redeem', label: 'Redeem Code', icon: FiGift },
  { to: '/dashboard/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
  { to: '/dashboard/settings', label: 'Settings', icon: FiSettings },
];

const LOGO_URL = 'https://i.postimg.cc/66RGqxBR/a4fe11fa-d54e-437f-9654-ded3cbbe6315.png';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-bg-soft border-r border-border flex flex-col h-full">
      {/* Logo */}
      <Link
        to="/"
        onClick={onNavigate}
        className="p-5 border-b border-border flex items-center gap-2.5 group cursor-pointer hover:bg-bg-card transition-colors"
        title="Go to home"
      >
        <img
          src={LOGO_URL}
          alt="Nebula"
          className="h-9 w-9 rounded-xl object-cover shadow-glow group-hover:shadow-glow-accent group-hover:scale-110 transition-all"
        />
        <div>
          <p className="text-sm font-bold text-white leading-tight font-display group-hover:text-brand-soft transition-colors">
            Nebula
          </p>
          <p className="text-[10px] text-muted leading-tight">Profile Platform</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-gradient-brand text-white shadow-glow'
                  : 'text-muted hover:text-white hover:bg-bg-card',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={cn(
                    'shrink-0 transition',
                    isActive ? 'text-white' : 'text-muted group-hover:text-brand-soft',
                  )}
                />
                <span className="flex-1">{label}</span>
                {label === 'Notifications' && unreadCount > 0 && (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-bg-card">
          <img
            src={
              profile?.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'U'}`
            }
            alt=""
            className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {profile?.displayName || 'User'}
            </p>
            <p className="text-[10px] text-muted truncate">@{profile?.username || '—'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-danger hover:bg-danger/10 transition"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}