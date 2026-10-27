import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfileData } from '../../hooks/useProfile';
import {
  addLink,
  updateLink,
  deleteLink,
  reorderLinks,
} from '../../services/profileService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { DragList } from '../../components/common/DragList';
import { IconPicker } from '../../components/common/IconPicker';
import { ProfilePreview } from '../../components/profile/ProfilePreview';
import { SocialsSection } from '../../components/customize/SocialsSection';
import { useToast } from '../../hooks/useToast';
import { LinkItem } from '../../types';
import { validateUrl } from '../../utils/validation';
import {
  FiPlus, FiEdit2, FiTrash2, FiLink, FiExternalLink, FiEye, FiEyeOff,
} from 'react-icons/fi';

interface FormState {
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
}

const EMPTY_FORM: FormState = { label: '', url: '', icon: 'link', enabled: true };

export default function Links() {
  const { profile } = useAuth();
  const { links, socials, widgets, loading, reload } = useProfileData();
  const toast = useToast();

  const [editing, setEditing] = useState<LinkItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<LinkItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const enabledCount = useMemo(() => links.filter((l) => l.enabled).length, [links]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError('');
    setCreating(true);
  };

  const openEdit = (link: LinkItem) => {
    setForm({ label: link.label, url: link.url, icon: link.icon || 'link', enabled: link.enabled });
    setError('');
    setEditing(link);
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
    setError('');
  };

  const validateForm = (): boolean => {
    if (!form.label.trim()) {
      setError('Label is required');
      return false;
    }
    const urlRes = validateUrl(form.url);
    if (!urlRes.valid) {
      setError(urlRes.error || 'Invalid URL');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!profile) return;
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        url: form.url.startsWith('http') ? form.url : `https://${form.url}`,
        icon: form.icon || 'link',
        enabled: form.enabled,
      };

      if (editing) {
        await updateLink(profile.uid, editing.id, payload);
      } else {
        await addLink(profile.uid, { ...payload, order: links.length, clicks: 0 });
      }
      await reload();
      closeModal();
      toast.success(editing ? 'Link updated' : 'Link added');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (link: LinkItem) => {
    if (!profile) return;
    await updateLink(profile.uid, link.id, { enabled: !link.enabled });
    await reload();
  };

  const handleDelete = async () => {
    if (!profile || !confirmDelete) return;
    setDeleting(true);
    try {
      await deleteLink(profile.uid, confirmDelete.id);
      await reload();
      setConfirmDelete(null);
      toast.success('Deleted');
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (items: LinkItem[]) => {
    if (!profile) return;
    await reorderLinks(profile.uid, items);
    await reload();
  };

  if (!profile) return null;

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white font-display">Links</h1>
            <p className="text-xs text-muted mt-1">
              Links & socials · {enabledCount} visible links
            </p>
          </div>
          <Button onClick={openCreate}>
            <FiPlus size={14} /> Add link
          </Button>
        </div>

        {/* Links list */}
        <Card title="Your links" description="Click a button on your profile">
          {loading ? (
            <div className="py-10 flex justify-center">
              <span className="h-6 w-6 border-2 border-border border-t-brand rounded-full animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <EmptyState
              icon={<FiLink size={28} />}
              title="No links yet"
              description="Add your first link"
              action={
                <Button size="sm" onClick={openCreate}>
                  <FiPlus size={14} /> Add link
                </Button>
              }
            />
          ) : (
            <DragList
              items={links}
              onReorder={handleReorder}
              renderItem={(link) => (
                <div className="flex items-center gap-3 bg-bg-soft border border-border rounded-xl p-3">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      link.enabled ? 'bg-brand/15 text-brand-soft' : 'bg-bg-elevated text-muted'
                    }`}
                  >
                    <FiLink size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{link.label}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-muted hover:text-brand-soft truncate inline-flex items-center gap-1 max-w-full"
                    >
                      <span className="truncate">{link.url}</span>
                      <FiExternalLink size={10} className="shrink-0" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleEnabled(link)}
                      className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white"
                    >
                      {link.enabled ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => openEdit(link)}
                      className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(link)}
                      className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </Card>

        {/* Socials section — moved from Customize */}
        <SocialsSection />
      </div>

      <div className="lg:sticky lg:top-6 h-fit">
        <p className="text-xs text-muted mb-2">Live preview</p>
        <ProfilePreview profile={profile} links={links} socials={socials} widgets={widgets} />
      </div>

      <Modal
        open={creating || !!editing}
        onClose={closeModal}
        title={editing ? 'Edit link' : 'Add link'}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button onClick={submit} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Label"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="e.g. My website"
            maxLength={40}
          />
          <Input
            label="URL"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://example.com"
          />
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Icon</label>
            <IconPicker value={form.icon} onChange={(v) => setForm((f) => ({ ...f, icon: v }))} />
          </div>
          <Switch
            checked={form.enabled}
            onChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
            label="Visible on profile"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete link?"
        message={`Delete "${confirmDelete?.label}"?`}
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        danger
      />
    </div>
  );
}