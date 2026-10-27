export const RESERVED_USERNAMES = [
  'admin', 'administrator', 'root', 'system', 'support', 'help',
  'login', 'register', 'signup', 'signin', 'logout', 'api',
  'dashboard', 'settings', 'profile', 'user', 'users', 'me',
  'about', 'contact', 'terms', 'privacy', 'pricing', 'premium',
  'verified', 'official', 'staff', 'mod', 'moderator', 'owner',
  'www', 'app', 'mail', 'ftp', 'cdn', 'static', 'assets',
  'leaderboard', 'compare', 'recovery', 'setup-username', 'u',
  'features', 'faq', 'customize', 'links', 'badges',
];

export const USERNAME_REGEX = /^[a-z0-9_](?!.*__)[a-z0-9_.]{1,28}[a-z0-9_]$/;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_BG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'];

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
export const MAX_BG_SIZE = 15 * 1024 * 1024;
export const MAX_AUDIO_SIZE = 15 * 1024 * 1024;

export const BADGE_DEFS: Record<string, { label: string; color: string; icon: string; image: string }> = {
  verified: {
    label: 'Verified',
    color: '#3B82F6',
    icon: 'check',
    image: 'https://i.postimg.cc/ncSsx7Xn/gemini-svg-(1).png',
  },
  staff: {
    label: 'Staff',
    color: '#EF4444',
    icon: 'shield',
    image: 'https://i.postimg.cc/m2pc4MP4/gemini-svg-(2).png',
  },
  bug_hunter: {
    label: 'Bug Hunter',
    color: '#10B981',
    icon: 'bug',
    image: 'https://i.postimg.cc/MK3cwRnS/gemini-svg-(3).png',
  },
  premium: {
    label: 'Premium',
    color: '#A855F7',
    icon: 'star',
    image: 'https://i.postimg.cc/qM1mdmcJ/gemini-svg-(4).png',
  },
};

export const SOCIAL_PLATFORMS = [
  'twitter', 'instagram', 'youtube', 'tiktok', 'twitch', 'github',
  'discord', 'telegram', 'linkedin', 'spotify', 'soundcloud', 'reddit',
  'facebook', 'snapchat', 'pinterest', 'threads', 'email', 'website',
];

export const THEMES: Record<string, { name: string; primary: string; accent: string; bg: string }> = {
  'black-cyan': { name: 'Black Cyan', primary: '#00AAFF', accent: '#00AAFF', bg: '#000000' },
  'black-purple': { name: 'Black Purple', primary: '#A855F7', accent: '#A855F7', bg: '#000000' },
  'black-pink': { name: 'Black Pink', primary: '#EC4899', accent: '#EC4899', bg: '#000000' },
  'black-green': { name: 'Black Green', primary: '#22C55E', accent: '#22C55E', bg: '#000000' },
  'black-orange': { name: 'Black Orange', primary: '#F97316', accent: '#F97316', bg: '#000000' },
  'pure-black': { name: 'Pure Black', primary: '#FFFFFF', accent: '#94A3B8', bg: '#000000' },
};

export const CURSOR_STYLES = ['default', 'pointer', 'crosshair', 'custom-heart', 'custom-star', 'custom-glow'];
export const WIDGET_TYPES = ['discord', 'spotify', 'github', 'twitter', 'text', 'image'];