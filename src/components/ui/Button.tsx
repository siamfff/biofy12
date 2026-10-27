import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
 
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';
 
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}
 
export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  fullWidth,
  className,
  disabled,
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  const sizes: Record<Size, string> = {
    sm: 'text-xs px-3.5 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };
  const variants: Record<Variant, string> = {
    primary:
      'bg-gradient-brand text-white border border-brand/60 shadow-glow hover:shadow-glow-purple hover:brightness-110',
    secondary:
      'bg-bg-card/80 text-white border border-border hover:bg-bg-elevated hover:border-brand/50',
    ghost: 'text-muted hover:bg-white/5 hover:text-white',
    danger:
      'bg-danger text-white hover:brightness-110 shadow-[0_0_30px_-8px_rgba(239,68,68,0.6)]',
    outline:
      'bg-transparent text-white border border-border-strong hover:bg-brand/10 hover:border-brand/60',
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}