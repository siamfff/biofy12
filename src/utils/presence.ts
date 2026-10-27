import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const ONLINE_THRESHOLD_MS = 60 * 1000; // 1 min
const AWAY_THRESHOLD_MS = 5 * 60 * 1000; // 5 min

/**
 * Update the current user's lastSeen timestamp + online flag.
 * Call this on login, page visits, and periodic heartbeat.
 */
export async function updatePresence(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      lastSeen: serverTimestamp(),
      isOnline: true,
    });
  } catch (e) {
    console.warn('[presence] updatePresence failed:', e);
  }
}

/**
 * Mark the current user as offline.
 * Call this on logout / beforeunload.
 */
export async function markOffline(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      lastSeen: serverTimestamp(),
      isOnline: false,
    });
  } catch (e) {
    console.warn('[presence] markOffline failed:', e);
  }
}

export interface PresenceStatus {
  isOnline: boolean;
  isAway: boolean;
  statusText: string;
  color: string;
  dotClass: string;
}

/**
 * Get presence status from a user doc.
 */
export function getPresenceStatus(user: any): PresenceStatus {
  const lastSeen = user?.lastSeen;
  const isOnlineFlag = user?.isOnline === true;

  if (!lastSeen) {
    return {
      isOnline: false,
      isAway: false,
      statusText: 'Offline',
      color: '#6B7280',
      dotClass: 'bg-gray-500',
    };
  }

  const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
  const elapsed = Date.now() - date.getTime();

  if (isOnlineFlag && elapsed < ONLINE_THRESHOLD_MS) {
    return {
      isOnline: true,
      isAway: false,
      statusText: 'Online now',
      color: '#22C55E',
      dotClass: 'bg-green-500',
    };
  }

  if (elapsed < AWAY_THRESHOLD_MS) {
    return {
      isOnline: false,
      isAway: true,
      statusText: formatLastSeen(elapsed),
      color: '#F59E0B',
      dotClass: 'bg-amber-500',
    };
  }

  return {
    isOnline: false,
    isAway: false,
    statusText: formatLastSeen(elapsed),
    color: '#6B7280',
    dotClass: 'bg-gray-500',
  };
}

/**
 * Human-readable last seen text.
 */
export function formatLastSeen(elapsedMs: number): string {
  const seconds = Math.floor(elapsedMs / 1000);
  if (seconds < 60) return 'Last seen just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Last seen ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Last seen ${days}d ago`;

  return 'Last seen a while ago';
}