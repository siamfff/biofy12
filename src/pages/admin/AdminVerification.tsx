import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiExternalLink,
} from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs } from '../../components/ui/Tabs';
import {
  fetchVerificationApplications,
  adminApproveVerification,
  adminRejectVerification,
  logAdminAction,
  sendNotificationToUser,
} from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { VerificationApplication } from '../../types';
import { formatDate } from '../../utils/format';

type Filter = 'pending' | 'approved' | 'rejected' | 'all';

export default function AdminVerification() {
  const { profile: admin } = useAuth();
  const toast = useToast();
  const [apps, setApps] = useState<(VerificationApplication & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
  const [busy, setBusy] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const list = await fetchVerificationApplications();
    setApps(list);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = apps.filter((a) =>
    filter === 'all' ? true : a.status === filter,
  );

  const handleApprove = async (app: VerificationApplication & { id: string }) => {
    if (!admin) return;
    setBusy(app.uid);
    try {
      await adminApproveVerification(app.uid);
      await sendNotificationToUser(
        app.uid,
        'Verification approved',
        'Your verification application was approved. Your profile now shows a verified checkmark.',
        'success',
      );
      await logAdminAction(
        admin.uid,
        admin.username || admin.displayName,
        'approve_verification',
        app.uid,
      );
      toast.success('Application approved');
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (app: VerificationApplication & { id: string }) => {
    if (!admin) return;
    setBusy(app.uid);
    try {
      await adminRejectVerification(app.uid);
      await sendNotificationToUser(
        app.uid,
        'Verification rejected',
        'Your verification application was not approved. You can apply again after improving the criteria.',
        'error',
      );
      await logAdminAction(
        admin.uid,
        admin.username || admin.displayName,
        'reject_verification',
        app.uid,
      );
      toast.success('Application rejected');
      await reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">
          Verification Applications
        </h1>
        <p className="text-xs text-muted mt-1">
          {apps.length} total · {filtered.length} {filter}
        </p>
      </div>

      <Tabs
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        tabs={[
          { id: 'pending', label: `Pending (${apps.filter((a) => a.status === 'pending').length})` },
          { id: 'approved', label: `Approved (${apps.filter((a) => a.status === 'approved').length})` },
          { id: 'rejected', label: `Rejected (${apps.filter((a) => a.status === 'rejected').length})` },
          { id: 'all', label: `All (${apps.length})` },
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FiCheckCircle size={28} />}
            title={`No ${filter} applications`}
            description="Applications will appear here when users apply."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Card key={app.id}>
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <Link
                    to={`/admin/users/${app.uid}`}
                    className="text-sm font-semibold text-white hover:text-brand-soft"
                  >
                    {app.fullName || app.uid}
                  </Link>
                  <p className="text-[11px] text-muted mt-0.5">
                    Applied: {formatDate(app.createdAt)}
                  </p>
                </div>

                <div
                  className={
                    app.status === 'pending'
                      ? 'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-warning/15 text-warning text-[10px] font-medium'
                      : app.status === 'approved'
                        ? 'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/15 text-success text-[10px] font-medium'
                        : 'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-danger/15 text-danger text-[10px] font-medium'
                  }
                >
                  {app.status === 'pending' ? <FiClock size={10} /> : app.status === 'approved' ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                  {app.status}
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
                    Reason
                  </p>
                  <p className="text-xs text-white whitespace-pre-wrap leading-relaxed">
                    {app.reason}
                  </p>
                </div>

                {app.links && (
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
                      Links
                    </p>
                    <div className="space-y-1">
                      {app.links
                        .split('\n')
                        .filter(Boolean)
                        .map((l, i) => (
                          <a
                            key={i}
                            href={l.trim()}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-soft hover:underline inline-flex items-center gap-1"
                          >
                            {l.trim()} <FiExternalLink size={10} />
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {app.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(app)}
                    loading={busy === app.uid}
                  >
                    <FiCheckCircle size={12} /> Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(app)}
                    loading={busy === app.uid}
                  >
                    <FiXCircle size={12} /> Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}