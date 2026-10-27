import { uploadVideo } from '../services/storageService';

const MAX_DURATION_FREE = 15;
const MAX_DURATION_PREMIUM = 60;
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!file || typeof file.name !== 'string') {
      reject(new Error('Invalid video file'));
      return;
    }
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration || 0);
    };
    video.onerror = () => reject(new Error('Invalid video file'));
    video.src = URL.createObjectURL(file);
  });
}

export async function uploadVideoBackground(
  uid: string,
  file: File,
  isPremium: boolean = false,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!file || typeof file.type !== 'string') {
    throw new Error('Invalid file');
  }
  if (!file.type.startsWith('video/')) {
    throw new Error('Only video files are allowed');
  }
  if (file.size > MAX_SIZE) {
    throw new Error(`Video too large. Max ${MAX_SIZE / 1024 / 1024} MB`);
  }

  const maxDuration = isPremium ? MAX_DURATION_PREMIUM : MAX_DURATION_FREE;
  const duration = await getVideoDuration(file);
  if (duration > maxDuration + 0.5) {
    if (!isPremium) {
      throw new Error(
        `Free users: max ${MAX_DURATION_FREE}s. Upgrade to Premium for up to ${MAX_DURATION_PREMIUM}s.`,
      );
    } else {
      throw new Error(`Max duration ${maxDuration} seconds`);
    }
  }

  return uploadVideo(uid, file, onProgress);
}