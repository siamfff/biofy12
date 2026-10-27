interface Props {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}

export function Slider({ label, value, min = 0, max = 100, step = 1, suffix = '', onChange }: Props) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-muted">{label}</label>
          <span className="text-xs text-white font-mono">{value}{suffix}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-brand"
      />
    </div>
  );
}