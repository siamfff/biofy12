import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/userService';
import { Card } from '../ui/Card';
import { FileUploader } from '../common/FileUploader';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { useToast } from '../../hooks/useToast';
import { AppearanceSettings } from '../../types';
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE, ALLOWED_BG_TYPES, MAX_BG_SIZE } from '../../utils/constants';
import { FiMusic, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface Props {
  appearance: AppearanceSettings;
  setAppearance: (a: AppearanceSettings) => void;
}

export function AssetsUploader({ appearance, setAppearance }: Props) {
  const { profile, refreshProfile } = useAuth();
  const { upload } = useMediaUpload();
  const toast = useToast();

  if (!profile) return null;

  // 👇 Cloudinary থেকে ফাইল ডিলিট করার হেল্পার
  const deleteCloudinaryAsset = async (publicId: string, resourceType: 'image' | 'video' = 'image') => {
    if (!publicId) return;
    try {
      await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, resourceType }),
      });
    } catch (err) {
      console.error('Failed to delete from Cloudinary', err);
    }
  };

  const saveAppearance = async (next: AppearanceSettings) => {
    setAppearance(next);
    await updateUserProfile(profile.uid, { appearance: next });
    await refreshProfile();
  };

  const avatarPublicId = (profile as any).avatarPublicId as string | null | undefined;
  const backgroundPublicId = (profile as any).backgroundPublicId as string | null | undefined;

  const onAvatar = async (file: File) => {
    try {
      const result = await upload('avatar', profile.uid, file);
      if (!result) throw new Error('Upload failed');
      
      // পুরনো অ্যাভাটার ডিলিট
      if (avatarPublicId) await deleteCloudinaryAsset(avatarPublicId, 'image');

      await updateUserProfile(profile.uid, {
        avatarUrl: result.url,
        avatarPublicId: result.publicId,
      } as any);
      await refreshProfile();
      toast.success('Avatar updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update avatar');
    }
  };

  const onBgImage = async (file: File) => {
    try {
      const result = await upload('background', profile.uid, file);
      if (!result) throw new Error('Upload failed');

      // পুরনো ব্যাকগ্রাউন্ড ডিলিট
      if (backgroundPublicId) await deleteCloudinaryAsset(backgroundPublicId, 'image');

      const next = { ...appearance, backgroundType: 'image' as const, backgroundVideo: null };
      await updateUserProfile(profile.uid, {
        backgroundUrl: result.url,
        backgroundPublicId: result.publicId,
        appearance: next,
      } as any);
      setAppearance(next);
      await refreshProfile();
      toast.success('Background uploaded');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload background');
    }
  };

  const removeAvatar = async () => {
    if (avatarPublicId) await deleteCloudinaryAsset(avatarPublicId, 'image');
    await updateUserProfile(profile.uid, { avatarUrl: null, avatarPublicId: null } as any);
    await refreshProfile();
    toast.success('Avatar removed');
  };

  const removeBg = async () => {
    if (backgroundPublicId) await deleteCloudinaryAsset(backgroundPublicId, 'image');
    const next = { ...appearance, backgroundType: 'color' as const, backgroundVideo: null };
    await updateUserProfile(profile.uid, { backgroundUrl: null, backgroundPublicId: null, appearance: next } as any);
    setAppearance(next);
    await refreshProfile();
    toast.success('Background removed');
  };

  const onBgVideo = async (file: File) => {
    try {
      const result = await upload('video', profile.uid, file);
      if (!result) throw new Error('Upload failed');
      
      // পুরনো ভিডিও ডিলিট
      if (backgroundPublicId) await deleteCloudinaryAsset(backgroundPublicId, 'video');
      
      const next = { ...appearance, backgroundType: 'video' as const, backgroundVideo: result.url };
      await updateUserProfile(profile.uid, { appearance: next, backgroundPublicId: result.publicId } as any);
      setAppearance(next);
      await refreshProfile();
      toast.success('Video uploaded');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload video');
    }
  };

  // ... বাকি UI অংশ (আপনার আগের কোডের মতোই থাকবে, শুধু removeBg, removeAvatar গুলোতে ক্লাউডিনারি ডিলিট যুক্ত হয়েছে)

  return (
    <section id="assets" className="scroll-mt-24">
      <Card title="Assets Uploader" description="Upload your profile assets">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Background */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted">Background</label>
              {profile.backgroundUrl && (
                <button onClick={removeBg} className="text-[10px] text-danger hover:underline flex items-center gap-1">
                  <FiTrash2 size={10} /> Remove
                </button>
              )}
            </div>
            <div className="flex gap-1 mb-2">
              <button type="button" onClick={() => saveAppearance({ ...appearance, backgroundType: 'image' })} className={`flex-1 text-[10px] px-2 py-1 rounded-md ${appearance.backgroundType === 'image' ? 'bg-brand text-white' : 'bg-bg-soft text-muted'}`}>Image</button>
              <button type="button" onClick={() => saveAppearance({ ...appearance, backgroundType: 'video' })} className={`flex-1 text-[10px] px-2 py-1 rounded-md ${appearance.backgroundType === 'video' ? 'bg-brand text-white' : 'bg-bg-soft text-muted'}`}>Video</button>
            </div>

            {appearance.backgroundType === 'video' ? (
              <FileUploader accept="video/mp4,video/webm" maxSize={20 * 1024 * 1024} maxDurationSeconds={15} premiumMaxDurationSeconds={60} kind="video" onFile={onBgVideo} preview={appearance.backgroundVideo} hint="MP4 / WebM · max 15s (Premium: 60s)" aspect="wide" />
            ) : (
              <FileUploader accept={ALLOWED_BG_TYPES.join(',')} maxSize={MAX_BG_SIZE} onFile={onBgImage} preview={profile.backgroundUrl} hint="JPG, PNG, WEBP · max 15 MB" aspect="wide" />
            )}
          </div>

          {/* Audio */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Audio</label>
            <Link to="/dashboard/customize#music" className="block aspect-video rounded-2xl border-2 border-dashed border-border bg-bg-soft hover:bg-bg-elevated transition flex flex-col items-center justify-center text-center p-4 gap-2">
              <FiMusic size={32} className="text-muted" />
              <p className="text-xs text-muted">{profile.music?.enabled ? 'Audio configured' : 'Click to open audio manager'}</p>
            </Link>
          </div>

          {/* Profile Avatar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted">Profile Avatar</label>
              {profile.avatarUrl && (
                <button onClick={removeAvatar} className="text-[10px] text-danger hover:underline flex items-center gap-1">
                  <FiTrash2 size={10} /> Remove
                </button>
              )}
            </div>
            <FileUploader accept={ALLOWED_AVATAR_TYPES.join(',')} maxSize={MAX_AVATAR_SIZE} onFile={onAvatar} preview={profile.avatarUrl} aspect="wide" hint="JPG, PNG, WEBP · max 5 MB" />
          </div>

        </div>
      </Card>
    </section>
  );
}