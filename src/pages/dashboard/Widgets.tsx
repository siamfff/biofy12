import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfileData } from '../../hooks/useProfile';
import {
  addWidget,
  updateWidget,
  deleteWidget,
  reorderWidgets,
} from '../../services/profileService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Switch } from '../../components/ui/Switch';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { DragList } from '../../components/common/DragList';
import { ProfilePreview } from '../../components/profile/ProfilePreview';
import { useToast } from '../../hooks/useToast';
import { WidgetItem } from '../../types';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiGrid,
  FiEye,
  FiEyeOff,
  FiMessageSquare,
  FiMusic,
  FiGithub,
  FiTwitter,
  FiImage,
  FiType,
} from 'react-icons/fi';

const WIDGET_META: Record<
  WidgetItem['type'],
  { label: string; icon: JSX.Element; color: string; description: string }
> = {
  discord: {
    label: 'Discord',
    icon: <FiMessageSquare size={14} />,
    color: '#5865F2',
    description: 'Show your Discord presence',
  },
  spotify: {
    label: 'Spotify',
    icon: <FiMusic size={14} />,
    color: '#1DB954',
    description: 'Now playing from Spotify',
  },
  github: {
    label: 'GitHub',
    icon: <FiGithub size={14} />,
    color: '#e5e7eb',
    description: 'GitHub contribution stats',
  },
  twitter: {
    label: 'Twitter / X',
    icon: <FiTwitter size={14} />,
    color: '#1DA1F2',
    description: 'Latest tweet or follower count',
  },
  text: {
    label: 'Text note',
    icon: <FiType size={14} />,
    color: '#22d3ee',
    description: 'A custom text block',
  },
  image: {
    label: 'Image',
    icon: <FiImage size={14} />,
    color: '#f59e0b',
    description: 'Embed an image via URL',
  },
};

const WIDGET_TYPES: WidgetItem['type'][] = [
  'discord',
  'spotify',
  'github',
  'twitter',
  'text',
  'image',
];

interface FormState {
  type: WidgetItem['type'];
  enabled: boolean;
  config: Record<string, any>;
}

const EMPTY_FORM: FormState = {
  type: 'text',
  enabled: true,
  config: {},
};

export default function Widgets() {
  const { profile } = useAuth();
  const { links, socials, widgets, loading, reload } = useProfileData();
  const toast = useToast();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WidgetItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<WidgetItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const enabledCount = useMemo(
    () => widgets.filter((w) => w.enabled).length,
    [widgets],
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError('');
    setCreating(true);
  };

  const openEdit = (w: WidgetItem) => {
    setForm({
      type: w.type,
      enabled: w.enabled,
      config: { ...(w.config || {}) },
    });
    setError('');
    setEditing(w);
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
    setError('');
  };

  const updateConfig = (key: string, value: any) => {
    setForm((f) => ({ ...f, config: { ...f.config, [key]: value } }));
  };

  const validate = (): boolean => {
    if (form.type === 'text' && !form.config.text?.trim()) {
      setError('Enter the text to display');
      return false;
    }
    if (form.type === 'image' && !form.config.url?.trim()) {
      setError('Enter an image URL');
      return false;
    }
    if (
      ['discord', 'spotify', 'github', 'twitter'].includes(form.type) &&
      !form.config.username?.trim() &&
      !form.config.url?.trim()
    ) {
      setError('Enter a username or profile URL');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!profile) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        enabled: form.enabled,
        config: form.config,
      };

      if (editing) {
        await updateWidget(profile.uid, editing.id, payload);
        toast.success('Widget updated');
      } else {
        await addWidget(profile.uid, {
          ...payload,
          order: widgets.length,
        });
        toast.success('Widget added');
      }
      await reload();
      closeModal();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save widget');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (w: WidgetItem) => {
    if (!profile) return;
    try {
      await updateWidget(profile.uid, w.id, { enabled: !w.enabled });
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!profile || !confirmDelete) return;
    setDeleting(true);
    try {
      await deleteWidget(profile.uid, confirmDelete.id);
      toast.success('Widget deleted');
      await reload();
      setConfirmDelete(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (items: WidgetItem[]) => {
    if (!profile) return;
    try {
      await reorderWidgets(profile.uid, items);
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reorder');
    }
  };

  const renderWidgetFields = () => {
    switch (form.type) {
      case 'text':
        return (
          <Textarea
            label="Text"
            value={form.config.text || ''}
            onChange={(e) => updateConfig('text', e.target.value)}
            placeholder="Write a short note..."
            rows={3}
            maxLength={200}
          />
        );
      case 'image':
        return (
          <Input
            label="Image URL"
            value={form.config.url || ''}
            onChange={(e) => updateConfig('url', e.target.value)}
            placeholder="https://example.com/image.png"
          />
        );
      default:
        return (
          <>
            <Input
              label="Username or profile URL"
              value={form.config.username || ''}
              onChange={(e) => updateConfig('username', e.target.value)}
              placeholder={
                form.type === 'discord' ? 'username#0000 or user ID' :
                form.type === 'spotify' ? 'spotify username' :
                form.type === 'github' ? 'github username' :
                'twitter username'
              }
            />
            <Input
              label="Optional URL override"
              value={form.config.url || ''}
              onChange={(e) => updateConfig('url', e.target.value)}
              placeholder="https://..."
            />
          </>
        );
    }
  };

  if (!profile) return null;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white font-display">
              Widgets
            </h1>
            <p className="text-xs text-muted mt-1">
              Add extra blocks to your profile · {enabledCount} active
            </p>
          </div>
          <Button onClick={openCreate}>
            <FiPlus size={14} /> Add widget
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="py-10 flex justify-center">
              <span className="h-6 w-6 border-2 border-border border-t-brand rounded-full animate-spin" />
            </div>
          ) : widgets.length === 0 ? (
            <EmptyState
              icon={<FiGrid size={28} />}
              title="No widgets yet"
              description="Add Discord, Spotify, GitHub, text notes and more to your profile."
              action={
                <Button size="sm" onClick={openCreate}>
                  <FiPlus size={14} /> Add your first widget
                </Button>
              }
            />
          ) : (
            <DragList
              items={widgets}
              onReorder={handleReorder}
              renderItem={(w) => {
                const meta = WIDGET_META[w.type];
                return (
                  <div className="flex items-center gap-3 bg-bg-soft border border-border rounded-xl p-3">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: meta.color + '22',
                        color: meta.color,
                      }}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {meta.label}
                      </p>
                      <p className="text-[11px] text-muted truncate">
                        {w.config?.text ||
                          w.config?.url ||
                          w.config?.username ||
                          meta.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleEnabled(w)}
                        className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white"
                        title={w.enabled ? 'Disable' : 'Enable'}
                      >
                        {w.enabled ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => openEdit(w)}
                        className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(w)}
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

        <Card title="Available widget types">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WIDGET_TYPES.map((t) => {
              const meta = WIDGET_META[t as WidgetItem['type']];
              return (
                <div
                  key={t}
                  className="rounded-xl border border-border bg-bg-soft p-3 flex items-start gap-3"
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: meta.color + '22',
                      color: meta.color,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium">{meta.label}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {meta.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="lg:sticky lg:top-6 h-fit">
        <p className="text-xs text-muted mb-2">Live preview</p>
        <ProfilePreview
          profile={profile}
          links={links}
          socials={socials}
          widgets={widgets}
        />
      </div>

      <Modal
        open={creating || !!editing}
        onClose={closeModal}
        title={editing ? 'Edit widget' : 'Add widget'}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving}>
              {editing ? 'Save changes' : 'Add widget'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as WidgetItem['type'],
                  config: {},
                }))
              }
              disabled={!!editing}
              className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white disabled:opacity-60"
            >
              {WIDGET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {WIDGET_META[t as WidgetItem['type']].label}
                </option>
              ))}
            </select>
          </div>

          {renderWidgetFields()}

          <Switch
            checked={form.enabled}
            onChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
            label="Visible on profile"
            description="Turn off to hide this widget without deleting it"
          />

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete widget?"
        message={
          <>
            Are you sure you want to delete the{' '}
            <span className="text-white font-medium">
              {confirmDelete && WIDGET_META[confirmDelete.type]?.label}
            </span>{' '}
            widget?
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