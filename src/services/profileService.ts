import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { LinkItem, SocialItem, WidgetItem } from '../types';

// ---------- LINKS ----------
export async function fetchLinks(uid: string): Promise<LinkItem[]> {
  const q = query(collection(db, 'users', uid, 'links'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LinkItem));
}

export async function addLink(uid: string, link: Omit<LinkItem, 'id'>) {
  const ref = await addDoc(collection(db, 'users', uid, 'links'), { ...link, clicks: 0 });
  return ref.id;
}

export async function updateLink(uid: string, id: string, updates: Partial<LinkItem>) {
  await updateDoc(doc(db, 'users', uid, 'links', id), updates);
}

export async function deleteLink(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'links', id));
}

export async function reorderLinks(uid: string, items: LinkItem[]) {
  const batch = writeBatch(db);
  items.forEach((it, idx) => {
    batch.update(doc(db, 'users', uid, 'links', it.id), { order: idx });
  });
  await batch.commit();
}

// ---------- SOCIALS ----------
export async function fetchSocials(uid: string): Promise<SocialItem[]> {
  const q = query(collection(db, 'users', uid, 'socials'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SocialItem));
}

export async function addSocial(uid: string, social: Omit<SocialItem, 'id'>) {
  const ref = await addDoc(collection(db, 'users', uid, 'socials'), { ...social, clicks: 0 });
  return ref.id;
}

export async function updateSocial(uid: string, id: string, updates: Partial<SocialItem>) {
  await updateDoc(doc(db, 'users', uid, 'socials', id), updates);
}

export async function deleteSocial(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'socials', id));
}

export async function reorderSocials(uid: string, items: SocialItem[]) {
  const batch = writeBatch(db);
  items.forEach((it, idx) => {
    batch.update(doc(db, 'users', uid, 'socials', it.id), { order: idx });
  });
  await batch.commit();
}

// ---------- WIDGETS ----------
export async function fetchWidgets(uid: string): Promise<WidgetItem[]> {
  const q = query(collection(db, 'users', uid, 'widgets'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WidgetItem));
}

export async function addWidget(uid: string, widget: Omit<WidgetItem, 'id'>) {
  const ref = await addDoc(collection(db, 'users', uid, 'widgets'), widget);
  return ref.id;
}

export async function updateWidget(uid: string, id: string, updates: Partial<WidgetItem>) {
  await updateDoc(doc(db, 'users', uid, 'widgets', id), updates);
}

export async function deleteWidget(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'widgets', id));
}

export async function reorderWidgets(uid: string, items: WidgetItem[]) {
  const batch = writeBatch(db);
  items.forEach((it, idx) => {
    batch.update(doc(db, 'users', uid, 'widgets', it.id), { order: idx });
  });
  await batch.commit();
}