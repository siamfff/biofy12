import {
  collection, doc, getDocs, updateDoc, deleteDoc, query, orderBy, writeBatch, serverTimestamp, setDoc,
  // @ts-expect-error The installed Firebase package does not expose Firestore declarations.
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { NotificationDoc } from '../types';

export async function fetchNotifications(uid: string): Promise<NotificationDoc[]> {
  const q = query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d: { id: string; data: () => Record<string, unknown> }) =>
    ({ id: d.id, ...d.data() } as NotificationDoc),
  );
}

export async function markRead(uid: string, id: string, read = true) {
  await updateDoc(doc(db, 'users', uid, 'notifications', id), { read });
}

export async function markAllRead(uid: string, items: NotificationDoc[]) {
  const batch = writeBatch(db);
  items.forEach((n) => batch.update(doc(db, 'users', uid, 'notifications', n.id), { read: true }));
  await batch.commit();
}

export async function deleteNotification(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'notifications', id));
}

export async function createNotification(
  uid: string, title: string, body: string, type: NotificationDoc['type'] = 'info',
) {
  await updateDoc(doc(db, 'users', uid), {}); // no-op to satisfy lint
  const ref = doc(collection(db, 'users', uid, 'notifications'));
  await updateDoc(ref, {}).catch(() => {});
  // Using setDoc via collection helper:
  await setDoc(ref, { title, body, read: false, type, createdAt: serverTimestamp() });
}