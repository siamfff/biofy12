import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { checkUsernameExists } from '../../services/authService';
import { updateUserProfile } from '../../services/userService';
// @ts-expect-error Firestore's module declarations are unavailable in the current Firebase setup.
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { validateUsername } from '../../utils/validation';

export default function SetupUsername() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const debouncedUsername = useDebounce(username, 400);

  // Prefill display name
  useEffect(() => {
    if (profile?.displayName) setDisplayName(profile.displayName);
    else if (user?.displayName) setDisplayName(user.displayName);
  }, [profile?.uid, user?.uid]);

  // Already has username → dashboard
  useEffect(() => {
    if (!loading && profile?.username) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, profile?.username]);

  // Not logged in → login
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, user]);

  // Username availability check
  useEffect(() => {
    let cancelled = false;
    if (!debouncedUsername) {
      setAvailable(null);
      setError('');
      return;
    }
    const res = validateUsername(debouncedUsername);
    if (!res.valid) {
      setAvailable(null);
      setError(res.error!);
      return;
    }
    setError('');
    setChecking(true);
    setAvailable(null);
    checkUsernameExists(debouncedUsername)
      .then((exists) => {
        if (cancelled) return;
        setAvailable(!exists);
        if (exists) setError('Username is already taken');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to check username');
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedUsername]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Not signed in');
      return;
    }

    const clean = username.trim().toLowerCase();

    // ---- Validation ----
    const res = validateUsername(clean);
    if (!res.valid) {
      setError(res.error!);
      toast.error(res.error!);
      return;
    }
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // ---- Re-check availability server-side (fresh read) ----
      const usernameRef = doc(db, 'usernames', clean);
      const snap = await getDoc(usernameRef);
      if (snap.exists()) {
        const owner = snap.data()?.uid;
        if (owner && owner !== user.uid) {
          const msg = 'Username is already taken';
          setError(msg);
          setAvailable(false);
          toast.error(msg);
          return;
        }
      }

      // ---- Reserve username atomically ----
      // If the doc exists and belongs to us, we can overwrite it.
      // Otherwise create. Rules prevent creating over someone else's.
      try {
        await setDoc(usernameRef, { uid: user.uid });
      } catch (err: any) {
        const msg = 'Username was just taken. Please pick another.';
        setError(msg);
        setAvailable(false);
        toast.error(msg);
        return;
      }

      // ---- Remove old temp username reservation (if any) ----
      if (profile?.username && profile.username !== clean) {
        try {
          const oldRef = doc(db, 'usernames', profile.username);
          const oldSnap = await getDoc(oldRef);
          if (oldSnap.exists() && oldSnap.data()?.uid === user.uid) {
            await deleteDoc(oldRef);
          }
        } catch {
          /* ignore */
        }
      }

      // ---- Update user doc ----
      await updateUserProfile(user.uid, {
        username: clean,
        displayName: displayName.trim(),
        bio: bio.trim(),
      });

      await refreshProfile();
      toast.success('Profile set up!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.message?.replace('Firebase: ', '') || 'Setup failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <span className="h-8 w-8 border-2 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const canSubmit =
    !!username.trim() &&
    available === true &&
    !checking &&
    !saving &&
    !!displayName.trim();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-brand items-center justify-center font-bold text-xl mb-4 shadow-glow text-white">
            N
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            Set your username
          </h1>
          <p className="text-xs text-muted mt-1">
            Choose a unique name for your profile
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="yourname"
            leftIcon={<span className="text-muted text-sm">@</span>}
            error={error}
            hint={
              checking
                ? 'Checking availability…'
                : available === true
                  ? '✓ Available'
                  : available === false
                    ? '✗ Taken'
                    : '3-30 chars, a-z, 0-9, _ .'
            }
            autoFocus
          />

          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your Name"
            maxLength={40}
          />

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Bio (optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="A short line about you…"
              className="w-full bg-bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition resize-none"
            />
            <p className="text-[11px] text-muted mt-1">{bio.length}/280</p>
          </div>

          <Button type="submit" fullWidth loading={saving} disabled={!canSubmit}>
            Continue
          </Button>

          {!canSubmit && !saving && (
            <p className="text-[11px] text-muted text-center">
              {checking
                ? 'Checking username…'
                : available !== true
                  ? 'Pick an available username to continue'
                  : !displayName.trim()
                    ? 'Enter a display name'
                    : ''}
            </p>
          )}
        </form>

        <p className="text-center text-xs text-muted mt-6">
          You can change this later in Settings
        </p>
      </div>
    </div>
  );
}