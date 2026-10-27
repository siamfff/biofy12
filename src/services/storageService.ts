const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn(
    '[storageService] Cloudinary config missing. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local',
  );
}

export type ResourceType = 'image' | 'video' | 'auto' | 'raw';

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

interface UploadOptions {
  folder?: string;
  resourceType?: ResourceType;
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
}

export function uploadToCloudinary(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(
      new Error(
        'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env.local and restart the dev server.',
      ),
    );
  }

  if (!file || typeof file.name !== 'string') {
    return Promise.reject(new Error('Invalid file'));
  }

  const { folder = 'nebula', resourceType = 'auto', onProgress } = options;

  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    if (folder) formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.url,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            resourceType: data.resource_type,
            format: data.format,
            bytes: data.bytes,
            width: data.width,
            height: data.height,
            duration: data.duration,
          });
        } catch {
          reject(new Error('Invalid Cloudinary response'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(
            new Error(err?.error?.message || `Upload failed (${xhr.status})`),
          );
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));

    if (options.signal) {
      options.signal.addEventListener('abort', () => xhr.abort());
    }

    xhr.send(formData);
  });
}

export async function uploadAvatar(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const res = await uploadToCloudinary(file, {
    folder: `nebula/avatars/${uid}`,
    resourceType: 'image',
    onProgress,
  });
  return res.secureUrl;
}

export async function uploadBackground(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const res = await uploadToCloudinary(file, {
    folder: `nebula/backgrounds/${uid}`,
    resourceType: 'image',
    onProgress,
  });
  return res.secureUrl;
}

export async function uploadAudio(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const res = await uploadToCloudinary(file, {
    folder: `nebula/audio/${uid}`,
    resourceType: 'video', // Cloudinary treats audio as video
    onProgress,
  });
  return res.secureUrl;
}

export async function uploadVideo(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const res = await uploadToCloudinary(file, {
    folder: `nebula/videos/${uid}`,
    resourceType: 'video',
    onProgress,
  });
  return res.secureUrl;
}

export async function deleteFile(_path: string): Promise<void> {
  return Promise.resolve();
}