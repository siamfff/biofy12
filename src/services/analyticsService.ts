import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  runTransaction,
  Transaction,
}
// @ts-ignore Firebase package currently has no discoverable declarations.
from 'firebase/firestore';
import { db } from '../firebase/config';
import { AnalyticsEvent, DailyAnalytics } from '../types';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================
// DUPLICATE VIEW PREVENTION
// One view per device per 24 hours.
// ============================================================
const VIEW_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function hasViewedRecently(profileUid: string): boolean {
  try {
    const key = `nebula_last_view_${profileUid}`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (!ts || isNaN(ts)) return false;
    return Date.now() - ts < VIEW_WINDOW_MS;
  } catch {
    return false; // localStorage unavailable → allow
  }
}

function markViewedNow(profileUid: string) {
  try {
    localStorage.setItem(
      `nebula_last_view_${profileUid}`,
      String(Date.now()),
    );
  } catch {
    /* ignore */
  }
}

/**
 * Track a page view / click.
 * Auto-increments the user's total views counter.
 * De-duplicates views from the same device within 24 hours.
 */
export async function trackEvent(
  uid: string,
  event: Omit<AnalyticsEvent, 'timestamp'>,
) {
  try {
    // Skip if this device already viewed recently (24h window)
    if (event.type === 'view') {
      if (hasViewedRecently(uid)) {
        return;
      }
      markViewedNow(uid);
    }

    // 1. Log individual event
    await addDoc(collection(db, 'users', uid, 'analytics'), {
      ...event,
      timestamp: serverTimestamp(),
    });

    // 2. Daily aggregate
    const dayRef = doc(db, 'analyticsDaily', uid, 'days', todayKey());
    const field =
      event.type === 'view'
        ? 'views'
        : event.type === 'link_click'
          ? 'linkClicks'
          : 'socialClicks';

    await setDoc(
      dayRef,
      { date: todayKey(), [field]: increment(1) },
      { merge: true },
    );

    // 3. Total views counter (only for views)
    if (event.type === 'view') {
      await incrementTotalViews(uid);
    }
  } catch (e) {
    console.warn('[analytics] trackEvent failed:', e);
  }
}

/**
 * Increment total views. Auto-inits `views: 1` if missing.
 * Uses transaction to prevent race conditions.
 */
export async function incrementTotalViews(uid: string) {
  const userRef = doc(db, 'users', uid);
  try {
    await runTransaction(db, async (tx: Transaction) => {
      const snap = await tx.get(userRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const current = typeof data.views === 'number' ? data.views : null;

      if (current === null) {
        tx.update(userRef, { views: 1 });
      } else {
        tx.update(userRef, { views: increment(1) });
      }
    });
  } catch (e) {
    console.warn('[analytics] incrementTotalViews failed:', e);
  }
}

/**
 * Reset your OWN views to 0 (via dashboard button).
 */
export async function resetMyViews(uid: string) {
  try {
    await updateDoc(doc(db, 'users', uid), { views: 0 });
  } catch (e) {
    console.warn('[analytics] resetMyViews failed:', e);
  }
}

export async function fetchDailyAnalytics(
  uid: string,
  days = 30,
): Promise<DailyAnalytics[]> {
  const snap = await getDocs(collection(db, 'analyticsDaily', uid, 'days'));
  const all = snap.docs.map(
    (d: { data: () => DailyAnalytics }) => d.data(),
  );
  const map = new Map<string, DailyAnalytics>(
    all.map((d: DailyAnalytics): [string, DailyAnalytics] => [d.date, d]),
  );
  const out: DailyAnalytics[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(
      map.get(key) || { date: key, views: 0, linkClicks: 0, socialClicks: 0 },
    );
  }
  return out;
}

export async function fetchRecentEvents(
  uid: string,
  max = 50,
): Promise<AnalyticsEvent[]> {
  const q = query(
    collection(db, 'users', uid, 'analytics'),
    orderBy('timestamp', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d: { data: () => AnalyticsEvent }) => d.data() as AnalyticsEvent,
  );
}