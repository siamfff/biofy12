import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import {
  markRead,
  markAllRead,
  deleteNotification,
} from '../../services/notificationService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../hooks/useToast';
import { timeAgo } from '../../utils/format';
import { NotificationDoc } from '../../types';
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
  FiMail,
} from 'react-icons/fi';

type Filter = 'all' | 'unread' | 'read';

const TYPE_META: Record<
  NotificationDoc['type'],
  { icon: JSX.Element; color: string; bg: string }
> = {
  info: {
    icon: <FiInfo size={14} />,
    color: '#7c5cff',
    bg: 'rgba(124, 92, 255, 0.15)',
  },
  success: {
    icon: <FiCheckCircle size={14} />,
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
  },
  warning: {
    icon: <FiAlertTriangle size={14} />,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
  },
  error: {
    icon: <FiXCircle size={14} />,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
  },
};

export default function Notifications() {
  const { profile } = useAuth();
  const { notifications, loading, reload, unreadCount } = useNotifications();
  const toast = useToast();

  const [filter, setFilter] = useState<Filter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<NotificationDoc | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    if (filter === 'read') return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  const toggleRead = async (n: NotificationDoc) => {
    if (!profile) return;
    setBusyId(n.id);
    try {
      await markRead(profile.uid, n.id, !n.read);
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update');
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!profile || unreadCount === 0) return;
    setBulkBusy(true);
    try {
      await markAllRead(
        profile.uid,
        notifications.filter((n) => !n.read),
      );
      await reload();
      toast.success('All marked as read');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setBulkBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!profile || !confirmDelete) return;
    setDeleting(true);
    try {
      await deleteNotification(profile.uid, confirmDelete.id);
      await reload();
      toast.success('Notification deleted');
      setConfirmDelete(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Notifications
          </h1>
          <p className="text-xs text-muted mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'You are all caught up'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || bulkBusy}
          loading={bulkBusy}
        >
          <FiCheck size={14} /> Mark all read
        </Button>
      </div>

      <Tabs
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        tabs={[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          {
            id: 'read',
            label: `Read (${notifications.length - unreadCount})`,
          },
        ]}
      />

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center">
            <span className="h-6 w-6 border-2 border-border border-t-brand rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FiBell size={28} />}
            title={
              filter === 'unread'
                ? 'No unread notifications'
                : filter === 'read'
                  ? 'No read notifications'
                  : 'No notifications yet'
            }
            description="We'll let you know when something important happens."
          />
        ) : (
          <div className="divide-y divide-border -mx-5">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.info;
              return (
                <div
                  key={n.id}
                  className={`px-5 py-3.5 flex items-start gap-3 transition ${
                    !n.read ? 'bg-brand/5' : ''
                  }`}
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm ${
                          n.read ? 'text-muted' : 'text-white font-semibold'
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        n.read ? 'text-muted/70' : 'text-muted'
                      }`}
                    >
                      {n.body}
                    </p>
                    <p className="text-[10px] text-muted/60 mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleRead(n)}
                      disabled={busyId === n.id}
                      className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white disabled:opacity-50"
                      title={n.read ? 'Mark unread' : 'Mark read'}
                    >
                      {n.read ? <FiMail size={14} /> : <FiCheck size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(n)}
                      className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete notification?"
        message={
          <>
            Are you sure you want to delete{' '}
            <span className="text-white font-medium">
              "{confirmDelete?.title}"
            </span>
            ? This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        danger
      />
    </div>
  );
}