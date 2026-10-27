import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile, defaultAppearance } from '../../services/userService';
import { uploadBackground } from '../../services/storageService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { Switch } from '../../components/ui/Switch';
import { ColorPicker } from '../../components/common/ColorPicker';
import { FileUploader } from '../../components/common/FileUploader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ProfilePreview } from '../../components/profile/ProfilePreview';
import { useProfileData } from '../../hooks/useProfile';
import { useToast } from '../../hooks/useToast';
import { ALLOWED_BG_TYPES, MAX_BG_SIZE, THEMES } from '../../utils/constants';
import { AppearanceSettings } from '../../types';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { FiTrash2 } from 'react-icons/fi';

const BIO_WEIGHTS: { id: 'normal' | 'medium' | 'semibold' | 'bold'; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'medium', label: 'Medium' },
  { id: 'semibold', label: 'Semi-bold' },
  { id: 'bold', label: 'Bold' },
];

export default function Appearance() {
  const { profile, refreshProfile } = useAuth();
  const { links, socials, widgets } = useProfileData();
  const { upload } = useMediaUpload();
  const [state, setState] = useState<AppearanceSettings>(defaultAppearance());
  const [saving, setSaving] = useState(false);
  const [confirmDeleteBg, setConfirmDeleteBg] = useState(false);
  const [deletingBg, setDeletingBg] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (profile?.appearance) setState({ ...defaultAppearance(), ...profile.appearance });
  }, [profile?.uid]);

  const update = <K extends keyof AppearanceSettings>(k: K, v: AppearanceSettings[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const updateGlowTarget = (target: keyof AppearanceSettings['glowTargets'], v: boolean) =>
    setState((s) => ({
      ...s,
      glowTargets: { ...s.glowTargets, [target]: v },
    }));

  const applyTheme = (key: string) => {
    const t = THEMES[key];
    if (!t) return;
    setState((s) => ({ ...s, theme: key, primaryColor: t.primary, accentColor: t.accent }));
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, { appearance: state });
      await refreshProfile();
      toast.success('Appearance saved');
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onBgImage = async (file: File) => {
    if (!profile) return;
    const url = await upload('background', profile.uid, file);
    if (!url) return;
    const next = { ...state, backgroundType: 'image' as const, backgroundVideo: null };
    setState(next);
    await updateUserProfile(profile.uid, { backgroundUrl: url, appearance: next });
    await refreshProfile();
    toast.success('Background uploaded');
  };

  const onBgVideo = async (file: File) => {
    if (!profile) return;
    const url = await upload('video', profile.uid, file);
    if (!url) return;
    const next = { ...state, backgroundType: 'video' as const, backgroundVideo: url };
    setState(next);
    await updateUserProfile(profile.uid, { appearance: next });
    await refreshProfile();
    toast.success('Video background uploaded');
  };

  const handleDeleteBg = async () => {
    if (!profile) return;
    setDeletingBg(true);
    try {
      const next = { ...state, backgroundType: 'color' as const, backgroundVideo: null };
      setState(next);
      await updateUserProfile(profile.uid, {
        backgroundUrl: null,
        customBackground: null,
        appearance: next,
      });
      await refreshProfile();
      toast.success('Background removed');
      setConfirmDeleteBg(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to remove');
    } finally {
      setDeletingBg(false);
    }
  };

  if (!profile) return null;

  const hasBackground = state.backgroundType === 'image' || state.backgroundType === 'video';

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Appearance</h1>
          <p className="text-xs text-muted mt-1">Customize how your profile looks</p>
        </div>

        {/* Theme */}
        <Card title="Theme" description="Start with a preset">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => applyTheme(key)}
                className={`rounded-xl p-2 border transition ${
                  state.theme === key ? 'border-brand' : 'border-border hover:border-brand/50'
                }`}
              >
                <div
                  className="h-10 w-full rounded-lg mb-1"
                  style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}
                />
                <p className="text-[10px] text-white">{t.name}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Colors */}
        <Card title="Colors">
          <div className="grid sm:grid-cols-3 gap-3">
            <ColorPicker label="Primary" value={state.primaryColor} onChange={(v) => update('primaryColor', v)} />
            <ColorPicker label="Accent" value={state.accentColor} onChange={(v) => update('accentColor', v)} />
            <ColorPicker label="Text" value={state.textColor} onChange={(v) => update('textColor', v)} />
          </div>
        </Card>

        {/* Profile Opacity (glass panel) */}
        <Card
          title="Profile opacity"
          description="Glass panel behind your profile content. 0% = no panel, 100% = solid panel."
        >
          <Slider
            label="Panel opacity"
            value={state.profileOpacity ?? 0}
            suffix="%"
            onChange={(v) => update('profileOpacity', v)}
          />
          <p className="text-[11px] text-muted mt-2">
            Off (0%) → content directly on background · 100% → solid panel.
          </p>
        </Card>

        {/* Bio styling */}
        <Card title="Bio styling" description="Customize how your bio text appears">
          <div className="space-y-4">
            <ColorPicker
              label="Bio text color"
              value={state.bioColor || '#ffffff'}
              onChange={(v) => update('bioColor', v)}
            />

            <div>
              <label className="block text-xs font-medium text-muted mb-2">Font weight</label>
              <div className="grid grid-cols-4 gap-2">
                {BIO_WEIGHTS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => update('bioWeight', w.id)}
                    className={`px-3 py-2 rounded-lg text-xs transition border ${
                      state.bioWeight === w.id
                        ? 'border-brand bg-brand/10 text-white'
                        : 'border-border bg-bg-soft text-muted hover:text-white'
                    }`}
                    style={{
                      fontWeight:
                        w.id === 'normal' ? 400 :
                        w.id === 'medium' ? 500 :
                        w.id === 'semibold' ? 600 : 700,
                    }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            <Slider
              label="Bio text size"
              value={state.bioSize ?? 14}
              min={10}
              max={24}
              suffix="px"
              onChange={(v) => update('bioSize', v)}
            />
          </div>
        </Card>

        {/* Glow */}
        <Card title="Glow settings" description="Add glowing effects to profile elements">
          <div className="space-y-4">
            <Switch
              checked={state.glowEnabled ?? false}
              onChange={(v) => update('glowEnabled', v)}
              label="Enable glow"
              description="Apply a glow effect to selected elements"
            />

            {state.glowEnabled && (
              <>
                <ColorPicker
                  label="Glow color"
                  value={state.glowColor || state.primaryColor}
                  onChange={(v) => update('glowColor', v)}
                />
                <Slider
                  label="Glow intensity"
                  value={state.glowIntensity ?? 50}
                  suffix="%"
                  onChange={(v) => update('glowIntensity', v)}
                />
                <div>
                  <label className="block text-xs font-medium text-muted mb-2">Apply glow to</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'username' as const, label: 'Username' },
                      { id: 'avatar' as const, label: 'Avatar' },
                      { id: 'socials' as const, label: 'Socials' },
                      { id: 'badges' as const, label: 'Badges' },
                      { id: 'links' as const, label: 'Links' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          updateGlowTarget(t.id, !(state.glowTargets?.[t.id] ?? false))
                        }
                        className={`px-3 py-2 rounded-lg text-xs transition border text-left ${
                          state.glowTargets?.[t.id]
                            ? 'border-brand bg-brand/10 text-white'
                            : 'border-border bg-bg-soft text-muted hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Background */}
        <Card title="Background">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {(['color', 'gradient', 'image', 'video'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update('backgroundType', t)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize ${
                    state.backgroundType === t ? 'bg-gradient-brand text-white' : 'bg-bg-soft text-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {state.backgroundType === 'gradient' && (
              <input
                className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                value={state.backgroundGradient}
                onChange={(e) => update('backgroundGradient', e.target.value)}
              />
            )}

            {state.backgroundType === 'image' && (
              <div className="max-w-[260px]">
                <FileUploader
                  accept={ALLOWED_BG_TYPES.join(',')}
                  maxSize={MAX_BG_SIZE}
                  onFile={onBgImage}
                  preview={profile.backgroundUrl}
                  hint="JPG, PNG, WEBP · max 15 MB"
                  aspect="wide"
                />
              </div>
            )}

            {state.backgroundType === 'video' && (
              <div className="max-w-[260px]">
                <FileUploader
                  accept="video/mp4,video/webm,video/quicktime"
                  maxSize={20 * 1024 * 1024}
                  maxDurationSeconds={15}
                  kind="video"
                  onFile={onBgVideo}
                  preview={state.backgroundVideo}
                  label="Video background"
                  hint="MP4 / WebM · max 15 seconds · max 20 MB"
                  aspect="wide"
                />
              </div>
            )}

            {hasBackground && (
              <Button variant="danger" size="sm" onClick={() => setConfirmDeleteBg(true)}>
                <FiTrash2 size={12} /> Remove background
              </Button>
            )}

            <Slider label="Blur" value={state.backgroundBlur} max={40} suffix="px" onChange={(v) => update('backgroundBlur', v)} />
            <Slider label="Opacity" value={state.backgroundOpacity} suffix="%" onChange={(v) => update('backgroundOpacity', v)} />
          </div>
        </Card>

        {/* Card & Elements */}
        <Card title="Card & Elements">
          <div className="space-y-3">
            <Slider label="Card Blur" value={state.cardBlur} max={40} suffix="px" onChange={(v) => update('cardBlur', v)} />
            <Slider label="Card Opacity" value={state.cardOpacity} suffix="%" onChange={(v) => update('cardOpacity', v)} />
            <Slider label="Border Width" value={state.cardBorder} max={4} suffix="px" onChange={(v) => update('cardBorder', v)} />
            <Slider label="Border Radius" value={state.cardRadius} max={32} suffix="px" onChange={(v) => update('cardRadius', v)} />
            <Slider label="Shadow Intensity" value={state.shadowIntensity} suffix="%" onChange={(v) => update('shadowIntensity', v)} />
          </div>
        </Card>

        {/* Extras */}
        <Card title="Extras">
          <div className="space-y-3">
            <Switch
              checked={state.animationEnabled}
              onChange={(v) => update('animationEnabled', v)}
              label="Enable animations"
              description="Smooth transitions on your public profile"
            />
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Cursor Style</label>
              <select
                value={state.cursorStyle}
                onChange={(e) => update('cursorStyle', e.target.value)}
                className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white"
              >
                {['default', 'pointer', 'crosshair', 'custom-heart', 'custom-star', 'custom-glow'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Button onClick={save} loading={saving} fullWidth>Save appearance</Button>
      </div>

      <div className="lg:sticky lg:top-6 h-fit">
        <p className="text-xs text-muted mb-2">Live preview</p>
        <ProfilePreview
          profile={{ ...profile, appearance: state }}
          links={links}
          socials={socials}
          widgets={widgets}
        />
      </div>

      <ConfirmDialog
        open={confirmDeleteBg}
        title="Remove background?"
        message="Your background image or video will be removed."
        confirmLabel="Remove"
        onCancel={() => setConfirmDeleteBg(false)}
        onConfirm={handleDeleteBg}
        loading={deletingBg}
        danger
      />
    </div>
  );
}