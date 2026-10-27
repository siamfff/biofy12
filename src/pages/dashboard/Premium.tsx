import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/format';
import {
  FiStar,
  FiCheck,
  FiZap,
  FiShield,
  FiTrendingUp,
  FiImage,
  FiMusic,
  FiAward,
  FiGift,
  FiExternalLink,
} from 'react-icons/fi';

interface PlanFeature {
  label: string;
  free: boolean;
  premium: boolean;
}

const FEATURES: PlanFeature[] = [
  { label: 'Public profile page', free: true, premium: true },
  { label: 'Unlimited links & socials', free: true, premium: true },
  { label: 'Basic themes & colors', free: true, premium: true },
  { label: 'Avatar & background upload', free: true, premium: true },
  { label: 'Music player', free: true, premium: true },
  { label: 'Analytics dashboard', free: true, premium: true },
  { label: 'Premium badge', free: false, premium: true },
  { label: 'Verified badge eligibility', free: false, premium: true },
  { label: 'Advanced appearance (blur, shadows, cursor)', free: false, premium: true },
  { label: 'Custom background video', free: false, premium: true },
  { label: 'All widgets unlocked', free: false, premium: true },
  { label: 'Priority verification review', free: false, premium: true },
  { label: 'Custom profile URL slug', free: false, premium: true },
  { label: 'Remove Nebula branding', free: false, premium: true },
  { label: 'Early access to new features', free: false, premium: true },
];

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  badge?: string;
  perks: string[];
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 4.99,
    period: '/month',
    perks: ['All Premium features', 'Cancel anytime', 'Instant activation'],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 39.99,
    period: '/year',
    badge: 'Save 33%',
    highlight: true,
    perks: [
      'All Premium features',
      '2 months free',
      'Priority support',
      'Exclusive yearly badge',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 99.99,
    period: 'one-time',
    badge: 'Best value',
    perks: [
      'All Premium features forever',
      'Founder badge',
      'Early access to every feature',
      'Direct line to the team',
    ],
  },
];

export default function Premium() {
  const { profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isPremium = useMemo(() => {
    if (!profile?.premium) return false;
    if (profile.premiumUntil) {
      const until = profile.premiumUntil.toDate
        ? profile.premiumUntil.toDate()
        : new Date(profile.premiumUntil as any);
      return until.getTime() > Date.now();
    }
    return true;
  }, [profile?.premium, profile?.premiumUntil]);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Premium</h1>
        <p className="text-xs text-muted mt-1">
          Unlock every feature and take your profile to the next level
        </p>
      </div>

      {isPremium && (
        <Card className="border-brand/40 bg-brand/5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand/20 text-brand-soft flex items-center justify-center shrink-0">
              <FiStar size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-white">
                  You're Premium
                </h3>
                <Badge color="#a78bfa" icon={<FiStar size={12} />}>
                  Active
                </Badge>
              </div>
              {profile.premiumUntil && (
                <p className="text-xs text-muted mt-1">
                  Renews on {formatDate(profile.premiumUntil)}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-5 flex flex-col transition ${
              plan.highlight
                ? 'border-brand/60 bg-gradient-to-b from-brand/10 to-transparent shadow-glow'
                : 'border-border bg-bg-card'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand text-white">
                {plan.badge}
              </span>
            )}

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white font-display">
                  ${plan.price}
                </span>
                <span className="text-xs text-muted">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {plan.perks.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-2 text-xs text-muted"
                >
                  <FiCheck
                    size={14}
                    className="text-brand-soft shrink-0 mt-0.5"
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlight ? 'primary' : 'secondary'}
              fullWidth
              onClick={() => handleSelectPlan(plan)}
              disabled={isPremium && plan.id !== 'lifetime'}
            >
              {isPremium
                ? plan.id === 'lifetime'
                  ? 'Extend to lifetime'
                  : 'Already Premium'
                : `Get ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>

      {/* Feature comparison */}
      <Card
        title="Feature comparison"
        description="What you get with each plan"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-3 text-xs font-medium text-muted">Feature</th>
                <th className="py-3 text-xs font-medium text-muted text-center w-24">
                  Free
                </th>
                <th className="py-3 text-xs font-medium text-brand-soft text-center w-24">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f) => (
                <tr key={f.label} className="border-b border-border/50">
                  <td className="py-3 text-xs text-white">{f.label}</td>
                  <td className="py-3 text-center">
                    {f.free ? (
                      <FiCheck
                        size={14}
                        className="inline text-success"
                      />
                    ) : (
                      <span className="text-muted/40">—</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {f.premium ? (
                      <FiCheck
                        size={14}
                        className="inline text-brand-soft"
                      />
                    ) : (
                      <span className="text-muted/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Perks grid */}
      <Card title="Why go Premium?">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              icon: <FiZap size={16} />,
              title: 'Stand out',
              desc: 'Advanced appearance options most users never see.',
              color: '#7c5cff',
            },
            {
              icon: <FiShield size={16} />,
              title: 'Get verified',
              desc: 'Premium members are prioritized for verification.',
              color: '#3b82f6',
            },
            {
              icon: <FiTrendingUp size={16} />,
              title: 'Grow faster',
              desc: 'Better analytics and insights for your audience.',
              color: '#22c55e',
            },
            {
              icon: <FiImage size={16} />,
              title: 'More customization',
              desc: 'Custom backgrounds, videos, cursors and shadows.',
              color: '#f59e0b',
            },
            {
              icon: <FiMusic size={16} />,
              title: 'Full music control',
              desc: 'Upload, loop, autoplay — all player settings unlocked.',
              color: '#ec4899',
            },
            {
              icon: <FiAward size={16} />,
              title: 'Exclusive badges',
              desc: 'Premium and Founder badges visible on your profile.',
              color: '#facc15',
            },
          ].map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-border bg-bg-soft p-4"
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: p.color + '22', color: p.color }}
              >
                {p.icon}
              </div>
              <h4 className="text-sm font-semibold text-white">{p.title}</h4>
              <p className="text-xs text-muted mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Redeem hint */}
      <Card className="border-accent/30 bg-accent/5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center shrink-0">
            <FiGift size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">
              Have a redeem code?
            </h3>
            <p className="text-xs text-muted mt-1">
              Redeem a code to get Premium, badges or verification instantly —
              no payment needed.
            </p>
          </div>
          <Link to="/dashboard/redeem">
            <Button size="sm" variant="secondary">
              Redeem <FiExternalLink size={12} />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Checkout modal */}
      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title={`Checkout · ${selectedPlan?.name || ''}`}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setCheckoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setCheckoutOpen(false);
              }}
            >
              Continue to payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-bg-soft p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">{selectedPlan?.name} plan</span>
              <span className="text-white font-semibold">
                ${selectedPlan?.price}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
            <p className="font-semibold">Payment integration coming soon</p>
            <p className="mt-1 opacity-90">
              Card information is never stored on our servers. Payment
              processing will be handled through a secure third-party provider
              (Stripe) once live.
            </p>
          </div>

          <p className="text-xs text-muted">
            By continuing you agree to our Terms of Service and Privacy Policy.
            You can cancel anytime from your account settings.
          </p>
        </div>
      </Modal>
    </div>
  );
}