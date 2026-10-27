import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiAward,
  FiCheckCircle,
  FiStar,
  FiGift,
  FiBarChart2,
  FiFlag,
  FiBell,
  FiSettings,
  FiFileText,
  FiLogOut,
  FiArrowLeft,
} from 'react-icons/fi';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../services/authService';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/badges', label: 'Badges', icon: FiAward },
  { to: '/admin/verification', label: 'Verification', icon: FiCheckCircle },
  { to: '/admin/premium', label: 'Premium', icon: FiStar },
  { to: '/admin/redeem', label: 'Redeem Codes', icon: FiGift },
  { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/admin/moderation', label: 'Moderation', icon: FiFlag },
  { to: '/admin/notifications', label: 'Notifications', icon: FiBell },
  { to: '/admin/settings', label: 'Site Settings', icon: FiSettings },
  { to: '/admin/logs', label: 'Admin Logs', icon: FiFileText },
];

const LOGO_URL =
  'https://i.postimg.cc/66RGqxBR/a4fe11fa-d54e-437f-9654-ded3cbbe6315.png';

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-bg-soft border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <Link
          to="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <img
            src={LOGO_URL}
            alt="Admin"
            className="h-9 w-9 rounded-xl object-cover shadow-glow group-hover:scale-110 transition"
          />
          <div>
            <p className="text-sm font-bold text-white leading-tight font-display">
              Nebula
            </p>
            <p className="text-[10px] text-danger leading-tight font-semibold">
              ADMIN PANEL
            </p>
          </div>
        </Link>
      </div>

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
                    isActive
                      ? 'text-white'
                      : 'text-muted group-hover:text-brand-soft',
                  )}
                />
                <span className="flex-1">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Back to user dashboard */}
      <div className="p-3 border-t border-border">
        <Link
          to="/dashboard"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-bg-card transition"
        >
          <FiArrowLeft size={16} />
          Back to user panel
        </Link>
      </div>

      {/* Admin footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-bg-card">
          <img
            src={
              profile?.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${
                profile?.displayName || 'A'
              }`
            }
            alt=""
            className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {profile?.displayName || 'Admin'}
            </p>
            <p className="text-[10px] text-danger truncate">Administrator</p>
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