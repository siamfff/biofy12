import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/userService';
import { checkUsernameExists } from '../../services/authService';
// @ts-expect-error The installed Firebase package does not expose declarations for this module.
import { updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FileUploader } from '../../components/common/FileUploader';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { validateUsername } from '../../utils/validation';
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE } from '../../utils/constants';
import { ProfilePreview } from '../../components/profile/ProfilePreview';
import { useProfileData } from '../../hooks/useProfile';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { FiTrash2, FiMapPin } from 'react-icons/fi';

export default function ProfileEditor() {
  const { profile, refreshProfile } = useAuth();
  const { links, socials, widgets } = useProfileData();
  const { upload } = useMediaUpload();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [avail, setAvail] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [confirmDeleteAvatar, setConfirmDeleteAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const toast = useToast();
  const debouncedUsername = useDebounce(username, 400);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setUsername(profile.username || '');
    }
  }, [profile?.uid]);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername === profile?.username) {
      setAvail(null);
      return;
    }
    const res = validateUsername(debouncedUsername);
    if (!res.valid) {
      setAvail(null);
      setError(res.error!);
      return;
    }
    setError('');
    setChecking(true);
    checkUsernameExists(debouncedUsername)
      .then((exists) => setAvail(!exists))
      .finally(() => setChecking(false));
  }, [debouncedUsername]);

  const handleUsernameChange = async () => {
    if (!profile || username === profile.username) return;
    const res = validateUsername(username);
    if (!res.valid) {
      setError(res.error!);
      return;
    }
    if (avail === false) {
      setError('Username taken');
      return;
    }
    try {
      if (profile.username) await deleteDoc(doc(db, 'usernames', profile.username));
      await updateDoc(doc(db, 'users', profile.uid), { username });
      await setDoc(doc(db, 'usernames', username), { uid: profile.uid });
      toast.success('Username updated');
      await refreshProfile();
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, { displayName, bio, location });
      await refreshProfile();
      toast.success('Profile saved');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async (file: File) => {
    if (!profile) return;
    setAvatarUploading(true);
    try {
      const url = await upload('avatar', profile.uid, file);
      if (!url) throw new Error('Upload failed');
      await updateUserProfile(profile.uid, { avatarUrl: url });
      await refreshProfile();
      toast.success('Avatar updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile) return;
    setDeletingAvatar(true);
    try {
      await updateUserProfile(profile.uid, { avatarUrl: null });
      await refreshProfile();
      toast.success('Avatar removed');
      setConfirmDeleteAvatar(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    } finally {
      setDeletingAvatar(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Profile</h1>
          <p className="text-xs text-muted mt-1">Manage your identity and bio</p>
        </div>

        <Card title="Avatar" description="Drop or click — uploads instantly">
          <div className="max-w-[200px]">
            <FileUploader
              accept={ALLOWED_AVATAR_TYPES.join(',')}
              maxSize={MAX_AVATAR_SIZE}
              onFile={onAvatar}
              preview={profile.avatarUrl}
              hint="JPG, PNG, WEBP, GIF · max 5 MB"
            />
          </div>
          {avatarUploading && (
            <p className="text-xs text-brand-soft mt-2">Uploading avatar…</p>
          )}
          {profile.avatarUrl && (
            <Button
              variant="danger"
              size="sm"
              className="mt-3"
              onClick={() => setConfirmDeleteAvatar(true)}
            >
              <FiTrash2 size={12} /> Remove avatar
            </Button>
          )}
        </Card>

        <form onSubmit={onSubmit} className="space-y-4">
          <Card title="Display Name, Bio & Location">
            <div className="space-y-4">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
              />
              <Input
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dhaka, Bangladesh"
                leftIcon={<FiMapPin size={14} />}
                maxLength={60}
              />
              <Textarea
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={280}
                hint={`${bio.length}/280 characters`}
              />
            </div>
          </Card>
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>

        <Card title="Username" description="Your unique profile identifier">
          <div className="space-y-3">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              leftIcon={<span className="text-muted text-sm">@</span>}
              error={error}
              hint={
                checking ? 'Checking…' :
                avail === true ? '✓ Available' :
                avail === false ? '✗ Taken' : undefined
              }
            />
            <Button
              onClick={handleUsernameChange}
              variant="secondary"
              disabled={username === profile.username}
            >
              Update username
            </Button>
          </div>
        </Card>
      </div>

      <div className="lg:sticky lg:top-6 h-fit">
        <p className="text-xs text-muted mb-2">Live preview</p>
        <ProfilePreview
          profile={{ ...profile, displayName, bio, location, username }}
          links={links}
          socials={socials}
          widgets={widgets}
        />
      </div>

      <ConfirmDialog
        open={confirmDeleteAvatar}
        title="Delete avatar?"
        message="Your avatar will be removed. You can upload a new one anytime."
        confirmLabel="Delete"
        onCancel={() => setConfirmDeleteAvatar(false)}
        onConfirm={handleDeleteAvatar}
        loading={deletingAvatar}
        danger
      />
    </div>
  );
}