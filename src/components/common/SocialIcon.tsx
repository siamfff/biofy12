import { getSocialMeta } from '../../utils/socialIcons';
import { cn } from '../../utils/cn';

interface Props {
  platform: string;
  url: string;
  size?: 'sm' | 'md' | 'lg';
  monochrome?: boolean;
  color?: string;
  className?: string;
}

const SIZES = {
  sm: { box: 'h-10 w-10', icon: 22 },
  md: { box: 'h-12 w-12', icon: 28 },
  lg: { box: 'h-14 w-14', icon: 34 },
};

export function SocialIcon({
  platform,
  url,
  size = 'md',
  monochrome = false,
  color,
  className,
}: Props) {
  const meta = getSocialMeta(platform);
  const s = SIZES[size];
  const accentColor = monochrome ? color || '#94A3B8' : color || meta.color;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={meta.label}
      className={cn(
        'group relative flex items-center justify-center transition-all duration-300',
        'hover:scale-125 active:scale-95',
        s.box,
        className,
      )}
    >
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 24px ${accentColor}88`, filter: 'blur(8px)' }}
      />
      <img
        src={meta.image}
        alt={meta.label}
        className="relative z-10 object-contain transition-transform duration-300 drop-shadow-lg"
        style={{
          width: s.icon,
          height: s.icon,
          filter: monochrome ? 'grayscale(100%) brightness(1.3)' : undefined,
        }}
      />
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black border border-white/10 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
        {meta.label}
      </span>
    </a>
  );
}
