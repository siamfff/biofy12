import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTool } from 'react-icons/fi';

interface Props {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function AdminPlaceholder({ title, description }: Props) {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="rounded-2xl border border-border bg-bg-card p-10 text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-brand/15 text-brand-soft items-center justify-center mb-5 shadow-glow">
          <FiTool size={26} />
        </div>
        <h1 className="text-2xl font-bold text-white font-display">{title}</h1>
        <p className="text-sm text-muted mt-3 max-w-md mx-auto">
          {description || 'This section is coming soon.'}
        </p>
        <Link
          to="/admin"
          className="mt-6 inline-flex items-center gap-2 text-sm text-brand-soft hover:underline"
        >
          <FiArrowLeft size={14} />
          Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}