import { useState } from 'react';
import { cn } from '../../utils/cn';

const ICONS = [
  'link', 'globe', 'star', 'heart', 'music', 'play', 'twitter', 'instagram',
  'youtube', 'twitch', 'github', 'discord', 'telegram', 'mail', 'shopping-bag',
  'sparkles', 'camera', 'gamepad', 'book', 'coffee', 'film', 'code',
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-bg-soft border border-border rounded-xl px-3.5 py-2.5 text-sm text-white"
      >
        <span className="capitalize">{value || 'Select icon'}</span>
        <span className="text-muted">▾</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full bg-bg-elevated border border-border rounded-xl p-2 grid grid-cols-6 gap-1 max-h-60 overflow-y-auto shadow-card">
          {ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onChange(i); setOpen(false); }}
              className={cn(
                'text-[11px] py-2 px-1 rounded-lg hover:bg-bg-card transition capitalize',
                value === i ? 'bg-brand text-white' : 'text-muted',
              )}
            >
              {i}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}