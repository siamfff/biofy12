import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  UserDoc,
  AppearanceSettings,
  PrivacySettings,
  MusicSettings,
} from '../types';

export function defaultAppearance(): AppearanceSettings {
  return {
    theme: 'black-cyan',
    primaryColor: '#00AAFF',
    accentColor: '#00AAFF',
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    iconColor: '#00AAFF',
    backgroundEffectColor: '#FFFFFF',
    profileGradientEnabled: false,
    backgroundBlur: 0,
    backgroundOpacity: 100,
    profileBlur: 12,
    profileOpacity: 20,
    cardOpacity: 40,
    cardBlur: 16,
    cardBorder: 1,
    cardRadius: 16,
    shadowIntensity: 50,
    animationEnabled: true,
    cursorStyle: 'default',
    fontFamily: 'Inter',
    backgroundType: 'color',
    backgroundGradient:
      'linear-gradient(135deg, #000000 0%, #0a0a0a 60%, #000000 100%)',
    backgroundVideo: null,
    backgroundEffect: 'particles',
    bioColor: '#FFFFFF',
    bioWeight: 'normal',
    bioSize: 14,
    glowEnabled: true,
    glowColor: '#00AAFF',
    glowIntensity: 60,
    glowTargets: {
      username: true,
      socials: true,
      badges: true,
      avatar: true,
      links: false,
    },
    usernameEffect: 'none',
    monochromeIcons: false,
    animatedTitle: false,
    swapBoxColors: false,
    volumeControl: true,
    useDiscordAvatar: false,
    discordAvatarDecoration: false,
    profileWidget: 'none',
    showPremiumBadge: true,
    bioTypewriter: false,
  };
}

export function defaultPrivacy(): PrivacySettings {
  return {
    publicProfile: true,
    showAnalytics: false,
    allowMessages: true,
    showEmail: false,
  };
}

export function defaultMusic(): MusicSettings {
  return {
    enabled: false,
    url: null,
    title: '',
    artist: '',
    loop: true,
    autoplay: false,
    volume: 50,
    coverUrl: null,
    playerStyle: 'full',
    playerPosition: 'bottom',
  };
}

export function defaultUserDoc(
  uid: string,
  email: string,
  username: string,
  displayName: string,
): Partial<UserDoc> {
  return {
    uid,
    email,
    username,
    usernameChangedAt: null,
    displayName: displayName || username,
    bio: '',
    location: '',
    avatarUrl: null,
    backgroundUrl: null,
    customBackground: null,
    customCursor: null,
    premium: false,
    premiumUntil: null,
    verified: false,
    badges: [],
    role: 'user',
    privacy: defaultPrivacy(),
    appearance: defaultAppearance(),
    music: defaultMusic(),
    profileUrl: null,
    views: 0,
    premiumBadgeVisible: true,
    lastSeen: null,
    isOnline: false,
  };
}

export async function fetchUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function fetchUserByUsername(
  username: string,
): Promise<UserDoc | null> {
  const ref = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  if (!ref.exists()) return null;
  const uid = ref.data().uid;
  return fetchUser(uid);
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserDoc>,
) {
  const ref = doc(db, 'users', uid);
  const blocked = [
    'premium',
    'premiumUntil',
    'verified',
    'badges',
    'role',
    'uid',
    'createdAt',
    'views',
    'usernameChangedAt',
    'lastSeen',
    'isOnline',
  ];
  const safe: Record<string, any> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (!blocked.includes(k)) safe[k] = v;
  }
  await updateDoc(ref, { ...safe, updatedAt: serverTimestamp() });
}

export async function deleteUserAccount(uid: string) {
  await deleteDoc(doc(db, 'users', uid));
}

/* ============================================================
   PREMIUM AUTO-SYNC
   ============================================================ */

export function isPremiumActive(user: UserDoc | null): boolean {
  if (!user) return false;
  if (!user.premium) return false;
  if (!user.premiumUntil) return true;
  try {
    const until = (user.premiumUntil as any).toDate
      ? (user.premiumUntil as any).toDate()
      : new Date(user.premiumUntil as any);
    return until.getTime() > Date.now();
  } catch {
    return false;
  }
}

export async function syncPremiumStatus(uid: string): Promise<void> {
  try {
    const user = await fetchUser(uid);
    if (!user) return;

    const active = isPremiumActive(user);
    const hasPremiumBadge = user.badges?.includes('premium') || false;

    const needsPremiumUpdate = user.premium !== active;
    const needsBadgeUpdate = hasPremiumBadge !== active;

    if (!needsPremiumUpdate && !needsBadgeUpdate) return;

    const nextBadges = active
      ? Array.from(new Set([...(user.badges || []), 'premium']))
      : (user.badges || []).filter((b) => b !== 'premium');

    await updateDoc(doc(db, 'users', uid), {
      premium: active,
      badges: nextBadges,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('[userService] syncPremiumStatus failed:', e);
  }
}