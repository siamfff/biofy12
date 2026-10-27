import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { RedeemCode } from '../types';

export type RedeemResult =
  | { ok: true; type: RedeemCode['type']; value: string | number }
  | { ok: false; error: string };

export async function redeemCode(
  uid: string,
  code: string,
): Promise<RedeemResult> {
  const normalized = code.trim().toUpperCase();
  const codeRef = doc(db, 'redeemCodes', normalized);
  const snap = await getDoc(codeRef);
  if (!snap.exists()) return { ok: false, error: 'Invalid code' };
  const data = snap.data() as RedeemCode;
  if (data.used) return { ok: false, error: 'Code already used' };

  await updateDoc(codeRef, {
    used: true,
    usedBy: uid,
    usedAt: serverTimestamp(),
  });

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const currentBadges: string[] = (userSnap.data()?.badges as string[]) || [];

  if (data.type === 'premium') {
    const days = typeof data.value === 'number' ? data.value : 30;
    const until = new Date();
    until.setDate(until.getDate() + days);

    // Auto-grant premium badge
    const nextBadges = Array.from(new Set([...currentBadges, 'premium']));

    await updateDoc(userRef, {
      premium: true,
      premiumUntil: until,
      badges: nextBadges,
    });
  } else if (data.type === 'badge') {
    const badgeKey = String(data.value);
    const nextBadges = Array.from(new Set([...currentBadges, badgeKey]));
    await updateDoc(userRef, { badges: nextBadges });
  } else if (data.type === 'verified') {
    await updateDoc(userRef, { verified: true });
  }

  await addDoc(collection(db, 'redeemHistory', uid, 'entries'), {
    code: normalized,
    type: data.type,
    value: data.value,
    redeemedAt: serverTimestamp(),
  });

  return { ok: true, type: data.type, value: data.value };
}

export async function submitVerificationApplication(
  uid: string,
  fullName: string,
  reason: string,
  links: string,
) {
  await setDoc(doc(db, 'verificationApplications', uid), {
    uid,
    fullName,
    reason,
    links,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}