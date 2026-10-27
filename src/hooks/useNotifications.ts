import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { fetchNotifications } from '../services/notificationService';
import { NotificationDoc } from '../types';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const n = await fetchNotifications(user.uid);
    setNotifications(n);
    setLoading(false);
  }, [user?.uid]);

  useEffect(() => { reload(); }, [reload]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, reload, unreadCount };
}