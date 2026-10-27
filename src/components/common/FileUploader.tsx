import { useRef, useState, DragEvent } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from '../ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  accept: string;
  maxSize: number;
  onFile: (file: File) => Promise<void> | void;
  label?: string;
  hint?: string;
  preview?: string | null;
  aspect?: 'square' | 'wide';
  maxDurationSeconds?: number;
  premiumMaxDurationSeconds?: number;
  kind?: 'image' | 'audio' | 'video';
}

export function FileUploader({
  accept,
  maxSize,
  onFile,
  label,
  hint,
  preview,
  aspect = 'square',
  maxDurationSeconds,
  premiumMaxDurationSeconds,
  kind = 'image',
}: Props) {
  const { profile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const isPremium = profile?.premium === true;

  // Determine effective max duration based on premium status
  const effectiveMaxDuration =
    isPremium && premiumMaxDurationSeconds
      ? premiumMaxDurationSeconds
      : maxDurationSeconds;

  const getDuration = (file: File): Promise<number> => {
    if (!file) return Promise.reject(new Error('Invalid file'));
    return new Promise((resolve, reject) => {
      const el = document.createElement(kind === 'video' ? 'video' : 'audio');
      el.preload = 'metadata';
      el.onloadedmetadata = () => {
        URL.revokeObjectURL(el.src);
        resolve(el.duration || 0);
      };
      el.onerror = () => reject(new Error('Could not read file'));
      el.src = URL.createObjectURL(file);
    });
  };

  const handle = async (file: File) => {
    setError(null);
    setProgress(0);

    if (!file || typeof file.type !== 'string') {
      setError('Invalid file');
      return;
    }

    const list = (accept || '').split(',').map((s) => s.trim()).filter(Boolean);
    const typeOk = list.some((t) =>
      t.endsWith('/*') ? file.type.startsWith(t.replace('/*', '/')) : file.type === t,
    );
    if (!typeOk) {
      setError(`Invalid file type: ${file.type || 'unknown'}`);
      return;
    }

    if (file.size > maxSize) {
      setError(`Max size ${(maxSize / 1024 / 1024).toFixed(1)} MB`);
      return;
    }

    if (effectiveMaxDuration && (kind === 'video' || kind === 'audio')) {
      try {
        const dur = await getDuration(file);
        if (dur > effectiveMaxDuration + 0.5) {
          if (!isPremium && premiumMaxDurationSeconds) {
            setError(
              `Free users: max ${effectiveMaxDuration}s. Upgrade to Premium for up to ${premiumMaxDurationSeconds}s.`,
            );
          } else {
            setError(`Max duration ${effectiveMaxDuration} seconds`);
          }
          return;
        }
      } catch {
        setError('Could not read file');
        return;
      }
    }

    setBusy(true);
    try {
      await onFile(file);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setBusy(false);
      setProgress(100);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handle(f);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(true);
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
  };

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-muted">{label}</label>
          {premiumMaxDurationSeconds && (
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-medium',
                isPremium
                  ? 'bg-brand/15 text-brand-soft'
                  : 'bg-warning/15 text-warning',
              )}
            >
              {isPremium
                ? `⭐ Premium: up to ${premiumMaxDurationSeconds}s`
                : `Free: ${maxDurationSeconds}s`}
            </span>
          )}
        </div>
      )}
      <div
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden',
          'bg-bg-soft hover:bg-bg-elevated border-border',
          drag && 'border-brand bg-brand/5 scale-[1.01] shadow-glow',
          aspect === 'square' ? 'aspect-square' : 'aspect-video',
        )}
      >
        {preview ? (
          kind === 'video' ? (
            <video
              src={preview}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : kind === 'audio' ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-4 gap-2">
              <span className="text-3xl">🎵</span>
              <span className="text-xs text-muted">Audio loaded</span>
            </div>
          ) : (
            <img src={preview} alt="preview" className="h-full w-full object-cover" />
          )
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-sm text-white font-medium">
              {drag ? 'Drop it here!' : 'Click or drop file'}
            </p>
            {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Spinner size={28} />
            {progress > 0 && progress < 100 && (
              <span className="text-xs text-white font-mono">{progress}%</span>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          e.currentTarget.value = '';
        }}
      />
    </div>
  );
}