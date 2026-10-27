import { useEffect, useState } from 'react';
import { FiGift, FiPlus, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  adminCreateRedeemCode,
  adminListRedeemCodes,
  adminDeleteRedeemCode,
  logAdminAction,
} from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { BADGE_IMAGES } from '../../utils/badgeImages';
import { formatDate } from '../../utils/format';

type CodeType = 'premium' | 'badge' | 'verified';

export default function AdminRedeem() {
  const { profile: admin } = useAuth();
  const toast = useToast();
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [type, setType] = useState<CodeType>('premium');
  const [days, setDays] = useState(30);
  const [badge, setBadge] = useState(Object.keys(BADGE_IMAGES)[0]);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    const list = await adminListRedeemCodes();
    setCodes(list);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const generate = () => {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    setCode(`NEBULA-${rand}`);
  };

  const handleCreate = async () => {
    if (!admin) return;
    if (!code.trim()) {
      toast.error('Enter a code');
      return;
    }
    setSaving(true);
    try {
      const value = type === 'premium' ? days : type === 'badge' ? badge : 'true';
      await adminCreateRedeemCode(code.trim(), type, value);
      await logAdminAction(
        admin.uid,
        admin.username || admin.displayName,
        'create_redeem_code',
        undefined,
        undefined,
        { code, type, value },
      );
      toast.success('Code created');
      setCreateOpen(false);
      setCode('');
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!admin || !confirmDelete) return;
    setDeleting(true);
    try {
      await adminDeleteRedeemCode(confirmDelete);
      await logAdminAction(
        admin.uid,
        admin.username || admin.displayName,
        'delete_redeem_code',
        undefined,
        undefined,
        { code: confirmDelete },
      );
      toast.success('Code deleted');
      setConfirmDelete(null);
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopied(c);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Redeem Codes</h1>
          <p className="text-xs text-muted mt-1">
            {codes.length} total · {codes.filter((c) => !c.used).length} unused
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <FiPlus size={14} /> Create Code
        </Button>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={32} />
          </div>
        ) : codes.length === 0 ? (
          <EmptyState
            icon={<FiGift size={28} />}
            title="No codes yet"
            description="Create your first redeem code"
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <FiPlus size={12} /> Create Code
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {codes.map((c) => (
              <div
                key={c.id}
                className="px-5 py-3 flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-lg bg-brand/15 text-brand-soft flex items-center justify-center shrink-0">
                  <FiGift size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono text-white truncate">{c.code}</p>
                  <p className="text-[10px] text-muted">
                    {c.type}
                    {c.type === 'premium' && ` · ${c.value} days`}
                    {c.type === 'badge' && ` · ${c.value}`}
                    {c.used && ` · USED`}
                    {c.createdAt && ` · ${formatDate(c.createdAt)}`}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(c.code)}
                  className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white"
                  title="Copy"
                >
                  {copied === c.code ? <FiCheck size={14} /> : <FiCopy size={14} />}
                </button>
                <button
                  onClick={() => setConfirmDelete(c.code)}
                  className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger"
                  title="Delete"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Redeem Code"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Code</label>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="NEBULA-XXXXXX"
              />
              <Button variant="secondary" onClick={generate}>
                Generate
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CodeType)}
              className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white"
            >
              <option value="premium">Premium</option>
              <option value="badge">Badge</option>
              <option value="verified">Verified</option>
            </select>
          </div>

          {type === 'premium' && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Days
              </label>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value) || 1)}
                min={1}
                max={3650}
              />
            </div>
          )}

          {type === 'badge' && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Badge
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white"
              >
                {Object.entries(BADGE_IMAGES).map(([k, m]) => (
                  <option key={k} value={k}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete code?"
        message={`Delete "${confirmDelete}"?`}
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        danger
      />
    </div>
  );
}