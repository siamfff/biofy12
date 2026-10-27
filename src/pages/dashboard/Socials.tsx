import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfileData } from '../../hooks/useProfile';
import {
  addSocial,
  updateSocial,
  deleteSocial,
  reorderSocials,
} from '../../services/profileService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { DragList } from '../../components/common/DragList';
import { ProfilePreview } from '../../components/profile/ProfilePreview';
import { useToast } from '../../hooks/useToast';
import { SocialItem } from '../../types';
import { getSocialMeta, SOCIAL_ICONS } from '../../utils/socialIcons';
import { validateUrl } from '../../utils/validation';
import {
  FiEdit2,
  FiTrash2,
  FiShare2,
  FiEye,
  FiEyeOff,
  FiPlus,
} from 'react-icons/fi';

const PLATFORM_LIST = Object.keys(SOCIAL_ICONS);

interface FormState {
  platform: string;
  url: string;
  enabled: boolean;
}

const EMPTY_FORM: FormState = {
  platform: 'youtube',
  url: '',
  enabled: true,
};

export default function Socials() {
  const { profile } = useAuth();
  const { links, socials, widgets, loading, reload } = useProfileData();
  const toast = useToast();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SocialItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<SocialItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const enabledCount = useMemo(
    () => socials.filter((s) => s.enabled).length,
    [socials],
  );

  const usedPlatforms = useMemo(
    () => new Set(socials.map((s) => s.platform)),
    [socials],
  );

  const openPickerFor = (platform: string) => {
    setForm({ platform, url: '', enabled: true });
    setError('');
    setPickerOpen(false);
    setCreating(true);
  };

  const openCustomUrl = () => {
    setForm({ platform: 'website', url: '', enabled: true });
    setError('');
    setPickerOpen(false);
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

  const validate = (): boolean => {
    if (!form.platform) {
      setError('Pick a platform');
      return false;
    }
    if (!form.url.trim()) {
      setError('URL is required');
      return false;
    }
    if (form.platform !== 'email') {
      const res = validateUrl(form.url);
      if (!res.valid) {
        setError(res.error || 'Invalid URL');
        return false;
      }
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(form.url.trim().replace(/^mailto:/, ''))) {
        setError('Invalid email');
        return false;
      }
    }
    return true;
  };

  const submit = async () => {
    if (!profile) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const isEmail = form.platform === 'email';
      const url = isEmail
        ? `mailto:${form.url.trim().replace(/^mailto:/, '')}`
        : form.url.startsWith('http')
          ? form.url
          : `https://${form.url}`;

      const payload = {
        platform: form.platform,
        url,
        enabled: form.enabled,
      };

      if (editing) {
        await updateSocial(profile.uid, editing.id, payload);
        toast.success('Social updated');
      } else {
        await addSocial(profile.uid, {
          ...payload,
          order: socials.length,
          clicks: 0,
        });
        toast.success('Social added');
      }
      await reload();
      closeModal();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save social');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (s: SocialItem) => {
    if (!profile) return;
    try {
      await updateSocial(profile.uid, s.id, { enabled: !s.enabled });
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!profile || !confirmDelete) return;
    setDeleting(true);
    try {
      await deleteSocial(profile.uid, confirmDelete.id);
      toast.success('Social deleted');
      await reload();
      setConfirmDelete(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (items: SocialItem[]) => {
    if (!profile) return;
    try {
      await reorderSocials(profile.uid, items);
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reorder');
    }
  };

  if (!profile) return null;

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white font-display">Socials</h1>
            <p className="text-xs text-muted mt-1">
              Link your social media profiles · {enabledCount} visible
            </p>
          </div>
          <Button onClick={() => setPickerOpen(true)}>
            <FiPlus size={14} /> Add Social
          </Button>
        </div>

        {/* Platform picker grid */}
        <Card title="Pick a social media to add to your profile">
          <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-10 gap-2">
            {PLATFORM_LIST.map((p) => {
              const meta = getSocialMeta(p);
              const used = usedPlatforms.has(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => openPickerFor(p)}
                  disabled={used}
                  className={`aspect-square rounded-xl border flex items-center justify-center transition ${
                    used
                      ? 'border-border/40 bg-bg-soft opacity-30 cursor-not-allowed'
                      : 'border-border bg-bg-card hover:border-brand/60 hover:scale-110 hover:bg-bg-elevated'
                  }`}
                  title={used ? `${meta.label} (already added)` : `Add ${meta.label}`}
                >
                  <img
                    src={meta.image}
                    alt={meta.label}
                    className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                  />
                </button>
              );
            })}
          </div>

          {/* Add Custom URL */}
          <button
            type="button"
            onClick={openCustomUrl}
            className="mt-3 w-full flex items-center gap-3 rounded-xl border border-dashed border-border bg-bg-soft hover:border-brand/60 hover:bg-bg-elevated transition p-4"
          >
            <div className="h-10 w-10 rounded-lg bg-bg-card border border-border flex items-center justify-center shrink-0">
              <FiPlus size={18} className="text-brand" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Add Custom URL</p>
              <p className="text-[11px] text-muted">
                Use your own URL and choose an icon to match.
              </p>
            </div>
          </button>
        </Card>

        {/* Added socials list */}
        <Card title="Your socials" description="Drag to reorder · toggle to show/hide">
          {loading ? (
            <div className="py-10 flex justify-center">
              <span className="h-6 w-6 border-2 border-border border-t-brand rounded-full animate-spin" />
            </div>
          ) : socials.length === 0 ? (
            <EmptyState
              icon={<FiShare2 size={28} />}
              title="No socials yet"
              description="Pick a platform from above to add your first social."
            />
          ) : (
            <DragList
              items={socials}
              onReorder={handleReorder}
              renderItem={(s) => {
                const meta = getSocialMeta(s.platform);
                return (
                  <div className="flex items-center gap-3 bg-bg-soft border border-border rounded-xl p-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: meta.color + '22' }}
                    >
                      <img
                        src={meta.image}
                        alt={meta.label}
                        className="h-6 w-6 object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted">{meta.label}</p>
                      <p className="text-sm text-white truncate font-medium">
                        {s.url.replace(/^mailto:/, '')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => toggleEnabled(s)}
                        className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white"
                        title={s.enabled ? 'Hide' : 'Show'}
                      >
                        {s.enabled ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(s)}
                        className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </Card>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-6 h-fit">
        <p className="text-xs text-muted mb-2">Live preview</p>
        <ProfilePreview
          profile={profile}
          links={links}
          socials={socials}
          widgets={widgets}
        />
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={creating || !!editing}
        onClose={closeModal}
        title={
          editing
            ? `Edit ${getSocialMeta(form.platform).label}`
            : `Add ${getSocialMeta(form.platform).label}`
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving}>
              {editing ? 'Save changes' : 'Add'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Platform selector (only for custom URL) */}
          {!editing && form.platform === 'website' && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Platform icon
              </label>
              <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto">
                {PLATFORM_LIST.map((p) => {
                  const meta = getSocialMeta(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, platform: p }))}
                      className={`aspect-square rounded-lg border flex items-center justify-center transition ${
                        form.platform === p
                          ? 'border-brand bg-brand/10'
                          : 'border-border bg-bg-soft hover:border-brand/50'
                      }`}
                      title={meta.label}
                    >
                      <img
                        src={meta.image}
                        alt={meta.label}
                        className="h-5 w-5 object-contain"
                      />
                    </button>
                  );
                })}
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
                : `https://${form.platform}.com/yourname`
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

      {/* Platform picker modal */}
      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Pick a social media"
        size="lg"
      >
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 gap-2">
          {PLATFORM_LIST.map((p) => {
            const meta = getSocialMeta(p);
            const used = usedPlatforms.has(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => openPickerFor(p)}
                disabled={used}
                className={`aspect-square rounded-xl border flex items-center justify-center transition ${
                  used
                    ? 'border-border/40 bg-bg-soft opacity-30 cursor-not-allowed'
                    : 'border-border bg-bg-card hover:border-brand/60 hover:scale-110 hover:bg-bg-elevated'
                }`}
                title={used ? `${meta.label} (already added)` : `Add ${meta.label}`}
              >
                <img
                  src={meta.image}
                  alt={meta.label}
                  className="h-8 w-8 object-contain"
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={openCustomUrl}
          className="mt-4 w-full flex items-center gap-3 rounded-xl border border-dashed border-border bg-bg-soft hover:border-brand/60 hover:bg-bg-elevated transition p-4"
        >
          <div className="h-10 w-10 rounded-lg bg-bg-card border border-border flex items-center justify-center shrink-0">
            <FiPlus size={18} className="text-brand" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Add Custom URL</p>
            <p className="text-[11px] text-muted">
              Use your own URL and choose an icon to match.
            </p>
          </div>
        </button>
      </Modal>

      {/* Delete confirm */}
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
    </div>
  );
}