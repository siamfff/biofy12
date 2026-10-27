import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/userService';
import { uploadAudio } from '../../services/storageService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';
import { FileUploader } from '../common/FileUploader';
import { useToast } from '../../hooks/useToast';
import { MusicSettings } from '../../types';
import { ALLOWED_AUDIO_TYPES, MAX_AUDIO_SIZE } from '../../utils/constants';
import { validateUrl } from '../../utils/validation';
import { FiMusic, FiUpload, FiLink, FiTrash2 } from 'react-icons/fi';

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
    playerPosition: 'bottom',
  };
}

export function MusicSection() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [state, setState] = useState<MusicSettings>(defaultMusic());
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.music) {
      setState({ ...defaultMusic(), ...profile.music });
      setUrlInput(profile.music.url || '');
    }
  }, [profile?.uid]);

  if (!profile) return null;

  const update = <K extends keyof MusicSettings>(k: K, v: MusicSettings[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, { music: state });
      await refreshProfile();
      toast.success('Music saved');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
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
    toast.success('URL set');
  };

  const onAudioUpload = async (file: File) => {
    const url = await uploadAudio(profile.uid, file);
    update('url', url);
    setUrlInput(url);
    if (!state.title) update('title', file.name.replace(/\.[^.]+$/, ''));
    toast.success('Uploaded');
  };

  return (
    <section id="music" className="scroll-mt-24">
      <Card title="Music" description="Background track for your profile">
        <div className="space-y-4">
          <Switch
            checked={state.enabled}
            onChange={(v) => update('enabled', v)}
            label="Enable music"
            description="Show player on your profile"
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Song title"
              value={state.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Track title"
            />
            <Input
              label="Artist"
              value={state.artist}
              onChange={(e) => update('artist', e.target.value)}
              placeholder="Artist name"
            />
          </div>

          <Input
            label="Cover image URL (optional)"
            value={state.coverUrl || ''}
            onChange={(e) => update('coverUrl', e.target.value || null)}
            placeholder="https://example.com/cover.jpg"
          />

          <div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  mode === 'url' ? 'bg-gradient-brand text-white' : 'bg-bg-soft text-muted'
                }`}
              >
                <FiLink size={12} className="inline mr-1" /> URL
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  mode === 'upload' ? 'bg-gradient-brand text-white' : 'bg-bg-soft text-muted'
                }`}
              >
                <FiUpload size={12} className="inline mr-1" /> Upload
              </button>
            </div>

            {mode === 'url' ? (
              <div className="space-y-2 min-w-0">
                {/* URL input — full width, no overflow */}
                <div className="min-w-0 overflow-hidden">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/track.mp3"
                    className="!text-xs font-mono"
                  />
                </div>
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
                  hint="MP3, WAV, OGG · max 15 MB"
                />
              </div>
            )}
          </div>

          {/* Current audio card — URL truncates */}
          {state.url && (
            <div className="flex items-center gap-3 bg-bg-soft border border-border rounded-xl p-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                <FiMusic size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium truncate">
                  {state.title || 'Untitled'}
                </p>
                <p className="text-[10px] text-muted truncate">{state.url}</p>
              </div>
              <button
                onClick={() => {
                  setState((s) => ({ ...s, url: null, enabled: false }));
                  setUrlInput('');
                }}
                className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger shrink-0"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          )}

          <Slider
            label="Volume"
            value={state.volume}
            suffix="%"
            onChange={(v) => update('volume', v)}
          />

          <Switch checked={state.loop} onChange={(v) => update('loop', v)} label="Loop" />

          <Switch
            checked={state.autoplay}
            onChange={(v) => update('autoplay', v)}
            label="Autoplay"
            description="Browsers may block until user interacts"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update('playerStyle', 'full')}
              className={`rounded-xl border p-3 text-xs font-medium transition ${
                state.playerStyle === 'full'
                  ? 'border-brand bg-brand/10 text-white'
                  : 'border-border bg-bg-soft text-muted'
              }`}
            >
              Full Player
            </button>
            <button
              type="button"
              onClick={() => update('playerStyle', 'mini')}
              className={`rounded-xl border p-3 text-xs font-medium transition ${
                state.playerStyle === 'mini'
                  ? 'border-brand bg-brand/10 text-white'
                  : 'border-border bg-bg-soft text-muted'
              }`}
            >
              Mini Player
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update('playerPosition', 'top')}
              className={`rounded-xl border p-3 text-xs font-medium transition ${
                state.playerPosition === 'top'
                  ? 'border-brand bg-brand/10 text-white'
                  : 'border-border bg-bg-soft text-muted'
              }`}
            >
              Top
            </button>
            <button
              type="button"
              onClick={() => update('playerPosition', 'bottom')}
              className={`rounded-xl border p-3 text-xs font-medium transition ${
                state.playerPosition === 'bottom'
                  ? 'border-brand bg-brand/10 text-white'
                  : 'border-border bg-bg-soft text-muted'
              }`}
            >
              Bottom
            </button>
          </div>

          <Button onClick={save} loading={saving} fullWidth>
            Save music
          </Button>
        </div>
      </Card>
    </section>
  );
}