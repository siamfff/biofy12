import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiAward, FiUser } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchAllUsers, adminSetBadge, logAdminAction } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { UserDoc } from '../../types';
import { BADGE_IMAGES } from '../../utils/badgeImages';
import { cn } from '../../utils/cn';

export default function AdminBadges() {
  const { profile: admin } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBadge, setFilterBadge] = useState<string>('');
  const [saving, setSaving] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const list = await fetchAllUsers();
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (filterBadge) {
      list = list.filter((u) => u.badges?.includes(filterBadge));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.displayName?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, search, filterBadge]);

  const toggle = async (user: UserDoc, badge: string) => {
    if (!admin) return;
    const key = `${user.uid}-${badge}`;
    const has = user.badges?.includes(badge);
    setSaving(key);
    try {
      await adminSetBadge(user.uid, badge, !has);
      await logAdminAction(
        admin.uid,
        admin.username || admin.displayName,
        has ? 'remove_badge' : 'add_badge',
        user.uid,
        user.username || '',
        { badge },
      );
      toast.success(has ? 'Badge removed' : 'Badge added');
      // optimistic update
      setUsers((prev) =>
        prev.map((u) => {
          if (u.uid !== user.uid) return u;
          const next = has
            ? (u.badges || []).filter((b) => b !== badge)
            : [...new Set([...(u.badges || []), badge])];
          return { ...u, badges: next };
        }),
      );
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Badges Manager</h1>
        <p className="text-xs text-muted mt-1">
          Click any badge to grant/revoke it
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full bg-bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand"
          />
        </div>

        <select
          value={filterBadge}
          onChange={(e) => setFilterBadge(e.target.value)}
          className="bg-bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
        >
          <option value="">All badges</option>
          {Object.entries(BADGE_IMAGES).map(([k, m]) => (
            <option key={k} value={k}>
              Has {m.label}
            </option>
          ))}
        </select>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FiAward size={28} />}
            title="No users found"
            description="Try a different filter"
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((u) => (
              <div key={u.uid} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      u.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${u.displayName || u.username}`
                    }
                    alt=""
                    className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/users/${u.uid}`}
                      className="text-sm font-semibold text-white hover:text-brand-soft truncate block"
                    >
                      {u.displayName || u.username}
                    </Link>
                    <p className="text-[11px] text-muted">@{u.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(BADGE_IMAGES).map(([key, meta]) => {
                    const has = u.badges?.includes(key);
                    const busy = saving === `${u.uid}-${key}`;
                    return (
                      <button
                        key={key}
                        onClick={() => toggle(u, key)}
                        disabled={!!saving}
                        className={cn(
                          'rounded-lg border p-2 transition text-center',
                          has
                            ? 'border-brand/40 bg-brand/10'
                            : 'border-border bg-bg-soft hover:border-brand/30 opacity-50',
                        )}
                      >
                        {busy ? (
                          <Spinner size={24} />
                        ) : (
                          <img
                            src={meta.image}
                            alt={meta.label}
                            className="h-8 w-8 mx-auto object-contain"
                          />
                        )}
                        <p className="text-[10px] mt-1 text-muted">{meta.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}