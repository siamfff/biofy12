// @ts-ignore Firebase's installed package is missing Firestore declarations.
import { collection, getDocs, limit, query, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserDoc } from '../types';

/**
 * Fetch leaderboard — top 50 by views.
 * Includes users without `views` field (treated as 0).
 */
export async function fetchLeaderboard(max = 50): Promise<UserDoc[]> {
  try {
    // Fetch ALL users (no orderBy) — includes users without views field
    const q = query(collection(db, 'users'), limit(500));
    const snap = await getDocs(q);
    return snap.docs
      .map((d: { data: () => UserDoc }) => d.data() as UserDoc)
      .filter(
        (u: UserDoc) =>
          !!u.username &&
          u.privacy?.publicProfile !== false,
      )
      .sort((a: UserDoc, b: UserDoc) => (b.views || 0) - (a.views || 0))
      .slice(0, max);
  } catch (e) {
    console.error('[leaderboard] fetch failed:', e);
    return [];
  }
}

/**
 * Live leaderboard subscription.
 */
export function subscribeLeaderboard(
  callback: (users: UserDoc[]) => void,
  max = 50,
): Unsubscribe {
  const q = query(collection(db, 'users'), limit(500));

  return onSnapshot(
    q,
    (snap: { docs: Array<{ data: () => UserDoc }> }) => {
      const users = snap.docs
        .map((d) => d.data() as UserDoc)
        .filter(
          (u) =>
            !!u.username &&
            u.privacy?.publicProfile !== false,
        )
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, max);
      callback(users);
    },
    (err: unknown) => {
      console.warn('[leaderboard] live snapshot failed:', err);
      fetchLeaderboard(max).then(callback);
    },
  );
}