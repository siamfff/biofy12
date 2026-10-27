import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiEye,
  FiCheckCircle,
  FiStar,
  FiTrash2,
  FiUser,
  FiShield,
  FiExternalLink,
  FiSave,
  FiAlertTriangle,
} from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  fetchUserById,
  adminSetPremium,
  adminSetVerified,
  adminSetBadge,
  adminDeleteUser,
  logAdminAction,
} from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { UserDoc } from '../../types';
import { formatNumber, formatDate } from '../../utils/format';
import { BADGE_IMAGES } from '../../utils/badgeImages';
import { cn } from '../../utils/cn';

export default function AdminUserDetail() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { profile: adminProfile } = useAuth();
  const toast = useToast();

  const [user, setUser] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [premiumDays, setPremiumDays] = useState(30);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reload = async () => {
    if (!uid) return;
    const u = await fetchUserById(uid);
    setUser(u);
  };

  useEffect(() => {
    (async () => {
      if (!uid) return;
      setLoading(true);
      await reload();
      setLoading(false);
    })();
  }, [uid]);

  const logAction = async (action: string, details?: Record<string, any>) => {
    if (!adminProfile || !user) return;
    await logAdminAction(
      adminProfile.uid,
      adminProfile.username || adminProfile.displayName,
      action,
      user.uid,
      user.username || '',
      details,
    );
  };

  const handleTogglePremium = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const newState = !user.premium;
      await adminSetPremium(user.uid, newState, premiumDays);
      await logAction(newState ? 'grant_premium' : 'revoke_premium', {
        days: newState ? premiumDays : 0,
      });
      await reload();
      toast.success(newState ? `Premium granted for ${premiumDays} days` : 'Premium revoked');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleExtendPremium = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await adminSetPremium(user.uid, true, premiumDays);
      await logAction('extend_premium', { days: premiumDays });
      await reload();
      toast.success(`Premium extended by ${premiumDays} days`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVerified = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const newState = !user.verified;
      await adminSetVerified(user.uid, newState);
      await logAction(newState ? 'grant_verified' : 'revoke_verified');
      await reload();
      toast.success(newState ? 'Verified granted' : 'Verified revoked');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBadge = async (badge: string) => {
    if (!user) return;
    const has = user.badges?.includes(badge);
    setSaving(true);
    try {
      await adminSetBadge(user.uid, badge, !has);
      await logAction(has ? 'remove_badge' : 'add_badge', { badge });
      await reload();
      toast.success(has ? 'Badge removed' : 'Badge added');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await logAction('delete_user');
      await adminDeleteUser(user.uid);
      toast.success('User deleted');
      navigate('/admin/users');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={36} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <EmptyState
          icon={<FiUser size={28} />}
          title="User not found"
          description="This user doesn't exist or was deleted."
          action={
            <Link to="/admin/users">
              <Button variant="secondary">
                <FiArrowLeft size={14} /> Back to Users
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-xs text-muted hover:text-white transition"
        >
          <FiArrowLeft size={14} /> Back to Users
        </Link>

        <a
          href={`/u/${user.username}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs text-brand-soft hover:underline"
        >
          View public profile <FiExternalLink size={12} />
        </a>
      </div>

      {/* Profile Header */}
      <Card>
        <div className="flex items-start gap-5 flex-wrap">
          <img
            src={
              user.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${
                user.displayName || user.username
              }`
            }
            alt=""
            className="h-20 w-20 rounded-2xl object-cover border-2 border-border shrink-0"
          />
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white font-display">
                {user.displayName || user.username}
              </h1>
              {user.role === 'admin' && (
                <Badge color="#EF4444" icon={<FiShield size={10} />}>
                  Admin
                </Badge>
              )}
              {user.premium && (
                <Badge color="#A855F7" icon={<FiStar size={10} />}>
                  Premium
                </Badge>
              )}
              {user.verified && (
                <Badge color="#3B82F6" icon={<FiCheckCircle size={10} />}>
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted mt-1">@{user.username}</p>

            <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <FiMail size={11} /> {user.email}
              </span>
              {user.location && (
                <span className="inline-flex items-center gap-1.5">
                  <FiMapPin size={11} /> {user.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <FiCalendar size={11} /> Joined {formatDate(user.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiEye size={11} /> {formatNumber(user.views || 0)} views
              </span>
            </div>

            <p className="text-[11px] text-muted mt-3 font-mono">
              UID: {user.uid}
            </p>
          </div>
        </div>
      </Card>

      {/* Premium Control */}
      <Card title="Premium Status" description="Grant or revoke premium">
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted">Days:</label>
              <input
                type="number"
                min={1}
                max={3650}
                value={premiumDays}
                onChange={(e) => setPremiumDays(Number(e.target.value) || 1)}
                className="w-24 bg-bg-soft border border-border rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand"
              />
            </div>

            {user.premium ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExtendPremium}
                  loading={saving}
                >
                  <FiSave size={12} /> Extend +{premiumDays}d
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleTogglePremium}
                  loading={saving}
                >
                  <FiStar size={12} /> Revoke Premium
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={handleTogglePremium} loading={saving}>
                <FiStar size={12} /> Grant Premium ({premiumDays} days)
              </Button>
            )}
          </div>

          {user.premium && user.premiumUntil && (
            <p className="text-xs text-brand-soft">
              Active until: {formatDate(user.premiumUntil)}
            </p>
          )}
        </div>
      </Card>

      {/* Verified Control */}
      <Card title="Verification" description="Toggle verified checkmark">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiCheckCircle
              size={18}
              className={user.verified ? 'text-blue-400' : 'text-muted'}
            />
            <div>
              <p className="text-sm text-white font-medium">
                {user.verified ? 'Verified' : 'Not verified'}
              </p>
              <p className="text-[11px] text-muted">
                {user.verified
                  ? 'User has the verified checkmark'
                  : 'User does not have the verified checkmark'}
              </p>
            </div>
          </div>
          <Button
            variant={user.verified ? 'danger' : 'primary'}
            size="sm"
            onClick={handleToggleVerified}
            loading={saving}
          >
            {user.verified ? 'Revoke' : 'Grant Verified'}
          </Button>
        </div>
      </Card>

      {/* Badges Control */}
      <Card title="Badges" description="Add or remove badges">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(BADGE_IMAGES).map(([key, meta]) => {
            const has = user.badges?.includes(key);
            return (
              <button
                key={key}
                onClick={() => handleToggleBadge(key)}
                disabled={saving}
                className={cn(
                  'rounded-xl border p-3 transition-all text-center group',
                  has
                    ? 'border-brand/40 bg-brand/10'
                    : 'border-border bg-bg-soft hover:border-brand/30 hover:bg-bg-elevated',
                )}
              >
                <img
                  src={meta.image}
                  alt={meta.label}
                  className="h-10 w-10 mx-auto object-contain mb-2 group-hover:scale-110 transition"
                  style={{ opacity: has ? 1 : 0.4 }}
                />
                <p
                  className={cn(
                    'text-xs font-medium',
                    has ? 'text-white' : 'text-muted',
                  )}
                >
                  {meta.label}
                </p>
                <p
                  className="text-[10px] mt-1 font-semibold"
                  style={{ color: has ? meta.color : '#8B8B95' }}
                >
                  {has ? '✓ Owned' : '+ Add'}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card
        className="border-danger/40 bg-danger/5"
        title="Danger Zone"
        description="Irreversible actions"
      >
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-danger/15 text-danger flex items-center justify-center shrink-0">
            <FiAlertTriangle size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Delete this user</p>
            <p className="text-[11px] text-muted mt-1">
              This will permanently delete the user's profile.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="mt-3"
            >
              <FiTrash2 size={12} /> Delete User
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete user?"
        message={
          <>
            Are you sure you want to delete{' '}
            <span className="text-white font-medium">@{user.username}</span>?
            This cannot be undone.
          </>
        }
        confirmLabel="Delete permanently"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDeleteUser}
        loading={deleting}
        danger
      />
    </div>
  );
}