import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserDoc, AdminStats, AdminLog, VerificationApplication } from '../types';

/* ============================================================
   USER MANAGEMENT
   ============================================================ */

export async function fetchAllUsers(): Promise<UserDoc[]> {
  const snap = await getDocs(query(collection(db, 'users'), limit(1000)));
  return snap.docs.map((d) => d.data() as UserDoc);
}

export async function fetchUserById(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

/**
 * Grant or revoke premium.
 * Auto-grants/removes premium badge.
 */
export async function adminSetPremium(
  uid: string,
  premium: boolean,
  days = 30,
): Promise<void> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const current: string[] = (snap.data()?.badges as string[]) || [];

  if (premium) {
    const until = new Date();
    until.setDate(until.getDate() + days);
    const nextBadges = Array.from(new Set([...current, 'premium']));

    await updateDoc(ref, {
      premium: true,
      premiumUntil: until,
      badges: nextBadges,
      updatedAt: serverTimestamp(),
    });
  } else {
    const nextBadges = current.filter((b) => b !== 'premium');

    await updateDoc(ref, {
      premium: false,
      premiumUntil: null,
      badges: nextBadges,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function adminSetVerified(uid: string, verified: boolean) {
  await updateDoc(doc(db, 'users', uid), { verified });
}

export async function adminSetBadge(
  uid: string,
  badge: string,
  add: boolean,
) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current: string[] = (snap.data()?.badges as string[]) || [];
  const next = add
    ? Array.from(new Set([...current, badge]))
    : current.filter((b) => b !== badge);
  await updateDoc(ref, { badges: next });
}

export async function adminDeleteUser(uid: string) {
  await deleteDoc(doc(db, 'users', uid));
}

/* ============================================================
   DASHBOARD STATS
   ============================================================ */

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const usersSnap = await getDocs(
      query(collection(db, 'users'), limit(1000)),
    );
    const users = usersSnap.docs.map((d) => d.data() as UserDoc);

    const totalUsers = users.length;
    const totalPremium = users.filter((u) => u.premium).length;
    const totalVerified = users.filter((u) => u.verified).length;

    const totalViews = users.reduce(
      (sum, u) => sum + (Number(u.views) || 0),
      0,
    );

    let totalLinks = 0;
    let totalSocials = 0;

    const counts = await Promise.allSettled(
      users.map(async (u) => {
        const [l, s] = await Promise.allSettled([
          getDocs(collection(db, 'users', u.uid, 'links')),
          getDocs(collection(db, 'users', u.uid, 'socials')),
        ]);
        return {
          links: l.status === 'fulfilled' ? l.value.size : 0,
          socials: s.status === 'fulfilled' ? s.value.size : 0,
        };
      }),
    );

    for (const c of counts) {
      if (c.status === 'fulfilled') {
        totalLinks += c.value.links;
        totalSocials += c.value.socials;
      }
    }

    const recentSignups = [...users]
      .sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
      })
      .slice(0, 10);

    return {
      totalUsers,
      totalPremium,
      totalVerified,
      totalViews,
      totalLinks,
      totalSocials,
      recentSignups,
    };
  } catch (e) {
    console.error('[admin] fetchAdminStats failed:', e);
    return {
      totalUsers: 0,
      totalPremium: 0,
      totalVerified: 0,
      totalViews: 0,
      totalLinks: 0,
      totalSocials: 0,
      recentSignups: [],
    };
  }
}

/* ============================================================
   REDEEM CODES (Admin)
   ============================================================ */

export async function adminCreateRedeemCode(
  code: string,
  type: 'premium' | 'badge' | 'verified',
  value: string | number,
): Promise<void> {
  const normalized = code.trim().toUpperCase();
  await setDoc(doc(db, 'redeemCodes', normalized), {
    code: normalized,
    type,
    value,
    used: false,
    usedBy: null,
    usedAt: null,
    createdAt: serverTimestamp(),
  });
}

export async function adminListRedeemCodes(): Promise<any[]> {
  const snap = await getDocs(collection(db, 'redeemCodes'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function adminDeleteRedeemCode(code: string): Promise<void> {
  await deleteDoc(doc(db, 'redeemCodes', code));
}

/* ============================================================
   VERIFICATION APPLICATIONS
   ============================================================ */

export async function fetchVerificationApplications(): Promise<
  (VerificationApplication & { id: string })[]
> {
  const snap = await getDocs(collection(db, 'verificationApplications'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
}

export async function adminApproveVerification(uid: string): Promise<void> {
  await updateDoc(doc(db, 'verificationApplications', uid), {
    status: 'approved',
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', uid), { verified: true });
}

export async function adminRejectVerification(uid: string): Promise<void> {
  await updateDoc(doc(db, 'verificationApplications', uid), {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });
}

/* ============================================================
   NOTIFICATIONS (Admin → User)
   ============================================================ */

export async function sendNotificationToUser(
  uid: string,
  title: string,
  body: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
): Promise<void> {
  const ref = doc(collection(db, 'users', uid, 'notifications'));
  await setDoc(ref, {
    title,
    body,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/* ============================================================
   ADMIN LOGS
   ============================================================ */

export async function logAdminAction(
  adminUid: string,
  adminUsername: string,
  action: string,
  targetUid?: string,
  targetUsername?: string,
  details?: Record<string, any>,
): Promise<void> {
  try {
    await addDoc(collection(db, 'adminLogs'), {
      adminUid,
      adminUsername,
      action,
      targetUid: targetUid || null,
      targetUsername: targetUsername || null,
      details: details || null,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.warn('[admin] log failed:', e);
  }
}

export async function fetchAdminLogs(max = 100): Promise<AdminLog[]> {
  const q = query(
    collection(db, 'adminLogs'),
    orderBy('timestamp', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminLog));
}