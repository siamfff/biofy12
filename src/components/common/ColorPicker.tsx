interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function ColorPicker({ label, value, onChange }: Props) {
  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      <div className="flex items-center gap-2 bg-bg-soft border border-border rounded-xl p-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 rounded-lg cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white font-mono focus:outline-none"
        />
      </div>
    </div>
  );
}