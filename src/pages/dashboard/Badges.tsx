import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { BADGE_IMAGES } from '../../utils/badgeImages';
import { FiAward, FiLock, FiGift } from 'react-icons/fi';

export default function Badges() {
  const { profile } = useAuth();

  const owned = useMemo(() => profile?.badges || [], [profile?.badges]);
  const ownedSet = useMemo(() => new Set(owned), [owned]);
  const allBadges = Object.entries(BADGE_IMAGES);
  const ownedCount = owned.filter((b) => BADGE_IMAGES[b]).length;
  const totalCount = allBadges.length;
  const progress = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Badges</h1>
        <p className="text-xs text-muted mt-1">
          Badges you've earned. Collect them by redeeming codes, getting verified, or joining the team.
        </p>
      </div>

      <Card title="Your collection" description={`${ownedCount} of ${totalCount} badges unlocked`}>
        <div className="space-y-4">
          <div className="w-full h-2 bg-bg-soft rounded-full overflow-hidden border border-border">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c5cff, #22d3ee)',
              }}
            />
          </div>

          {ownedCount === 0 ? (
            <EmptyState
              icon={<FiAward size={28} />}
              title="No badges yet"
              description="Earn your first badge by redeeming a code or getting verified."
              action={
                <Link to="/dashboard/redeem">
                  <Button size="sm">
                    <FiGift size={14} /> Redeem a code
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="flex flex-wrap gap-3">
              {owned
                .filter((k) => BADGE_IMAGES[k])
                .map((key) => {
                  const def = BADGE_IMAGES[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                      style={{
                        borderColor: def.color + '55',
                        backgroundColor: def.color + '12',
                      }}
                    >
                      <img src={def.image} alt={def.label} className="h-6 w-6 object-contain" />
                      <span className="text-xs font-semibold" style={{ color: def.color }}>
                        {def.label}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </Card>

      <Card title="All badges" description="Everything you can unlock on Nebula">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allBadges.map(([key, def]) => {
            const has = ownedSet.has(key);
            return (
              <div
                key={key}
                className={`relative rounded-2xl border p-4 transition ${
                  has ? 'border-border bg-bg-soft' : 'border-border/60 bg-bg-soft/40'
                }`}
                style={has ? { borderColor: def.color + '55', backgroundColor: def.color + '10' } : undefined}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center relative"
                    style={{
                      backgroundColor: has ? def.color + '22' : '#26263a55',
                    }}
                  >
                    {has ? (
                      <img src={def.image} alt={def.label} className="h-12 w-12 object-contain" />
                    ) : (
                      <FiLock size={20} className="text-muted" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${has ? 'text-white' : 'text-muted'}`}>
                      {def.label}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">{has ? 'Unlocked' : 'Locked'}</p>
                  </div>
                  {has && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: def.color, backgroundColor: def.color + '22' }}
                    >
                      OWNED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="How to earn badges">
        <ul className="space-y-3 text-sm text-muted">
          <li className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-lg bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
              <FiGift size={12} />
            </span>
            <span>
              <span className="text-white font-medium">Redeem codes</span> — get codes from events, giveaways, or our community.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
              <FiAward size={12} />
            </span>
            <span>
              <span className="text-white font-medium">Get verified</span> — apply from the Verification page.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}