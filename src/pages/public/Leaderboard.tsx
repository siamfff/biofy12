import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiAward } from 'react-icons/fi';
import { Navbar } from '../../components/public/Navbar';
import { Footer } from '../../components/public/Footer';
import { Spinner } from '../../components/ui/Spinner';
import { subscribeLeaderboard } from '../../services/leaderboardService';
import { UserDoc } from '../../types';

const MEDALS = ['#facc15', '#cbd5e1', '#f59e0b'];

export default function Leaderboard() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    const unsub = subscribeLeaderboard((list) => {
      setUsers(list);
      setLoading(false);
    }, 50);

    // safety: stop loading after 5s
    const timer = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-16 pb-8">
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-brand/15 text-brand-soft items-center justify-center mb-4">
            <FiAward size={22} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-display">
            Leaderboard
          </h1>
          <p className="text-sm text-muted mt-3">
            Top 50 most viewed profiles on Nebula — live.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner size={32} />
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-sm text-muted py-12">
            Couldn't load the leaderboard right now.
          </p>
        )}

        {!loading && !error && users.length === 0 && (
          <p className="text-center text-sm text-muted py-12">
            No ranked profiles yet. Be the first —{' '}
            <Link to="/register" className="text-brand-soft hover:underline">
              claim your username
            </Link>
            .
          </p>
        )}

        {!loading && !error && users.length > 0 && (
          <ol className="space-y-2">
            {users.map((u, i) => (
              <li key={u.uid}>
                <Link
                  to={`/u/${u.username}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-bg-card p-3 hover:border-brand/50 hover:bg-bg-elevated hover:-translate-y-0.5 transition-all"
                >
                  {/* Rank */}
                  <span
                    className="w-7 text-center text-sm font-bold font-display shrink-0"
                    style={{ color: MEDALS[i] || '#8B8B95' }}
                  >
                    {i + 1}
                  </span>

                  {/* Avatar */}
                  <img
                    src={
                      u.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${
                        u.displayName || u.username
                      }`
                    }
                    alt=""
                    className="h-11 w-11 rounded-full object-cover border border-border shrink-0"
                  />

                  {/* Name + username */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {u.displayName || u.username}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      @{u.username}
                    </p>
                  </div>

                  {/* Views */}
                  <span className="flex items-center gap-1.5 text-xs text-muted shrink-0">
                    <FiEye size={13} />
                    {(u.views || 0).toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
      <Footer />
    </div>
  );
}