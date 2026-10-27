import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiShield, FiClock } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchAdminLogs } from '../../services/adminService';
import { AdminLog } from '../../types';
import { timeAgo } from '../../utils/format';

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminLogs(100)
      .then(setLogs)
      .catch((e) => console.error('[admin logs]', e))
      .finally(() => setLoading(false));
  }, []);

  const colorFor = (action: string) => {
    if (action.includes('grant')) return '#22C55E';
    if (action.includes('revoke') || action.includes('delete')) return '#EF4444';
    if (action.includes('create')) return '#00AAFF';
    if (action.includes('extend')) return '#A855F7';
    return '#8B8B95';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Admin Logs</h1>
        <p className="text-xs text-muted mt-1">
          {logs.length} recent actions
        </p>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={32} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<FiFileText size={28} />}
            title="No logs yet"
            description="Admin actions will appear here"
          />
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: colorFor(log.action) + '22',
                    color: colorFor(log.action),
                  }}
                >
                  <FiShield size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium">
                    <span className="text-brand-soft">{log.adminUsername}</span>{' '}
                    <span className="text-muted font-normal">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    {log.targetUsername && (
                      <>
                        {' '}
                        <span className="text-muted font-normal">→</span>{' '}
                        <Link
                          to={`/admin/users/${log.targetUid}`}
                          className="hover:text-brand-soft"
                        >
                          @{log.targetUsername}
                        </Link>
                      </>
                    )}
                  </p>
                  {log.details && (
                    <p className="text-[10px] text-muted mt-0.5 font-mono">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-muted whitespace-nowrap flex items-center gap-1">
                  <FiClock size={10} /> {timeAgo(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}