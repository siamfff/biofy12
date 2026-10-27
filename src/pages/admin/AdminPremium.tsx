import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiStar, FiUser } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs } from '../../components/ui/Tabs';
import {
  fetchAllUsers,
  adminSetPremium,
  logAdminAction,
} from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { UserDoc } from '../../types';
import { formatDate } from '../../utils/format';

type Filter = 'premium' | 'free' | 'all';

export default function AdminPremium() {
  const { profile: admin } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('premium');
  const [search, setSearch] = useState('');
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState<string | null>(null);

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
    if (filter === 'premium') list = list.filter((u) => u.premium);
    if (filter === 'free') list = list.filter((u) => !u.premium);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.displayName?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, filter, search]);

  const grant = async (u: UserDoc) => {
    if (!admin) return;
    setBusy(u.uid);
    try {
      await adminSetPremium(u.uid, true, days);
      await logAdminAction(
        admin.uid,
        admin.username || admin.displayName,
        'grant_premium',
        u.uid,
        u.username || '',
        { days },
      );
      toast.success(`Premium granted for ${days} days`);
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setBusy(null);
    }
  };

  const revoke = async (u: UserDoc) => {
    if (!admin) return;
    setBusy(u.uid);
    try {
      await adminSetPremium(u.uid, false);
      await logAdminAction(
        admin.uid,
        admin.username || admin.displayName,
        'revoke_premium',
        u.uid,
        u.username || '',
      );
      toast.success('Premium revoked');
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Premium</h1>
        <p className="text-xs text-muted mt-1">Manage premium subscriptions</p>
      </div>

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

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">Days:</label>
          <input
            type="number"
            min={1}
            max={3650}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 1)}
            className="w-20 bg-bg-card border border-border rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <Tabs
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        tabs={[
          { id: 'premium', label: `Premium (${users.filter((u) => u.premium).length})` },
          { id: 'free', label: `Free (${users.filter((u) => !u.premium).length})` },
          { id: 'all', label: `All (${users.length})` },
        ]}
      />

      <Card noPadding>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FiUser size={28} />}
            title="No users found"
            description="Try a different filter"
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((u) => (
              <div
                key={u.uid}
                className="px-5 py-3 flex items-center gap-3"
              >
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
                  <p className="text-[11px] text-muted truncate">
                    @{u.username}
                    {u.premium && u.premiumUntil && (
                      <> · until {formatDate(u.premiumUntil)}</>
                    )}
                  </p>
                </div>

                {u.premium ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => revoke(u)}
                    loading={busy === u.uid}
                  >
                    Revoke
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => grant(u)}
                    loading={busy === u.uid}
                  >
                    <FiStar size={12} /> Grant +{days}d
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}