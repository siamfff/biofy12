import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateEmail,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  User,
// @ts-ignore Firebase declarations are not resolved by the current project configuration.
} from 'firebase/auth';
// @ts-ignore Firebase declarations are not resolved by the current project configuration.
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { defaultUserDoc } from './userService';

export async function registerUser(
  email: string,
  password: string,
  username: string,
  displayName: string,
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  await setDoc(doc(db, 'usernames', username.toLowerCase()), { uid });

  await setDoc(doc(db, 'users', uid), {
    ...defaultUserDoc(uid, email, username, displayName),
    views: 0,           // ✅ explicit init
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'users', uid, 'notifications', 'welcome'), {
    title: 'Welcome to Nebula',
    body: 'Your profile is live. Start customizing it!',
    read: false,
    type: 'success',
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function loginUser(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle(): Promise<{
  user: User;
  isNewUser: boolean;
}> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { user, isNewUser: false };
  }

  const email = user.email || '';
  const displayName = user.displayName || email.split('@')[0] || 'User';

  await setDoc(userRef, {
    ...defaultUserDoc(user.uid, email, '', displayName),
    username: null,
    avatarUrl: user.photoURL || null,
    views: 0,           // ✅ explicit init
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { user, isNewUser: true };
}

export async function logoutUser() {
  await signOut(auth);
}

export async function changeEmail(user: User, newEmail: string, currentPassword: string) {
  const cred = EmailAuthProvider.credential(user.email!, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updateEmail(user, newEmail);
}

export async function changePassword(user: User, newPassword: string, currentPassword: string) {
  const cred = EmailAuthProvider.credential(user.email!, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  return snap.exists();
}