import { ReactNode } from 'react';
import { cn } from '../../utils/cn';
 
interface Props {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  glass?: boolean;
  noPadding?: boolean;
}
 
export function Card({
  title,
  description,
  action,
  children,
  className,
  glass = false,
  noPadding = false,
}: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border transition-all duration-200',
        glass ? 'bg-bg-card/70 backdrop-blur-xl' : 'bg-bg-card',
        'hover:border-brand/40 hover:shadow-[0_0_40px_-16px_rgba(168,85,247,0.5)]',
        noPadding ? '' : 'p-5',
        className,
      )}
    >
      {(title || action) && (
        <div className={cn('flex items-start justify-between gap-4', !noPadding && 'mb-4')}>
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-brand-soft font-display">{title}</h3>
            )}
            {description && <p className="text-xs text-muted mt-1">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
 