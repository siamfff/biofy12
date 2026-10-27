import { Timestamp } from 'firebase/firestore';

export interface UserDoc {
  uid: string;
  email: string;
  username: string | null;
  usernameChangedAt?: any;
  displayName: string;
  bio: string;
  location: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  customBackground: string | null;
  customCursor: string | null;
  premium: boolean;
  premiumUntil: Timestamp | null;
  verified: boolean;
  badges: string[];
  role: 'user' | 'admin';
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  music: MusicSettings;
  profileUrl: string | null;
  views?: number;
  premiumBadgeVisible?: boolean;
  lastSeen?: any;
  isOnline?: boolean;
}

export interface PrivacySettings {
  publicProfile: boolean;
  showAnalytics: boolean;
  allowMessages: boolean;
  showEmail: boolean;
}

export interface AppearanceSettings {
  theme: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  iconColor: string;
  backgroundEffectColor: string;
  profileGradientEnabled: boolean;
  backgroundBlur: number;
  backgroundOpacity: number;
  profileBlur: number;
  profileOpacity: number;
  cardOpacity: number;
  cardBlur: number;
  cardBorder: number;
  cardRadius: number;
  shadowIntensity: number;
  animationEnabled: boolean;
  cursorStyle: string;
  fontFamily: string;
  backgroundType: 'image' | 'color' | 'gradient' | 'video';
  backgroundGradient: string;
  backgroundVideo: string | null;
  backgroundEffect: 'none' | 'rain' | 'snow' | 'stars' | 'particles' | 'matrix';
  bioColor: string;
  bioWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  bioSize: number;
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number;
  glowTargets: {
    username: boolean;
    socials: boolean;
    badges: boolean;
    avatar: boolean;
    links: boolean;
  };
  usernameEffect: 'none' | 'typewriter' | 'glitch' | 'gradient' | 'rainbow';
  monochromeIcons: boolean;
  animatedTitle: boolean;
  swapBoxColors: boolean;
  volumeControl: boolean;
  useDiscordAvatar: boolean;
  discordAvatarDecoration: boolean;
  profileWidget: 'none' | 'discord' | 'spotify' | 'custom';
  showPremiumBadge?: boolean;
  bioTypewriter?: boolean;
}

export interface MusicSettings {
  enabled: boolean;
  url: string | null;
  title: string;
  artist: string;
  loop: boolean;
  autoplay: boolean;
  volume: number;
  coverUrl: string | null;
  playerStyle: 'full' | 'mini' | 'none';
  playerPosition: 'top' | 'bottom';
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
  clicks: number;
}

export interface SocialItem {
  id: string;
  platform: string;
  url: string;
  enabled: boolean;
  order: number;
  clicks: number;
}

export interface WidgetItem {
  id: string;
  type: 'discord' | 'spotify' | 'github' | 'twitter' | 'text' | 'image';
  enabled: boolean;
  order: number;
  config: Record<string, any>;
}

export interface NotificationDoc {
  id: string;
  title: string;
  body: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Timestamp | null;
}

export interface AnalyticsEvent {
  type: 'view' | 'link_click' | 'social_click';
  targetId?: string;
  timestamp: Timestamp;
  referrer?: string;
  country?: string;
}

export interface DailyAnalytics {
  date: string;
  views: number;
  linkClicks: number;
  socialClicks: number;
}

export interface RedeemCode {
  code: string;
  type: 'premium' | 'badge' | 'verified';
  value: string | number;
  used: boolean;
  usedBy: string | null;
  usedAt: Timestamp | null;
}

export interface VerificationApplication {
  uid: string;
  fullName: string;
  reason: string;
  links: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/* ============================================================
   ADMIN TYPES
   ============================================================ */

export interface AdminLog {
  id: string;
  adminUid: string;
  adminUsername: string;
  action: string;
  targetUid?: string;
  targetUsername?: string;
  details?: Record<string, any>;
  timestamp: Timestamp | null;
}

export interface AdminStats {
  totalUsers: number;
  totalPremium: number;
  totalVerified: number;
  totalViews: number;
  totalLinks: number;
  totalSocials: number;
  recentSignups: UserDoc[];
}

export interface PremiumCheckResult {
  isPremiumActive: boolean;
  shouldHavePremiumBadge: boolean;
}