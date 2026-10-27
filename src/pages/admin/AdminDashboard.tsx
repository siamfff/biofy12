import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiStar,
  FiCheckCircle,
  FiEye,
  FiLink,
  FiShare2,
  FiTrendingUp,
  FiArrowRight,
} from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { fetchAdminStats } from '../../services/adminService';
import { AdminStats } from '../../types';
import { formatNumber, timeAgo } from '../../utils/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((e) => console.error('[admin] stats error:', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={36} />
      </div>
    );
  }

  const tiles = [
    {
      icon: FiUsers,
      label: 'Total Users',
      value: formatNumber(stats.totalUsers),
      color: '#00AAFF',
      to: '/admin/users',
    },
    {
      icon: FiStar,
      label: 'Premium Users',
      value: formatNumber(stats.totalPremium),
      color: '#A855F7',
      to: '/admin/premium',
    },
    {
      icon: FiCheckCircle,
      label: 'Verified',
      value: formatNumber(stats.totalVerified),
      color: '#3B82F6',
      to: '/admin/badges',
    },
    {
      icon: FiEye,
      label: 'Total Views',
      value: formatNumber(stats.totalViews),
      color: '#22C55E',
      to: '/admin/analytics',
    },
    {
      icon: FiLink,
      label: 'Links Created',
      value: formatNumber(stats.totalLinks),
      color: '#F59E0B',
      to: '/admin/analytics',
    },
    {
      icon: FiShare2,
      label: 'Socials Linked',
      value: formatNumber(stats.totalSocials),
      color: '#EC4899',
      to: '/admin/analytics',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">
          Admin Dashboard
        </h1>
        <p className="text-xs text-muted mt-1">
          Platform overview and quick actions
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {tiles.map((t) => (
          <Link
            key={t.label}
            to={t.to}
            className="rounded-2xl border border-border bg-bg-card p-4 hover:border-brand/40 hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: t.color + '22', color: t.color }}
              >
                <t.icon size={16} />
              </div>
              <FiArrowRight
                size={14}
                className="text-muted opacity-0 group-hover:opacity-100 transition"
              />
            </div>
            <p className="text-2xl font-bold text-white font-display">
              {t.value}
            </p>
            <p className="text-[11px] text-muted mt-1">{t.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent signups */}
      <Card
        title="Recent Signups"
        description="Latest users to join Nebula"
        action={
          <Link
            to="/admin/users"
            className="text-xs text-brand-soft hover:underline"
          >
            View all →
          </Link>
        }
      >
        {stats.recentSignups.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">No users yet</p>
        ) : (
          <div className="divide-y divide-border -mx-5">
            {stats.recentSignups.map((u) => (
              <Link
                key={u.uid}
                to={`/admin/users/${u.uid}`}
                className="px-5 py-3 flex items-center gap-3 hover:bg-bg-soft transition"
              >
                <img
                  src={
                    u.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${
                      u.displayName || u.username
                    }`
                  }
                  alt=""
                  className="h-9 w-9 rounded-full object-cover border border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium truncate">
                    {u.displayName || u.username}
                  </p>
                  <p className="text-[11px] text-muted truncate">
                    @{u.username} · {u.email}
                  </p>
                </div>
                <span className="text-[10px] text-muted whitespace-nowrap">
                  {timeAgo(u.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <Card title="Quick Actions" description="Common admin tasks">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/admin/redeem"
            className="rounded-xl border border-border bg-bg-soft p-4 hover:border-brand/40 hover:bg-bg-elevated transition text-center"
          >
            <div className="h-10 w-10 mx-auto rounded-lg bg-brand/15 text-brand-soft flex items-center justify-center mb-2">
              <FiTrendingUp size={16} />
            </div>
            <p className="text-xs font-semibold text-white">Create Code</p>
            <p className="text-[10px] text-muted mt-1">New redeem code</p>
          </Link>
          <Link
            to="/admin/verification"
            className="rounded-xl border border-border bg-bg-soft p-4 hover:border-brand/40 hover:bg-bg-elevated transition text-center"
          >
            <div className="h-10 w-10 mx-auto rounded-lg bg-brand/15 text-brand-soft flex items-center justify-center mb-2">
              <FiCheckCircle size={16} />
            </div>
            <p className="text-xs font-semibold text-white">Verification</p>
            <p className="text-[10px] text-muted mt-1">Review apps</p>
          </Link>
          <Link
            to="/admin/notifications"
            className="rounded-xl border border-border bg-bg-soft p-4 hover:border-brand/40 hover:bg-bg-elevated transition text-center"
          >
            <div className="h-10 w-10 mx-auto rounded-lg bg-brand/15 text-brand-soft flex items-center justify-center mb-2">
              <FiStar size={16} />
            </div>
            <p className="text-xs font-semibold text-white">Broadcast</p>
            <p className="text-[10px] text-muted mt-1">Send notification</p>
          </Link>
          <Link
            to="/admin/users"
            className="rounded-xl border border-border bg-bg-soft p-4 hover:border-brand/40 hover:bg-bg-elevated transition text-center"
          >
            <div className="h-10 w-10 mx-auto rounded-lg bg-brand/15 text-brand-soft flex items-center justify-center mb-2">
              <FiUsers size={16} />
            </div>
            <p className="text-xs font-semibold text-white">Manage Users</p>
            <p className="text-[10px] text-muted mt-1">Search & edit</p>
          </Link>
        </div>
      </Card>
    </div>
  );
}