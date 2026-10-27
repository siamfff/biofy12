import { useEffect, useState } from 'react';
import { FiBell, FiSend, FiUsers, FiUser } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { fetchAllUsers, sendNotificationToUser, logAdminAction } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { UserDoc } from '../../types';

type Target = 'single' | 'all';

export default function AdminNotifications() {
  const { profile: admin } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Target>('all');
  const [selectedUid, setSelectedUid] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchAllUsers().then((u) => {
      setUsers(u);
      if (u.length > 0) setSelectedUid(u[0].uid);
    }).finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!admin) return;
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message required');
      return;
    }

    if (target === 'single' && !selectedUid) {
      toast.error('Select a user');
      return;
    }

    setSending(true);
    setProgress(0);
    try {
      const targets = target === 'single' ? [selectedUid] : users.map((u) => u.uid);

      for (let i = 0; i < targets.length; i++) {
        await sendNotificationToUser(targets[i], title.trim(), body.trim(), type);
        setProgress(Math.round(((i + 1) / targets.length) * 100));
      }

      await logAdminAction(
        admin.uid,
        admin.username || admin.displayName,
        'send_notification',
        target === 'single' ? selectedUid : undefined,
        undefined,
        { title, target, count: targets.length },
      );

      toast.success(`Sent to ${targets.length} user${targets.length > 1 ? 's' : ''}`);
      setTitle('');
      setBody('');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSending(false);
      setProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Send Notifications</h1>
        <p className="text-xs text-muted mt-1">
          Broadcast messages to users
        </p>
      </div>

      <Card title="Notification">
        <div className="space-y-4">
          {/* Target */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2">
              Send to
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTarget('all')}
                className={
                  'rounded-xl border p-3 text-left transition ' +
                  (target === 'all'
                    ? 'border-brand bg-brand/10'
                    : 'border-border bg-bg-soft hover:border-brand/40')
                }
              >
                <div className="flex items-center gap-2 text-white mb-1">
                  <FiUsers size={14} />
                  <span className="text-xs font-semibold">All users</span>
                </div>
                <p className="text-[10px] text-muted">{users.length} recipients</p>
              </button>
              <button
                type="button"
                onClick={() => setTarget('single')}
                className={
                  'rounded-xl border p-3 text-left transition ' +
                  (target === 'single'
                    ? 'border-brand bg-brand/10'
                    : 'border-border bg-bg-soft hover:border-brand/40')
                }
              >
                <div className="flex items-center gap-2 text-white mb-1">
                  <FiUser size={14} />
                  <span className="text-xs font-semibold">Single user</span>
                </div>
                <p className="text-[10px] text-muted">Pick one</p>
              </button>
            </div>
          </div>

          {target === 'single' && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                User
              </label>
              <select
                value={selectedUid}
                onChange={(e) => setSelectedUid(e.target.value)}
                className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white"
              >
                {users.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.displayName || u.username} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['info', 'success', 'warning', 'error'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={
                    'rounded-lg px-3 py-2 text-xs font-medium capitalize transition border ' +
                    (type === t
                      ? t === 'info'
                        ? 'border-brand bg-brand/15 text-white'
                        : t === 'success'
                          ? 'border-success bg-success/15 text-white'
                          : t === 'warning'
                            ? 'border-warning bg-warning/15 text-white'
                            : 'border-danger bg-danger/15 text-white'
                      : 'border-border bg-bg-soft text-muted hover:text-white')
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            maxLength={80}
          />

          <Textarea
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Notification body…"
            rows={4}
            maxLength={500}
            hint={`${body.length}/500`}
          />

          {sending && progress > 0 && (
            <div className="w-full h-2 rounded-full bg-bg-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <Button onClick={handleSend} loading={sending} fullWidth>
            <FiSend size={14} />
            {target === 'all'
              ? `Send to all ${users.length} users`
              : 'Send to user'}
          </Button>
        </div>
      </Card>
    </div>
  );
}