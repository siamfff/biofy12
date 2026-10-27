import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  children: ReactNode;
  color?: string;
  className?: string;
  icon?: ReactNode;
}

export function Badge({ children, color, className, icon }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border',
        className,
      )}
      style={{
        color: color || '#a78bfa',
        borderColor: (color || '#a78bfa') + '55',
        backgroundColor: (color || '#a78bfa') + '15',
      }}
    >
      {icon}
      {children}
    </span>
  );
}