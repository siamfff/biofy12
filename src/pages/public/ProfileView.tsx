import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserByUsername } from '../../services/userService';
import { fetchLinks, fetchSocials, fetchWidgets } from '../../services/profileService';
import { trackEvent } from '../../services/analyticsService';
import { UserDoc, LinkItem, SocialItem, WidgetItem } from '../../types';
import { ProfilePreview } from '../../components/profile/ProfilePreview';
import { ProfilePromoCard } from '../../components/public/ProfilePromoCard';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ProfileView() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [socials, setSocials] = useState<SocialItem[]>([]);
  const [widgets, setWidgets] = useState<WidgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!username) return;
      const u = await fetchUserByUsername(username);
      if (u) {
        if (!u.privacy?.publicProfile) {
          setProfile(null);
          setLoading(false);
          return;
        }
        setProfile(u);
        const [l, s, w] = await Promise.all([
          fetchLinks(u.uid),
          fetchSocials(u.uid),
          fetchWidgets(u.uid),
        ]);
        setLinks(l);
        setSocials(s);
        setWidgets(w);

        // Track view + auto-increment total views (trackEvent handles both)
        trackEvent(u.uid, {
          type: 'view',
          referrer: document.referrer,
        }).catch(() => {});
      }
      setLoading(false);
    })();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Spinner size={36} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <EmptyState
          title="Profile not found"
          description="This profile doesn't exist or is private."
        />
      </div>
    );
  }

  return (
    <>
      <ProfilePreview
        profile={profile}
        links={links}
        socials={socials}
        widgets={widgets}
        fullScreen
      />
      <ProfilePromoCard username={profile.username || undefined} />
    </>
  );
}