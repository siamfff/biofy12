import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiZap } from 'react-icons/fi';

interface Props {
  username?: string;
}

const SESSION_KEY = 'nebula_promo_dismissed';

export function ProfilePromoCard({ username }: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY) === '1') setHidden(true);
  }, []);

  if (hidden) return null;

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sessionStorage.setItem(SESSION_KEY, '1');
    setHidden(true);
  };

  const slug = username ? username : 'you';

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-auto sm:max-w-md animate-slide-up">
      <Link
        to="/register"
        className="group relative flex items-center gap-3 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-xl px-4 py-3 pr-10 shadow-card hover:border-brand/60 hover:bg-black/80 transition"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shrink-0 group-hover:scale-110 transition">
          <FiZap size={18} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white font-display truncate">
            nebula.gg/{slug}
          </p>
          <p className="text-[11px] text-white/60">
            Claim your profile for free now!
          </p>
        </div>
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 h-6 w-6 rounded-lg hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition"
          aria-label="Dismiss"
        >
          <FiX size={14} />
        </button>
      </Link>
    </div>
  );
}