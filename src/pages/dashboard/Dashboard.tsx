import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchDailyAnalytics } from '../../services/analyticsService';
import { useProfileData } from '../../hooks/useProfile';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/common/CopyButton';
import {
  FiEye,
  FiLink,
  FiShare2,
  FiStar,
} from 'react-icons/fi';
import { formatNumber } from '../../utils/format';

export default function Dashboard() {
  const { profile } = useAuth();
  const { links, socials } = useProfileData();
  const [stats, setStats] = useState({
    views: 0,
    linkClicks: 0,
    socialClicks: 0,
  });

  useEffect(() => {
    if (!profile?.uid) return;
    fetchDailyAnalytics(profile.uid, 30).then((days) => {
      setStats({
        views: days.reduce((a, b) => a + b.views, 0),
        linkClicks: days.reduce((a, b) => a + b.linkClicks, 0),
        socialClicks: days.reduce((a, b) => a + b.socialClicks, 0),
      });
    });
  }, [profile?.uid]);

  const profileUrl = `${window.location.origin}/u/${profile?.username || ''}`;

  const tiles = [
    {
      icon: FiEye,
      label: 'Profile Views (30d)',
      value: formatNumber(stats.views),
      color: '#00AAFF',
    },
    {
      icon: FiLink,
      label: 'Link Clicks (30d)',
      value: formatNumber(stats.linkClicks),
      color: '#38BDF8',
    },
    {
      icon: FiShare2,
      label: 'Social Clicks (30d)',
      value: formatNumber(stats.socialClicks),
      color: '#F59E0B',
    },
    {
      icon: FiStar,
      label: 'Status',
      value: profile?.premium ? 'Premium' : 'Free',
      color: profile?.premium ? '#A855F7' : '#6B7280',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">
          Dashboard
        </h1>
        <p className="text-xs text-muted mt-1">
          Overview of your profile activity
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="bg-bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: t.color + '22', color: t.color }}
              >
                <t.icon size={14} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-display">
              {t.value}
            </p>
            <p className="text-[11px] text-muted mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Profile URL + Quick stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card
          title="Your profile URL"
          description="Share this link with your audience"
        >
          <div className="bg-bg-soft border border-border rounded-xl p-3 text-xs font-mono text-brand-soft break-all mb-3">
            {profileUrl}
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={profileUrl} label="Copy link" />
            <Link to="/dashboard/customize">
              <Button size="sm" variant="secondary">
                Edit profile
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Quick stats" description="Content you've published">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xl font-bold text-white">{links.length}</p>
              <p className="text-[10px] text-muted">Links</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{socials.length}</p>
              <p className="text-[10px] text-muted">Socials</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {profile?.badges?.length || 0}
              </p>
              <p className="text-[10px] text-muted">Badges</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}