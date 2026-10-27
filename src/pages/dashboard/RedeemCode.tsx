import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { redeemCode, RedeemResult } from '../../services/redeemService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { Link } from 'react-router-dom';
import {
  FiGift,
  FiCheck,
  FiStar,
  FiAward,
  FiShield,
  FiInfo,
  FiArrowLeft,
  FiZap,
} from 'react-icons/fi';

interface RedeemedEntry {
  code: string;
  type: 'premium' | 'badge' | 'verified';
  value: string | number;
  at: number;
}

const TYPE_META: Record<
  RedeemedEntry['type'],
  { label: string; icon: JSX.Element; color: string }
> = {
  premium: {
    label: 'Premium',
    icon: <FiStar size={14} />,
    color: '#a78bfa',
  },
  badge: {
    label: 'Badge',
    icon: <FiAward size={14} />,
    color: '#facc15',
  },
  verified: {
    label: 'Verified',
    icon: <FiShield size={14} />,
    color: '#3b82f6',
  },
};

export default function RedeemCode() {
  const { profile, refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<RedeemedEntry[]>([]);
  const toast = useToast();

  const submit = async () => {
    if (!profile) return;
    setError('');

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Enter a code');
      return;
    }
    if (trimmed.length < 4) {
      setError('Code too short');
      return;
    }
    if (trimmed.length > 40) {
      setError('Code too long');
      return;
    }
    if (!/^[A-Z0-9-]+$/.test(trimmed)) {
      setError('Only letters, numbers and dashes');
      return;
    }

    setLoading(true);
    try {
      const result: RedeemResult = await redeemCode(profile.uid, trimmed);

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      // Success
      setHistory((h) => [
        {
          code: trimmed,
          type: result.type,
          value: result.value,
          at: Date.now(),
        },
        ...h,
      ]);
      setCode('');
      await refreshProfile();
      toast.success(
        result.type === 'premium'
          ? `Premium activated for ${result.value} days`
          : result.type === 'badge'
            ? 'Badge unlocked'
            : 'Verified status granted',
      );
    } catch (e: any) {
      const msg = e?.message || 'Failed to redeem code';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-start gap-3">
        <Link
          to="/dashboard/premium"
          className="p-2 rounded-lg hover:bg-bg-elevated text-muted hover:text-white mt-1"
          title="Back to Premium"
        >
          <FiArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Redeem Code
          </h1>
          <p className="text-xs text-muted mt-1">
            Enter a code to unlock Premium, badges or verification
          </p>
        </div>
      </div>

      <Card>
        <div className="text-center py-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-brand to-accent items-center justify-center mb-4">
            <FiGift size={24} />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Enter your code
          </h3>
          <p className="text-xs text-muted mt-1">
            Codes are case-insensitive and can only be used once
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError('');
            }}
            placeholder="NEBULA-XXXX-XXXX"
            error={error}
            className="text-center font-mono tracking-widest uppercase"
            maxLength={40}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) submit();
            }}
          />
          <Button
            onClick={submit}
            loading={loading}
            fullWidth
            disabled={!code.trim()}
          >
            <FiZap size={14} /> Redeem
          </Button>
        </div>
      </Card>

      {history.length > 0 && (
        <Card
          title="Redeemed in this session"
          description="Your recent successful redemptions"
        >
          <div className="divide-y divide-border -mx-5">
            {history.map((h, i) => {
              const meta = TYPE_META[h.type];
              return (
                <div
                  key={`${h.code}-${i}`}
                  className="px-5 py-3 flex items-center gap-3"
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: meta.color + '22',
                      color: meta.color,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-mono truncate">
                      {h.code}
                    </p>
                    <p className="text-[11px] text-muted">
                      {meta.label}
                      {h.type === 'premium' && ` · ${h.value} days`}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                    style={{
                      color: '#22c55e',
                      backgroundColor: 'rgba(34,197,94,0.15)',
                    }}
                  >
                    <FiCheck size={10} /> OK
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card title="How it works">
        <ul className="space-y-3 text-sm text-muted">
          <li className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-lg bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
              <FiGift size={12} />
            </span>
            <span>
              <span className="text-white font-medium">Get a code</span> — from
              giveaways, events, partner promotions or our community.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
              <FiZap size={12} />
            </span>
            <span>
              <span className="text-white font-medium">Enter it above</span> —
              your account will be updated instantly.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-lg bg-warning/15 text-warning flex items-center justify-center shrink-0 mt-0.5">
              <FiInfo size={12} />
            </span>
            <span>
              <span className="text-white font-medium">Single use</span> — each
              code can only be redeemed once, by one account.
            </span>
          </li>
        </ul>
      </Card>

      <Card className="border-danger/30 bg-danger/5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-danger/15 text-danger flex items-center justify-center shrink-0">
            <FiInfo size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Never share your codes
            </h4>
            <p className="text-xs text-muted mt-1">
              Support will never ask for your redeem code. If someone
              claims to work for Nebula and asks for a code, it's a scam.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}