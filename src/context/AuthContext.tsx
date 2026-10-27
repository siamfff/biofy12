import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { fetchUser, syncPremiumStatus } from '../services/userService';
import { updatePresence, markOffline } from '../utils/presence';
import { UserDoc } from '../types';

interface AuthContextValue {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const HEARTBEAT_MS = 60_000; // 1 minute

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Auto-sync premium status
        await syncPremiumStatus(u.uid).catch(() => {});
        // Mark online
        await updatePresence(u.uid).catch(() => {});
        const p = await fetchUser(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Presence heartbeat
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updatePresence(user.uid).catch(() => {});
    }, HEARTBEAT_MS);

    const handleBeforeUnload = () => {
      markOffline(user.uid).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    let hiddenTimer: ReturnType<typeof setTimeout> | null = null;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTimer = setTimeout(() => {
          markOffline(user.uid).catch(() => {});
        }, 30_000);
      } else {
        if (hiddenTimer) clearTimeout(hiddenTimer);
        updatePresence(user.uid).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      if (hiddenTimer) clearTimeout(hiddenTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const refreshProfile = async () => {
    if (!user) return;
    await syncPremiumStatus(user.uid).catch(() => {});
    const p = await fetchUser(user.uid);
    setProfile(p);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}