import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchDailyAnalytics, fetchRecentEvents } from '../../services/analyticsService';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs } from '../../components/ui/Tabs';
import { formatNumber, timeAgo } from '../../utils/format';
import { DailyAnalytics, AnalyticsEvent } from '../../types';
import {
  FiEye, FiLink, FiShare2, FiTrendingUp, FiBarChart2, FiClock,
} from 'react-icons/fi';

type Range = '7' | '30' | '90';

export default function Analytics() {
  const { profile } = useAuth();
  const [range, setRange] = useState<Range>('30');
  const [daily, setDaily] = useState<DailyAnalytics[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchDailyAnalytics(profile.uid, Number(range)),
      fetchRecentEvents(profile.uid, 60),
    ])
      .then(([d, e]) => {
        if (cancelled) return;
        setDaily(d);
        setEvents(e);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [profile?.uid, range]);

  const totals = useMemo(() => {
    return daily.reduce(
      (acc, d) => ({
        views: acc.views + d.views,
        linkClicks: acc.linkClicks + d.linkClicks,
        socialClicks: acc.socialClicks + d.socialClicks,
      }),
      { views: 0, linkClicks: 0, socialClicks: 0 },
    );
  }, [daily]);

  const maxValue = useMemo(() => {
    const m = Math.max(
      ...daily.map((d) => Math.max(d.views, d.linkClicks, d.socialClicks)),
      1,
    );
    return m;
  }, [daily]);

  const recentClicks = useMemo(
    () => events.filter((e) => e.type === 'link_click' || e.type === 'social_click').slice(0, 20),
    [events],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={36} />
      </div>
    );
  }

  const tiles = [
    { icon: FiEye, label: 'Profile Views', value: totals.views, color: '#7c5cff' },
    { icon: FiLink, label: 'Link Clicks', value: totals.linkClicks, color: '#22d3ee' },
    { icon: FiShare2, label: 'Social Clicks', value: totals.socialClicks, color: '#f59e0b' },
    {
      icon: FiTrendingUp,
      label: 'Avg. Views / Day',
      value: Math.round(totals.views / Number(range)),
      color: '#22c55e',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Analytics</h1>
          <p className="text-xs text-muted mt-1">Understand how visitors interact with your profile</p>
        </div>
        <Tabs
          value={range}
          onChange={(v) => setRange(v as Range)}
          tabs={[
            { id: '7', label: 'Last 7 days' },
            { id: '30', label: 'Last 30 days' },
            { id: '90', label: 'Last 90 days' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-bg-card border border-border rounded-2xl p-4">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: t.color + '22', color: t.color }}
            >
              <t.icon size={14} />
            </div>
            <p className="text-2xl font-bold text-white font-display">{formatNumber(t.value)}</p>
            <p className="text-[11px] text-muted mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      <Card
        title="Activity over time"
        description={`Daily breakdown for the last ${range} days`}
        action={
          <div className="flex items-center gap-3 text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-brand" /> Views
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent" /> Link clicks
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-warning" /> Social clicks
            </span>
          </div>
        }
      >
        {daily.every((d) => d.views === 0 && d.linkClicks === 0 && d.socialClicks === 0) ? (
          <EmptyState
            icon={<FiBarChart2 size={28} />}
            title="No activity yet"
            description="Once people start visiting your profile, you'll see stats here."
          />
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-end gap-1 h-56 min-w-full">
              {daily.map((d) => {
                const dayLabel = new Date(d.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <div
                    key={d.date}
                    className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group"
                    title={`${dayLabel}\n${d.views} views · ${d.linkClicks} link clicks · ${d.socialClicks} social clicks`}
                  >
                    <div className="w-full flex items-end justify-center gap-[2px] h-48">
                      <div
                        className="w-1/3 rounded-t bg-brand/80 group-hover:bg-brand transition"
                        style={{ height: `${(d.views / maxValue) * 100}%`, minHeight: d.views ? 3 : 0 }}
                      />
                      <div
                        className="w-1/3 rounded-t bg-accent/80 group-hover:bg-accent transition"
                        style={{ height: `${(d.linkClicks / maxValue) * 100}%`, minHeight: d.linkClicks ? 3 : 0 }}
                      />
                      <div
                        className="w-1/3 rounded-t bg-warning/80 group-hover:bg-warning transition"
                        style={{ height: `${(d.socialClicks / maxValue) * 100}%`, minHeight: d.socialClicks ? 3 : 0 }}
                      />
                    </div>
                    <span className="text-[9px] text-muted rotate-[-45deg] origin-top-left whitespace-nowrap h-4">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <Card title="Recent clicks" description="The latest interactions with your links and socials">
        {recentClicks.length === 0 ? (
          <EmptyState
            icon={<FiClock size={28} />}
            title="No clicks yet"
            description="Once visitors click a link or social icon, you'll see it here."
          />
        ) : (
          <div className="divide-y divide-border">
            {recentClicks.map((e, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      e.type === 'link_click'
                        ? 'bg-accent/15 text-accent'
                        : 'bg-warning/15 text-warning'
                    }`}
                  >
                    {e.type === 'link_click' ? <FiLink size={14} /> : <FiShare2 size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      {e.type === 'link_click' ? 'Link clicked' : 'Social clicked'}
                    </p>
                    {e.targetId && (
                      <p className="text-[11px] text-muted truncate">target: {e.targetId}</p>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-muted whitespace-nowrap">
                  {timeAgo(e.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}