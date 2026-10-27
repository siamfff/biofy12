export interface SocialMeta {
  label: string;
  image: string;
  color: string;
}

export const SOCIAL_ICONS: Record<string, SocialMeta> = {
  youtube: { label: 'YouTube', image: 'https://i.postimg.cc/KcNk9CFb/youtube.png', color: '#FF0000' },
  facebook: { label: 'Facebook', image: 'https://i.postimg.cc/4N2KGtmD/facebook.png', color: '#1877F2' },
  instagram: { label: 'Instagram', image: 'https://i.postimg.cc/HsvJm5rC/instagram.png', color: '#E4405F' },
  tiktok: { label: 'TikTok', image: 'https://i.postimg.cc/zGLyGBhY/tiktok.png', color: '#000000' },
  twitter: { label: 'X (Twitter)', image: 'https://i.postimg.cc/wjt1jvN8/x.png', color: '#000000' },
  kick: { label: 'Kick', image: 'https://i.postimg.cc/L6QqSfJK/kick.png', color: '#53FC18' },
  pinterest: { label: 'Pinterest', image: 'https://i.postimg.cc/vZ14ZBns/pinterest.png', color: '#E60023' },
  roblox: { label: 'Roblox', image: 'https://i.postimg.cc/T3yK3wDZ/roblox.png', color: '#E2231A' },
  snapchat: { label: 'Snapchat', image: 'https://i.postimg.cc/fR3VRLds/snapchat.png', color: '#FFFC00' },
  spotify: { label: 'Spotify', image: 'https://i.postimg.cc/289qYv1z/spotify.png', color: '#1DB954' },
  threads: { label: 'Threads', image: 'https://i.postimg.cc/fTq3sXVD/threads.png', color: '#000000' },
  email: { label: 'Email', image: 'https://i.postimg.cc/YC4vC9W5/gmail.png', color: '#EA4335' },
  telegram: { label: 'Telegram', image: 'https://i.postimg.cc/j2576hDk/telegram.png', color: '#26A5E4' },
  discord: { label: 'Discord', image: 'https://i.postimg.cc/g2R6Kj0b/discord.png', color: '#5865F2' },
  github: { label: 'GitHub', image: 'https://i.postimg.cc/PqXr85p2/github.png', color: '#181717' },
  reddit: { label: 'Reddit', image: 'https://i.postimg.cc/RC6f0gxb/reddit.png', color: '#FF4500' },
  soundcloud: { label: 'SoundCloud', image: 'https://i.postimg.cc/SK12SMTb/soundcloud.png', color: '#FF5500' },
  linkedin: { label: 'LinkedIn', image: 'https://i.postimg.cc/HsvJm5rC/instagram.png', color: '#0A66C2' },
  twitch: { label: 'Twitch', image: 'https://i.postimg.cc/L6QqSfJK/kick.png', color: '#9146FF' },
  website: { label: 'Website', image: 'https://i.postimg.cc/g2R6Kj0b/discord.png', color: '#00AAFF' },
};

export function getSocialMeta(platform: string): SocialMeta {
  return (
    SOCIAL_ICONS[platform] || {
      label: platform,
      image: 'https://i.postimg.cc/KcNk9CFb/youtube.png',
      color: '#00AAFF',
    }
  );
}