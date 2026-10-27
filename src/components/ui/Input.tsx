import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, leftIcon, rightIcon, className, ...rest }, ref) => (
    <div className="w-full min-w-0">
      {label && (
        <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      )}
      <div className="relative min-w-0">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full min-w-0 bg-bg-soft border border-border rounded-xl px-3.5 py-2.5 text-sm text-white',
            'placeholder:text-muted/60 transition-colors',
            'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className,
          )}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  ),
);
Input.displayName = 'Input';