import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/userService';
import { uploadAudio } from '../../services/storageService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Slider } from '../../components/ui/Slider';
import { FileUploader } from '../../components/common/FileUploader';
import { ProfilePreview } from '../../components/profile/ProfilePreview';
import { useProfileData } from '../../hooks/useProfile';
import { useToast } from '../../hooks/useToast';
import { MusicSettings } from '../../types';
import { ALLOWED_AUDIO_TYPES, MAX_AUDIO_SIZE } from '../../utils/constants';
import { validateUrl } from '../../utils/validation';
import {
  FiMusic, FiUpload, FiLink, FiTrash2,
  FiLayout, FiChevronUp, FiChevronDown, FiMinus,
} from 'react-icons/fi';

type Mode = 'url' | 'upload';

function defaultMusic(): MusicSettings {
  return {
    enabled: false,
    url: null,
    title: '',
    artist: '',
    loop: true,
    autoplay: false,
    volume: 50,
    coverUrl: null,
    playerStyle: 'full',
    playerPosition: 'top',
  };
}

export default function Music() {
  const { profile, refreshProfile } = useAuth();
  const { links, socials, widgets } = useProfileData();
  const [state, setState] = useState<MusicSettings>(defaultMusic());
  const [mode, setMode] = useState<Mode>('url');
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (profile?.music) {
      setState({ ...defaultMusic(), ...profile.music });
      setUrlInput(profile.music.url || '');
    }
  }, [profile?.uid]);

  const update = <K extends keyof MusicSettings>(k: K, v: MusicSettings[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!profile) return;
    if (state.enabled && !state.url) {
      toast.error('Add an audio URL or upload a file first');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, { music: state });
      await refreshProfile();
      toast.success('Music settings saved');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const applyUrl = () => {
    const res = validateUrl(urlInput);
    if (!res.valid) {
      toast.error(res.error || 'Invalid URL');
      return;
    }
    const url = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
    update('url', url);
    toast.success('Audio URL set');
  };

  const onAudioUpload = async (file: File) => {
    if (!profile) return;
    try {
      const url = await uploadAudio(profile.uid, file);
      update('url', url);
      setUrlInput(url);
      if (!state.title) update('title', file.name.replace(/\.[^.]+$/, ''));
      toast.success('Audio uploaded');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    }
  };

  const clearAudio = () => {
    setState((s) => ({ ...s, url: null, enabled: false }));
    setUrlInput('');
    toast.info('Audio removed');
  };

  if (!profile) return null;

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Music</h1>
          <p className="text-xs text-muted mt-1">
            Add a background track that plays on your public profile
          </p>
        </div>

        <Card title="Enable music">
          <Switch
            checked={state.enabled}
            onChange={(v) => update('enabled', v)}
            label="Show music player on profile"
            description="Visitors can play/pause your track"
          />
        </Card>

        <Card title="Track info" description="What visitors will see on the player">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Song title"
                value={state.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Midnight Vibes"
                maxLength={80}
              />
              <Input
                label="Artist name"
                value={state.artist}
                onChange={(e) => update('artist', e.target.value)}
                placeholder="e.g. Nebula Beats"
                maxLength={80}
              />
            </div>

            <Input
              label="Cover image URL (optional)"
              value={state.coverUrl || ''}
              onChange={(e) => update('coverUrl', e.target.value || null)}
              placeholder="https://example.com/cover.jpg"
              hint="A square image works best (500×500)"
            />

            {(state.title || state.artist || state.coverUrl) && (
              <div className="rounded-xl border border-border bg-bg-soft p-3 flex items-center gap-3">
                <img
                  src={
                    state.coverUrl ||
                    `https://api.dicebear.com/7.x/shapes/svg?seed=${state.title || 'music'}`
                  }
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-semibold truncate">
                    {state.title || 'Untitled track'}
                  </p>
                  <p className="text-[11px] text-muted truncate">
                    {state.artist || 'Unknown artist'}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center">
                  <FiMusic size={14} className="text-white" />
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Audio source" description="Upload a file or paste a direct link">
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                  mode === 'url'
                    ? 'bg-gradient-brand text-white'
                    : 'bg-bg-soft text-muted hover:text-white'
                }`}
              >
                <FiLink size={12} /> Audio URL
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                  mode === 'upload'
                    ? 'bg-gradient-brand text-white'
                    : 'bg-bg-soft text-muted hover:text-white'
                }`}
              >
                <FiUpload size={12} /> Upload file
              </button>
            </div>

            {mode === 'url' ? (
              <div className="space-y-2">
                <Input
                  label="Audio URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/track.mp3"
                />
                <Button variant="secondary" size="sm" onClick={applyUrl}>
                  Set URL
                </Button>
              </div>
            ) : (
              <div className="max-w-[280px]">
                <FileUploader
                  accept={ALLOWED_AUDIO_TYPES.join(',')}
                  maxSize={MAX_AUDIO_SIZE}
                  onFile={onAudioUpload}
                  label="Audio file"
                  hint="MP3, WAV, OGG, M4A · max 15 MB"
                />
              </div>
            )}

            {state.url && (
              <div className="flex items-center gap-3 bg-bg-soft border border-border rounded-xl p-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                  <FiMusic size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">
                    {state.title || 'Untitled track'}
                  </p>
                  <p className="text-[10px] text-muted truncate">{state.url}</p>
                </div>
                <button
                  type="button"
                  onClick={clearAudio}
                  className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger"
                  title="Remove audio"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </Card>

        <Card
          title="Player layout"
          description="Choose how the music player appears on your profile"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-2">
                Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'full', label: 'Full', icon: <FiLayout size={14} />, desc: 'Cover + title + controls' },
                  { id: 'mini', label: 'Mini', icon: <FiMinus size={14} />, desc: 'Sound icon only' },
                  { id: 'none', label: 'Hidden', icon: <FiMinus size={14} />, desc: "Don't show" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update('playerStyle', opt.id as any)}
                    className={`rounded-xl border p-3 text-left transition ${
                      state.playerStyle === opt.id
                        ? 'border-brand bg-brand/10'
                        : 'border-border bg-bg-soft hover:border-brand/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-white mb-1">
                      {opt.icon}
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </div>
                    <p className="text-[10px] text-muted leading-tight">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-2">
                Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'top', label: 'Top', icon: <FiChevronUp size={14} />, desc: 'Below bio' },
                  { id: 'bottom', label: 'Bottom', icon: <FiChevronDown size={14} />, desc: 'Bottom of profile' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update('playerPosition', opt.id as any)}
                    className={`rounded-xl border p-3 text-left transition ${
                      state.playerPosition === opt.id
                        ? 'border-brand bg-brand/10'
                        : 'border-border bg-bg-soft hover:border-brand/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-white mb-1">
                      {opt.icon}
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </div>
                    <p className="text-[10px] text-muted leading-tight">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Player settings">
          <div className="space-y-4">
            <Slider
              label="Volume"
              value={state.volume}
              suffix="%"
              onChange={(v) => update('volume', v)}
            />
            <Switch
              checked={state.loop}
              onChange={(v) => update('loop', v)}
              label="Loop"
              description="Restart automatically when the track ends"
            />
            <Switch
              checked={state.autoplay}
              onChange={(v) => update('autoplay', v)}
              label="Autoplay"
              description="Try to start playing automatically (browsers may block until user interacts)"
            />
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-3 text-[11px] text-brand-soft flex items-start gap-2">
              <span className="shrink-0 mt-0.5">ℹ️</span>
              <span>
                Browsers block autoplay with sound. If autoplay is on, the
                track will start muted — visitors can unmute by clicking the
                volume icon.
              </span>
            </div>
          </div>
        </Card>

        <Button onClick={save} loading={saving} fullWidth>
          Save music settings
        </Button>
      </div>

      <div className="lg:sticky lg:top-6 h-fit">
        <p className="text-xs text-muted mb-2">Live preview</p>
        <ProfilePreview
          profile={{ ...profile, music: state }}
          links={links}
          socials={socials}
          widgets={widgets}
        />
      </div>
    </div>
  );
}