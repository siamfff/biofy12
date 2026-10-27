import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TabItem { id: string; label: string; icon?: ReactNode; }

interface Props {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, value, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-bg-soft border border-border rounded-xl overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap',
            value === t.id ? 'bg-brand text-white' : 'text-muted hover:text-white hover:bg-bg-elevated',
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}