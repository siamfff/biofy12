import { useCallback } from 'react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function useMediaUpload() {
  const upload = useCallback(async (type: 'avatar' | 'background' | 'video' | 'music', uid: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // ফোল্ডার তৈরি করা
    const folder = `nebula/${uid}/${type}`;
    formData.append('folder', folder);

    const resourceType = type === 'video' || file.type.startsWith('video') ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    // 💡 URL এবং public_id দুটোই রিটার্ন করা হচ্ছে
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  }, []);

  return { upload };
}