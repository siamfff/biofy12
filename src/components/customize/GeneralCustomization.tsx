import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/userService';
import { checkUsernameExists } from '../../services/authService';
import { updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { Switch } from '../ui/Switch';
import { ColorPicker } from '../common/ColorPicker';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { AppearanceSettings } from '../../types';
import {
  FiSave,
  FiUser,
  FiLock,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import { validateUsername } from '../../utils/validation';
import { getUsernameChangeStatus } from '../../utils/format';

interface Props {
  appearance: AppearanceSettings;
  setAppearance: (a: AppearanceSettings) => void;
}

const BG_EFFECTS: AppearanceSettings['backgroundEffect'][] = [
  'none',
  'rain',
  'snow',
  'stars',
  'particles',
  'matrix',
];

export function GeneralCustomization({ appearance, setAppearance }: Props) {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();

  const [description, setDescription] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [saving, setSaving] = useState(false);

  // Username states
  const [username, setUsername] = useState(profile?.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [usernameSaving, setUsernameSaving] = useState(false);
  const debouncedUsername = useDebounce(username, 400);

  // Display name (auto-save local state for live feedback)
  const [displayName, setDisplayName] = useState(profile?.displayName || '');

  // Cooldown check
  const cooldownStatus = getUsernameChangeStatus(
    (profile as any)?.usernameChangedAt,
  );
  const canChangeUsername = cooldownStatus.canChange;
  const usernameChanged = username !== (profile?.username || '');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setDescription(profile.bio || '');
      setLocation(profile.location || '');
      setDisplayName(profile.displayName || '');
    }
  }, [profile?.uid]);

  // Username availability check
  useEffect(() => {
    let cancelled = false;

    if (!debouncedUsername || debouncedUsername === profile?.username) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    const res = validateUsername(debouncedUsername);
    if (!res.valid) {
      setUsernameAvailable(null);
      setUsernameError(res.error || 'Invalid username');
      return;
    }

    setUsernameError('');
    setUsernameChecking(true);
    setUsernameAvailable(null);

    checkUsernameExists(debouncedUsername)
      .then((exists) => {
        if (cancelled) return;
        setUsernameAvailable(!exists);
        if (exists) setUsernameError('Username is already taken');
      })
      .catch((err) => {
        if (cancelled) return;
        setUsernameError(err?.message || 'Failed to check username');
      })
      .finally(() => {
        if (!cancelled) setUsernameChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedUsername, profile?.username]);

  if (!profile) return null;

  const update = <K extends keyof AppearanceSettings>(
    k: K,
    v: AppearanceSettings[K],
  ) => setAppearance({ ...appearance, [k]: v });

  const updateGlowTarget = (
    target: keyof AppearanceSettings['glowTargets'],
    v: boolean,
  ) => {
    setAppearance({
      ...appearance,
      glowTargets: { ...appearance.glowTargets, [target]: v },
    });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        bio: description,
        location,
        displayName,
        appearance,
      });
      await refreshProfile();
      toast.success('Saved');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const autoSaveAppearance = async (next: AppearanceSettings) => {
    setAppearance(next);
    try {
      await updateUserProfile(profile.uid, { appearance: next });
      await refreshProfile();
    } catch {
      /* silent */
    }
  };

  // Display name — auto save on blur
  const handleDisplayNameBlur = async () => {
    if (!profile) return;
    if (displayName === profile.displayName) return;
    try {
      await updateUserProfile(profile.uid, { displayName });
      await refreshProfile();
    } catch {
      /* silent */
    }
  };

  // Username save with cooldown
  const handleUsernameChange = async () => {
    if (!profile) return;

    if (!canChangeUsername) {
      toast.error(
        `You can change your username in ${cooldownStatus.remainingText}`,
      );
      return;
    }

    if (!usernameChanged) return;

    const res = validateUsername(username);
    if (!res.valid) {
      setUsernameError(res.error || 'Invalid username');
      toast.error(res.error || 'Invalid username');
      return;
    }

    if (usernameAvailable === false) {
      toast.error('Username is already taken');
      return;
    }
    if (usernameAvailable !== true) {
      toast.error('Please wait — checking username…');
      return;
    }

    setUsernameSaving(true);
    try {
      const clean = username.trim().toLowerCase();

      // Fresh check
      const stillExists = await checkUsernameExists(clean);
      if (stillExists) {
        toast.error('Username was just taken. Please pick another.');
        setUsernameAvailable(false);
        return;
      }

      // Reserve new username
      await setDoc(doc(db, 'usernames', clean), { uid: profile.uid });

      // Remove old username reservation
      if (profile.username && profile.username !== clean) {
        try {
          await deleteDoc(doc(db, 'usernames', profile.username));
        } catch {
          /* ignore */
        }
      }

      // Update user doc with new username + timestamp
      await updateDoc(doc(db, 'users', profile.uid), {
        username: clean,
        usernameChangedAt: new Date(),
      });

      await refreshProfile();
      toast.success('Username updated. You can change it again in 3 days.');
      setUsernameError('');
      setUsernameAvailable(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to change username');
    } finally {
      setUsernameSaving(false);
    }
  };

  return (
    <section id="general" className="scroll-mt-24">
      <Card title="General Customization">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
          {/* ==== USERNAME WITH COOLDOWN ==== */}
          <div className="sm:col-span-2 rounded-xl border border-border bg-bg-soft p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiUser size={14} className="text-brand-soft" />
              <label className="text-xs font-semibold text-white">
                Username
              </label>
              {canChangeUsername ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success font-medium">
                  Can change
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-medium flex items-center gap-1">
                  <FiLock size={9} /> 3-day cooldown
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  disabled={!canChangeUsername}
                  placeholder="username"
                  leftIcon={<span className="text-muted text-sm">@</span>}
                  error={usernameError}
                  hint={
                    !canChangeUsername
                      ? `Next change available in ${cooldownStatus.remainingText}`
                      : usernameChecking
                        ? 'Checking availability…'
                        : usernameAvailable === true
                          ? '✓ Available'
                          : usernameAvailable === false
                            ? '✗ Taken'
                            : '3-30 chars, a-z, 0-9, _ .'
                  }
                />
              </div>

              <Button
                onClick={handleUsernameChange}
                loading={usernameSaving}
                disabled={
                  !canChangeUsername ||
                  !usernameChanged ||
                  usernameAvailable !== true ||
                  usernameChecking
                }
                className="sm:self-start sm:mt-6"
              >
                <FiCheck size={14} /> Save Username
              </Button>
            </div>

            {!canChangeUsername && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/30 px-3 py-2">
                <FiAlertCircle
                  size={12}
                  className="text-warning shrink-0 mt-0.5"
                />
                <p className="text-[11px] text-warning">
                  Username can only be changed once every 3 days. Your next
                  change is available in{' '}
                  <span className="font-semibold">
                    {cooldownStatus.remainingText}
                  </span>
                  .
                </p>
              </div>
            )}

            {canChangeUsername && (profile as any)?.usernameChangedAt && (
              <p className="mt-2 text-[10px] text-muted">
                Last changed:{' '}
                {(profile as any).usernameChangedAt.toDate
                  ? (profile as any).usernameChangedAt
                      .toDate()
                      .toLocaleDateString()
                  : new Date(
                      (profile as any).usernameChangedAt,
                    ).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* ==== DISPLAY NAME (no cooldown) ==== */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={handleDisplayNameBlur}
              placeholder="Your display name"
              maxLength={40}
            />
            <p className="text-[10px] text-muted mt-1">
              Auto-saves when you click outside · Can change anytime
            </p>
          </div>

          {/* ==== DESCRIPTION ==== */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Description (Bio)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the world about you…"
              maxLength={280}
            />
            <p className="text-[10px] text-muted mt-1">
              {description.length}/280
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              maxLength={60}
            />
          </div>

          {/* Profile Widget */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Profile Widget{' '}
              <span className="text-[9px] text-brand-soft">New</span>
            </label>
            <select
              value={appearance.profileWidget}
              onChange={(e) =>
                autoSaveAppearance({
                  ...appearance,
                  profileWidget: e.target.value as any,
                })
              }
              className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2.5 text-sm text-white"
            >
              <option value="none">None</option>
              <option value="discord">Discord Presence</option>
              <option value="spotify">Spotify</option>
              <option value="custom">Custom Text</option>
            </select>
          </div>

          {/* Profile Opacity */}
          <div>
            <Slider
              label="Profile Opacity"
              value={appearance.profileOpacity ?? 0}
              suffix="%"
              onChange={(v) =>
                autoSaveAppearance({ ...appearance, profileOpacity: v })
              }
            />
            <p className="text-[10px] text-muted mt-1">
              Glass panel behind your content
            </p>
          </div>

          {/* Profile Blur */}
          <div>
            <Slider
              label="Profile Blur"
              value={appearance.profileBlur ?? 0}
              max={80}
              suffix="px"
              onChange={(v) =>
                autoSaveAppearance({ ...appearance, profileBlur: v })
              }
            />
          </div>

          {/* Background Effects */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Background Effects
            </label>
            <div className="flex flex-wrap gap-2">
              {BG_EFFECTS.map((eff) => (
                <button
                  key={eff}
                  type="button"
                  onClick={() =>
                    autoSaveAppearance({
                      ...appearance,
                      backgroundEffect: eff,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition border ${
                    appearance.backgroundEffect === eff
                      ? 'border-brand bg-brand/10 text-white'
                      : 'border-border bg-bg-soft text-muted hover:text-white'
                  }`}
                >
                  {eff}
                </button>
              ))}
            </div>
          </div>

          {/* Glow Settings */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-muted">
                Glow Settings
              </label>
              <Switch
                checked={appearance.glowEnabled ?? false}
                onChange={(v) =>
                  autoSaveAppearance({ ...appearance, glowEnabled: v })
                }
              />
            </div>
            {appearance.glowEnabled && (
              <div className="grid sm:grid-cols-2 gap-3">
                <ColorPicker
                  label="Glow color"
                  value={appearance.glowColor || appearance.primaryColor}
                  onChange={(v) =>
                    autoSaveAppearance({ ...appearance, glowColor: v })
                  }
                />
                <Slider
                  label="Intensity"
                  value={appearance.glowIntensity ?? 50}
                  suffix="%"
                  onChange={(v) =>
                    autoSaveAppearance({ ...appearance, glowIntensity: v })
                  }
                />
                <div className="sm:col-span-2 flex flex-wrap gap-2">
                  {(
                    ['username', 'avatar', 'socials', 'badges', 'links'] as const
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const next = {
                          ...appearance,
                          glowTargets: {
                            ...appearance.glowTargets,
                            [t]: !appearance.glowTargets[t],
                          },
                        };
                        autoSaveAppearance(next);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs capitalize transition border ${
                        appearance.glowTargets[t]
                          ? 'border-brand bg-brand/10 text-white'
                          : 'border-border bg-bg-soft text-muted hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-border">
          <Button onClick={saveProfile} loading={saving}>
            <FiSave size={14} /> Save description & location
          </Button>
        </div>
      </Card>
    </section>
  );
}