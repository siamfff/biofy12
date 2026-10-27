import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, hint, className, ...rest }, ref) => (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full bg-bg-soft border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand transition resize-none',
          error && 'border-danger',
          className,
        )}
        {...rest}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  ),
);
Textarea.displayName = 'Textarea';