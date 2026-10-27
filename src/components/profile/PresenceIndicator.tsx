import { useEffect, useState } from 'react';
import { getPresenceStatus } from '../../utils/presence';
import { cn } from '../../utils/cn';

interface Props {
  user: any;
  className?: string;
  showText?: boolean;
}

export function PresenceIndicator({
  user,
  className,
  showText = true,
}: Props) {
  const [status, setStatus] = useState(getPresenceStatus(user));

  // Recompute every 30s so status updates without needing a refresh
  useEffect(() => {
    setStatus(getPresenceStatus(user));
    const interval = setInterval(() => {
      setStatus(getPresenceStatus(user));
    }, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-medium',
        className,
      )}
      style={{ color: status.color }}
    >
      <span className="relative flex h-2 w-2">
        {status.isOnline && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              status.dotClass,
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            status.dotClass,
          )}
        />
      </span>
      {showText && <span>{status.statusText}</span>}
    </div>
  );
}