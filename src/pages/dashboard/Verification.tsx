import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { submitVerificationApplication } from '../../services/redeemService';
// @ts-expect-error Firebase Firestore declarations are not available in the current dependency installation.
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';
import { VerificationApplication } from '../../types';
import { formatDate } from '../../utils/format';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiInfo,
  FiShield,
  FiStar,
  FiSend,
} from 'react-icons/fi';

type Status = 'idle' | 'pending' | 'approved' | 'rejected';

export default function Verification() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [reason, setReason] = useState('');
  const [links, setLinks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<VerificationApplication | null>(
    null,
  );
  const [loadingApp, setLoadingApp] = useState(true);

  const status: Status = application?.status || 'idle';

  useEffect(() => {
    (async () => {
      if (!profile?.uid) return;
      setLoadingApp(true);
      const snap = await getDoc(doc(db, 'verificationApplications', profile.uid));
      if (snap.exists()) {
        const data = snap.data() as VerificationApplication;
        setApplication(data);
        setFullName(data.fullName || '');
        setReason(data.reason || '');
        setLinks(data.links || '');
      }
      setLoadingApp(false);
    })();
  }, [profile?.uid]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError('');

    if (!fullName.trim()) {
      setError('Enter your full name');
      return;
    }
    if (fullName.trim().length > 80) {
      setError('Name too long');
      return;
    }
    if (reason.trim().length < 30) {
      setError('Tell us why you should be verified (min 30 chars)');
      return;
    }
    if (reason.trim().length > 500) {
      setError('Reason too long (max 500 chars)');
      return;
    }

    setSubmitting(true);
    try {
      await submitVerificationApplication(
        profile.uid,
        fullName.trim(),
        reason.trim(),
        links.trim(),
      );

      // Refetch
      const snap = await getDoc(
        doc(db, 'verificationApplications', profile.uid),
      );
      if (snap.exists()) setApplication(snap.data() as VerificationApplication);

      toast.success('Application submitted');
    } catch (e: any) {
      const msg = e?.message || 'Failed to submit';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) return null;

  // Already verified — show success state
  if (profile.verified) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Verification
          </h1>
          <p className="text-xs text-muted mt-1">
            You're verified on Nebula
          </p>
        </div>

        <Card className="border-accent/40 bg-accent/5">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <FiCheckCircle size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-white">
                  Verified account
                </h3>
                <Badge color="#3b82f6" icon={<FiCheckCircle size={12} />}>
                  Verified
                </Badge>
              </div>
              <p className="text-xs text-muted mt-2">
                Your profile now shows the verified checkmark. This confirms
                your identity to visitors.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Benefits">
          <ul className="space-y-3 text-sm text-muted">
            {[
              'Verified checkmark next to your display name',
              'Higher trust from visitors',
              'Priority placement in discovery',
              'Exclusive verified badge on your collection',
            ].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <FiCheckCircle
                  size={14}
                  className="text-success shrink-0 mt-0.5"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">
          Verification
        </h1>
        <p className="text-xs text-muted mt-1">
          Apply for the verified checkmark
        </p>
      </div>

      {/* Status banner */}
      {status === 'pending' && (
        <Card className="border-warning/40 bg-warning/5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/20 text-warning flex items-center justify-center shrink-0">
              <FiClock size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">
                Application under review
              </h3>
              <p className="text-xs text-muted mt-1">
                We received your application
                {application?.createdAt
                  ? ` on ${formatDate(application.createdAt)}`
                  : ''}
                . Most decisions are made within 7 days.
              </p>
            </div>
          </div>
        </Card>
      )}

      {status === 'approved' && (
        <Card className="border-success/40 bg-success/5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/20 text-success flex items-center justify-center shrink-0">
              <FiCheckCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Application approved
              </h3>
              <p className="text-xs text-muted mt-1">
                Congratulations! Refresh your profile to see the checkmark.
              </p>
            </div>
          </div>
        </Card>
      )}

      {status === 'rejected' && (
        <Card className="border-danger/40 bg-danger/5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-danger/20 text-danger flex items-center justify-center shrink-0">
              <FiXCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Application not approved
              </h3>
              <p className="text-xs text-muted mt-1">
                You can apply again after improving the criteria below.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Requirements */}
      <Card title="Requirements">
        <ul className="space-y-3 text-sm text-muted">
          <li className="flex items-start gap-2">
            <FiCheckCircle size={14} className="text-brand-soft shrink-0 mt-0.5" />
            <span>Active profile with a bio and at least one link</span>
          </li>
          <li className="flex items-start gap-2">
            <FiCheckCircle size={14} className="text-brand-soft shrink-0 mt-0.5" />
            <span>
              Notability — significant presence on at least one platform
            </span>
          </li>
          <li className="flex items-start gap-2">
            <FiCheckCircle size={14} className="text-brand-soft shrink-0 mt-0.5" />
            <span>Clear reason for applying (why you, why now)</span>
          </li>
          <li className="flex items-start gap-2">
            <FiCheckCircle size={14} className="text-brand-soft shrink-0 mt-0.5" />
            <span>
              No recent violations of our Terms of Service
            </span>
          </li>
        </ul>
      </Card>

      {/* Application form */}
      <Card
        title={status === 'pending' ? 'Update your application' : 'Apply'}
        description="Provide accurate information — false claims will be rejected"
      >
        {loadingApp ? (
          <div className="py-8 flex justify-center">
            <span className="h-6 w-6 border-2 border-border border-t-brand rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your real or brand name"
              maxLength={80}
            />
            <Textarea
              label="Why should you be verified?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              maxLength={500}
              placeholder="Tell us about yourself, your audience, and why verification makes sense."
              hint={`${reason.length}/500 characters`}
            />
            <Textarea
              label="Proof links (one per line)"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              rows={3}
              placeholder="https://twitter.com/you&#10;https://youtube.com/@you"
            />

            {error && <p className="text-xs text-danger">{error}</p>}

            <Button type="submit" loading={submitting}>
              <FiSend size={14} />
              {status === 'pending' ? 'Update application' : 'Submit application'}
            </Button>
          </form>
        )}
      </Card>

      {/* Info */}
      <Card className="border-brand/30 bg-brand/5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand/20 text-brand-soft flex items-center justify-center shrink-0">
            <FiInfo size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Premium members get priority review
            </h4>
            <p className="text-xs text-muted mt-1">
              Premium subscriptions are reviewed within 48 hours. Free
              applications can take up to 7 days.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card title="What verified means">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              icon: <FiShield size={16} />,
              label: 'Identity',
              desc: 'You are who you say you are',
              color: '#3b82f6',
            },
            {
              icon: <FiStar size={16} />,
              label: 'Notability',
              desc: 'You meet our notability bar',
              color: '#a78bfa',
            },
            {
              icon: <FiCheckCircle size={16} />,
              label: 'Trust',
              desc: 'Visitors can trust your profile',
              color: '#22c55e',
            },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-border bg-bg-soft p-3"
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: c.color + '22', color: c.color }}
              >
                {c.icon}
              </div>
              <p className="text-sm text-white font-medium">{c.label}</p>
              <p className="text-[11px] text-muted mt-0.5">{c.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}