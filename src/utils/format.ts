export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function formatDate(ts: any): string {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function timeAgo(ts: any): string {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(ts);
}

/**
 * Format remaining cooldown time in human-readable form.
 * Input: milliseconds
 */
export function formatCooldown(ms: number): string {
  if (ms <= 0) return 'Available now';

  const totalMinutes = Math.floor(ms / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays > 0) {
    const remainingHours = totalHours - totalDays * 24;
    return `${totalDays}d ${remainingHours}h remaining`;
  }
  if (totalHours > 0) {
    const remainingMinutes = totalMinutes - totalHours * 60;
    return `${totalHours}h ${remainingMinutes}m remaining`;
  }
  return `${totalMinutes}m remaining`;
}

/**
 * Check if username can be changed.
 * Returns:
 *  - { canChange: true } if never changed or 3+ days passed
 *  - { canChange: false, remainingMs, remainingText } otherwise
 */
export function getUsernameChangeStatus(usernameChangedAt: any): {
  canChange: boolean;
  remainingMs: number;
  remainingText: string;
} {
  const COOLDOWN_DAYS = 3;
  const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

  if (!usernameChangedAt) {
    return { canChange: true, remainingMs: 0, remainingText: 'Available now' };
  }

  try {
    const changedDate = usernameChangedAt.toDate
      ? usernameChangedAt.toDate()
      : new Date(usernameChangedAt);
    const elapsed = Date.now() - changedDate.getTime();
    const remaining = COOLDOWN_MS - elapsed;

    if (remaining <= 0) {
      return {
        canChange: true,
        remainingMs: 0,
        remainingText: 'Available now',
      };
    }

    return {
      canChange: false,
      remainingMs: remaining,
      remainingText: formatCooldown(remaining),
    };
  } catch {
    return { canChange: true, remainingMs: 0, remainingText: 'Available now' };
  }
}