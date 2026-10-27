import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiUser,
  FiStar,
  FiCheckCircle,
  FiEye,
} from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchAllUsers } from '../../services/adminService';
import { UserDoc } from '../../types';
import { formatNumber } from '../../utils/format';

type Filter = 'all' | 'premium' | 'verified' | 'admin';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch((e) => console.error('[admin] users error:', e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (filter === 'premium') list = list.filter((u) => u.premium);
    if (filter === 'verified') list = list.filter((u) => u.verified);
    if (filter === 'admin') list = list.filter((u) => u.role === 'admin');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.displayName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.uid?.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
  }, [users, search, filter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Users</h1>
        <p className="text-xs text-muted mt-1">
          {users.length} total · {filtered.length} shown
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, email, uid…"
            className="w-full bg-bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          {(['all', 'premium', 'verified', 'admin'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition ${
                filter === f
                  ? 'bg-gradient-brand text-white'
                  : 'bg-bg-card text-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Users list */}
      <Card noPadding>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FiUser size={28} />}
            title={search ? 'No users match search' : 'No users yet'}
            description={
              search
                ? 'Try a different search term'
                : 'Users will appear here once they sign up'
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((u) => (
              <Link
                key={u.uid}
                to={`/admin/users/${u.uid}`}
                className="px-5 py-3 flex items-center gap-3 hover:bg-bg-soft transition group"
              >
                <img
                  src={
                    u.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${
                      u.displayName || u.username
                    }`
                  }
                  alt=""
                  className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-white font-semibold truncate">
                      {u.displayName || u.username}
                    </p>
                    {u.role === 'admin' && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-danger/15 text-danger">
                        Admin
                      </span>
                    )}
                    {u.premium && (
                      <FiStar size={11} className="text-brand-soft" />
                    )}
                    {u.verified && (
                      <FiCheckCircle size={11} className="text-blue-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted truncate">
                    @{u.username} · {u.email}
                  </p>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-white font-medium">
                    {formatNumber(u.views || 0)}
                  </p>
                  <p className="text-[10px] text-muted">views</p>
                </div>

                <FiEye
                  size={14}
                  className="text-muted opacity-0 group-hover:opacity-100 transition shrink-0"
                />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}