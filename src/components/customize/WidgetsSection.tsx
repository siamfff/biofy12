import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfileData } from '../../hooks/useProfile';
import {
  addWidget,
  updateWidget,
  deleteWidget,
  reorderWidgets,
} from '../../services/profileService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { DragList } from '../common/DragList';
import { useToast } from '../../hooks/useToast';
import { WidgetItem } from '../../types';
import { WIDGET_TYPES } from '../../utils/constants';
import { FiPlus, FiEdit2, FiTrash2, FiGrid } from 'react-icons/fi';

const WIDGET_META: Record<string, { label: string; icon: string }> = {
  discord: { label: 'Discord', icon: '💬' },
  spotify: { label: 'Spotify', icon: '🎵' },
  github: { label: 'GitHub', icon: '🐙' },
  twitter: { label: 'Twitter', icon: '🐦' },
  text: { label: 'Text Note', icon: '📝' },
  image: { label: 'Image', icon: '🖼️' },
};

export function WidgetsSection() {
  const { profile } = useAuth();
  const { widgets, reload } = useProfileData();
  const toast = useToast();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WidgetItem | null>(null);
  const [type, setType] = useState<WidgetItem['type']>('text');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<WidgetItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!profile) return null;

  const openCreate = () => {
    setType('text');
    setConfig({});
    setCreating(true);
  };

  const openEdit = (w: WidgetItem) => {
    setType(w.type);
    setConfig({ ...(w.config || {}) });
    setEditing(w);
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = { type, enabled: true, config };
      if (editing) {
        await updateWidget(profile.uid, editing.id, payload);
      } else {
        await addWidget(profile.uid, { ...payload, order: widgets.length });
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
      await deleteWidget(profile.uid, confirmDelete.id);
      await reload();
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (items: WidgetItem[]) => {
    await reorderWidgets(profile.uid, items);
    await reload();
  };

  return (
    <section id="widgets" className="scroll-mt-24">
      <Card
        title="Widgets"
        description="Extra blocks for your profile"
        action={
          <Button size="sm" onClick={openCreate}>
            <FiPlus size={12} /> Add
          </Button>
        }
      >
        {widgets.length === 0 ? (
          <EmptyState icon={<FiGrid size={24} />} title="No widgets" />
        ) : (
          <DragList
            items={widgets}
            onReorder={handleReorder}
            renderItem={(w) => (
              <div className="flex items-center gap-3 bg-bg-soft border border-border rounded-xl p-3">
                <div className="h-9 w-9 rounded-lg bg-bg-card flex items-center justify-center text-lg shrink-0">
                  {WIDGET_META[w.type]?.icon || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{WIDGET_META[w.type]?.label}</p>
                  {w.config?.text && <p className="text-[10px] text-muted truncate">{w.config.text}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(w)} className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white">
                    <FiEdit2 size={13} />
                  </button>
                  <button onClick={() => setConfirmDelete(w)} className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          />
        )}

        <Modal
          open={creating || !!editing}
          onClose={closeModal}
          title={editing ? 'Edit widget' : 'Add widget'}
          footer={
            <>
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button onClick={submit} loading={saving}>Save</Button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as WidgetItem['type'])}
                className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white"
              >
                {WIDGET_TYPES.map((t) => (
                  <option key={t} value={t}>{WIDGET_META[t]?.label || t}</option>
                ))}
              </select>
            </div>
            {type === 'text' && (
              <input
                value={config.text || ''}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                placeholder="Text to show"
                className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white"
              />
            )}
            {type === 'image' && (
              <input
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="Image URL"
                className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white"
              />
            )}
            {['discord', 'spotify', 'github', 'twitter'].includes(type) && (
              <input
                value={config.username || ''}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="Username"
                className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white"
              />
            )}
          </div>
        </Modal>

        <ConfirmDialog
          open={!!confirmDelete}
          title="Delete widget?"
          message="This will be removed."
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