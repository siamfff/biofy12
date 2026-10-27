import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { cn } from '../../utils/cn';
import { useToast } from '../../hooks/useToast';

interface Props {
  text: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CopyButton({
  text,
  label = 'Copy',
  className,
  size = 'md',
}: Props) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg transition font-medium',
        size === 'sm' ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-xs',
        'bg-bg-card border border-border hover:border-brand/40 hover:bg-bg-elevated',
        copied ? 'text-success' : 'text-muted hover:text-white',
        className,
      )}
      title={label}
    >
      {copied ? (
        <FiCheck size={size === 'sm' ? 11 : 13} />
      ) : (
        <FiCopy size={size === 'sm' ? 11 : 13} />
      )}
      {copied ? 'Copied!' : label}
    </button>
  );
}