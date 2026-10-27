import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { fetchLinks, fetchSocials, fetchWidgets } from '../services/profileService';
import { LinkItem, SocialItem, WidgetItem } from '../types';

export function useProfileData() {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [socials, setSocials] = useState<SocialItem[]>([]);
  const [widgets, setWidgets] = useState<WidgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!user) return;
    setLoading(true);
    const [l, s, w] = await Promise.all([
      fetchLinks(user.uid),
      fetchSocials(user.uid),
      fetchWidgets(user.uid),
    ]);
    setLinks(l);
    setSocials(s);
    setWidgets(w);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [user?.uid]);

  return { links, socials, widgets, loading, reload };
}