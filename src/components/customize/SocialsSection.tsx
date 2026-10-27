import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfileData } from '../../hooks/useProfile';
import {
  addSocial,
  updateSocial,
  deleteSocial,
  reorderSocials,
} from '../../services/profileService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { DragList } from '../common/DragList';
import { getSocialMeta, SOCIAL_ICONS } from '../../utils/socialIcons';
import { useToast } from '../../hooks/useToast';
import { SocialItem } from '../../types';
import { validateUrl } from '../../utils/validation';
import { FiEdit2, FiTrash2, FiShare2, FiEye, FiEyeOff } from 'react-icons/fi';

const PLATFORM_LIST = Object.keys(SOCIAL_ICONS);

interface FormState {
  platform: string;
  url: string;
  enabled: boolean;
}

const EMPTY_FORM: FormState = { platform: 'youtube', url: '', enabled: true };

export function SocialsSection() {
  const { profile } = useAuth();
  const { socials, reload } = useProfileData();
  const toast = useToast();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SocialItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<SocialItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const usedPlatforms = useMemo(
    () => new Set(socials.map((s) => s.platform)),
    [socials],
  );

  if (!profile) return null;

  const openCreate = (platform?: string) => {
    const firstFree = platform || PLATFORM_LIST.find((p) => !usedPlatforms.has(p));
    setForm({ ...EMPTY_FORM, platform: firstFree || 'youtube' });
    setError('');
    setCreating(true);
  };

  const openEdit = (s: SocialItem) => {
    setForm({ platform: s.platform, url: s.url, enabled: s.enabled });
    setError('');
    setEditing(s);
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
    setError('');
  };

  const submit = async () => {
    if (!form.url.trim()) {
      setError('URL required');
      return;
    }
    if (form.platform !== 'email') {
      const res = validateUrl(form.url);
      if (!res.valid) {
        setError(res.error || 'Invalid URL');
        return;
      }
    }
    setSaving(true);
    try {
      const isEmail = form.platform === 'email';
      const url = isEmail
        ? `mailto:${form.url.trim().replace(/^mailto:/, '')}`
        : form.url.startsWith('http')
          ? form.url
          : `https://${form.url}`;

      const payload = { platform: form.platform, url, enabled: form.enabled };

      if (editing) {
        await updateSocial(profile.uid, editing.id, payload);
      } else {
        await addSocial(profile.uid, {
          ...payload,
          order: socials.length,
          clicks: 0,
        });
      }
      await reload();
      closeModal();
      toast.success(editing ? 'Updated' : 'Added');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteSocial(profile.uid, confirmDelete.id);
      await reload();
      setConfirmDelete(null);
      toast.success('Deleted');
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (items: SocialItem[]) => {
    await reorderSocials(profile.uid, items);
    await reload();
  };

  const toggleEnabled = async (s: SocialItem) => {
    await updateSocial(profile.uid, s.id, { enabled: !s.enabled });
    await reload();
  };

  return (
    <section id="socials" className="scroll-mt-24">
      <Card title="Socials" description="Link your social media profiles">
        {/* ===== Grid picker — background removed, only logo ===== */}
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2 mb-4">
          {PLATFORM_LIST.map((p) => {
            const meta = getSocialMeta(p);
            const used = usedPlatforms.has(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => openCreate(p)}
                disabled={used}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
                  used
                    ? 'opacity-25 cursor-not-allowed'
                    : 'hover:scale-125 hover:bg-white/5 active:scale-95'
                }`}
                title={meta.label}
              >
                <img
                  src={meta.image}
                  alt={meta.label}
                  className="h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-lg"
                />
              </button>
            );
          })}
        </div>

        {socials.length === 0 ? (
          <EmptyState
            icon={<FiShare2 size={24} />}
            title="No socials yet"
            description="Pick a platform above to add"
          />
        ) : (
          <DragList
            items={socials}
            onReorder={handleReorder}
            renderItem={(s) => {
              const meta = getSocialMeta(s.platform);
              return (
                <div className="flex items-center gap-3 bg-bg-soft border border-border rounded-xl p-3">
                  {/* Only image, no background box */}
                  <img
                    src={meta.image}
                    alt={meta.label}
                    className="h-8 w-8 object-contain shrink-0 drop-shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted">{meta.label}</p>
                    <p className="text-xs text-white truncate">
                      {s.url.replace(/^mailto:/, '')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white"
                      title="Edit"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => toggleEnabled(s)}
                      className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white"
                      title={s.enabled ? 'Hide' : 'Show'}
                    >
                      {s.enabled ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(s)}
                      className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger"
                      title="Delete"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            }}
          />
        )}

        <Modal
          open={creating || !!editing}
          onClose={closeModal}
          title={
            editing
              ? 'Edit social'
              : `Add ${getSocialMeta(form.platform).label}`
          }
          footer={
            <>
              <Button variant="ghost" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={submit} loading={saving}>
                {editing ? 'Save' : 'Add'}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            {/* Preview — only logo, no background box */}
            {!editing && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-soft border border-border">
                <img
                  src={getSocialMeta(form.platform).image}
                  alt={getSocialMeta(form.platform).label}
                  className="h-9 w-9 object-contain drop-shadow-lg"
                />
                <div>
                  <p className="text-sm text-white font-medium">
                    {getSocialMeta(form.platform).label}
                  </p>
                  <p className="text-[10px] text-muted">Platform selected</p>
                </div>
              </div>
            )}

            <Input
              label={form.platform === 'email' ? 'Email address' : 'Profile URL'}
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder={
                form.platform === 'email'
                  ? 'you@example.com'
                  : `https://${form.platform}.com/you`
              }
            />
            <Switch
              checked={form.enabled}
              onChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
              label="Visible on profile"
              description="Turn off to hide without deleting"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>
        </Modal>

        <ConfirmDialog
          open={!!confirmDelete}
          title="Delete social?"
          message={
            <>
              Delete{' '}
              <span className="text-white font-medium">
                {confirmDelete && getSocialMeta(confirmDelete.platform).label}
              </span>
              ?
            </>
          }
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          loading={deleting}
          danger
        />
      </Card>
    </section>
  );
}