import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiEye,
  FiLink,
  FiShare2,
  FiStar,
  FiCheckCircle,
  FiTrendingUp,
  FiAward,
} from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { fetchAdminStats, fetchAllUsers } from '../../services/adminService';
import { AdminStats, UserDoc } from '../../types';
import { formatNumber } from '../../utils/format';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topUsers, setTopUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, all] = await Promise.all([
          fetchAdminStats(),
          fetchAllUsers(),
        ]);
        setStats(s);
        setTopUsers(
          [...all]
            .filter((u) => u.username)
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 10),
        );
      } catch (e) {
        console.error('[admin analytics] failed:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={36} />
      </div>
    );
  }

  const tiles = [
    { icon: FiUsers, label: 'Total Users', value: formatNumber(stats.totalUsers), color: '#00AAFF' },
    { icon: FiEye, label: 'Total Views', value: formatNumber(stats.totalViews), color: '#22C55E' },
    { icon: FiLink, label: 'Links Created', value: formatNumber(stats.totalLinks), color: '#F59E0B' },
    { icon: FiShare2, label: 'Socials Linked', value: formatNumber(stats.totalSocials), color: '#EC4899' },
    { icon: FiStar, label: 'Premium', value: formatNumber(stats.totalPremium), color: '#A855F7' },
    { icon: FiCheckCircle, label: 'Verified', value: formatNumber(stats.totalVerified), color: '#3B82F6' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">
          Platform Analytics
        </h1>
        <p className="text-xs text-muted mt-1">Platform-wide statistics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-2xl border border-border bg-bg-card p-4"
          >
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: t.color + '22', color: t.color }}
            >
              <t.icon size={16} />
            </div>
            <p className="text-2xl font-bold text-white font-display">{t.value}</p>
            <p className="text-[11px] text-muted mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      <Card
        title="Top 10 Profiles"
        description="Most viewed profiles"
        action={
          <Link to="/admin/users" className="text-xs text-brand-soft hover:underline">
            View all →
          </Link>
        }
      >
        {topUsers.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">No users yet</p>
        ) : (
          <div className="divide-y divide-border -mx-5">
            {topUsers.map((u, i) => (
              <Link
                key={u.uid}
                to={`/admin/users/${u.uid}`}
                className="px-5 py-3 flex items-center gap-3 hover:bg-bg-soft transition"
              >
                <span
                  className="w-6 text-center text-xs font-bold"
                  style={{
                    color: i === 0 ? '#facc15' : i === 1 ? '#cbd5e1' : i === 2 ? '#f59e0b' : '#8B8B95',
                  }}
                >
                  {i + 1}
                </span>
                <img
                  src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.displayName || u.username}`}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover border border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium truncate">
                    {u.displayName || u.username}
                  </p>
                  <p className="text-[11px] text-muted truncate">@{u.username}</p>
                </div>
                <span className="text-xs text-muted flex items-center gap-1.5">
                  <FiEye size={12} /> {formatNumber(u.views || 0)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card title="Platform Insights">
        <ul className="space-y-3 text-sm text-muted">
          <li className="flex items-start gap-3">
            <FiTrendingUp size={16} className="text-brand-soft shrink-0 mt-0.5" />
            <span>
              <span className="text-white font-medium">Avg views per user:</span>{' '}
              {stats.totalUsers > 0
                ? Math.round(stats.totalViews / stats.totalUsers)
                : 0}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <FiAward size={16} className="text-brand-soft shrink-0 mt-0.5" />
            <span>
              <span className="text-white font-medium">Premium conversion:</span>{' '}
              {stats.totalUsers > 0
                ? Math.round((stats.totalPremium / stats.totalUsers) * 100)
                : 0}
              %
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}