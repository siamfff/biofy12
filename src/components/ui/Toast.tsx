import { cn } from '../../utils/cn';

interface Props {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const styles = {
  success: 'border-success/40 bg-success/10 text-success',
  error: 'border-danger/40 bg-danger/10 text-danger',
  info: 'border-brand/40 bg-brand/10 text-brand-soft',
  warning: 'border-warning/40 bg-warning/10 text-warning',
};

export function Toast({ type, message }: Props) {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border glass text-sm animate-slide-up shadow-card',
        styles[type],
      )}
    >
      {message}
    </div>
  );
}