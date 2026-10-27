export interface BadgeMeta {
  label: string;
  image: string;
  color: string;
}

export const BADGE_IMAGES: Record<string, BadgeMeta> = {
  verified: {
    label: 'Verified',
    image: 'https://i.postimg.cc/ncSsx7Xn/gemini-svg-(1).png',
    color: '#3B82F6',
  },
  staff: {
    label: 'Staff',
    image: 'https://i.postimg.cc/m2pc4MP4/gemini-svg-(2).png',
    color: '#EF4444',
  },
  bug_hunter: {
    label: 'Bug Hunter',
    image: 'https://i.postimg.cc/MK3cwRnS/gemini-svg-(3).png',
    color: '#10B981',
  },
  premium: {
    label: 'Premium',
    image: 'https://i.postimg.cc/qM1mdmcJ/gemini-svg-(4).png',
    color: '#A855F7',
  },
};

export function getBadgeMeta(key: string): BadgeMeta | null {
  return BADGE_IMAGES[key] || null;
}