import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFlag, FiUser, FiAlertTriangle } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchAllUsers } from '../../services/adminService';
import { UserDoc } from '../../types';
import { formatNumber } from '../../utils/format';

export default function AdminModeration() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const recent = [...users]
    .sort((a, b) => {
      const ta = a.updatedAt?.toMillis?.() || 0;
      const tb = b.updatedAt?.toMillis?.() || 0;
      return tb - ta;
    })
    .slice(0, 30);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Content Moderation</h1>
        <p className="text-xs text-muted mt-1">
          Recent activity across the platform
        </p>
      </div>

      <Card className="border-warning/40 bg-warning/5">
        <div className="flex items-start gap-3">
          <FiAlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Moderation Features Coming Soon
            </h3>
            <p className="text-xs text-muted mt-1">
              Report management, content flagging, and user suspension tools
              are being built. For now, you can review recently active profiles
              below.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Recently Active Profiles">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={32} />
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<FiFlag size={28} />}
            title="No activity"
            description="Users will appear here"
          />
        ) : (
          <div className="divide-y divide-border -mx-5">
            {recent.map((u) => (
              <Link
                key={u.uid}
                to={`/admin/users/${u.uid}`}
                className="px-5 py-3 flex items-center gap-3 hover:bg-bg-soft transition"
              >
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
                <span className="text-xs text-muted">
                  {formatNumber(u.views || 0)} views
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}