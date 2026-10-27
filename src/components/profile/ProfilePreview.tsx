import { UserDoc, LinkItem, SocialItem, WidgetItem } from '../../types';
import { getBadgeMeta } from '../../utils/badgeImages';
import { FiCheckCircle, FiExternalLink, FiMapPin, FiEye } from 'react-icons/fi';
import { MusicPlayerPreview } from './MusicPlayerPreview';
import { SocialIcon } from '../common/SocialIcon';
import { PresenceIndicator } from './PresenceIndicator';

interface Props {
  profile: UserDoc | null;
  links?: LinkItem[];
  socials?: SocialItem[];
  widgets?: WidgetItem[];
  fullScreen?: boolean;
}

function hexToRgba(hex: string | null | undefined, alpha: number): string {
  let h = (hex || '#000000').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) h = '000000';
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function upgradeCloudinaryVideoUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  try {
    if (!url.includes('res.cloudinary.com')) return url;
    if (/\/q_\d+/.test(url)) return url;
    return url.replace(/\/video\/upload\//, '/video/upload/q_100,vc_auto/');
  } catch {
    return url;
  }
}

function BackgroundEffect({
  effect,
  color,
}: {
  effect: string;
  color: string;
}) {
  if (effect === 'none') return null;

  if (effect === 'stars') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const size = Math.random() * 2 + 1;
          const delay = Math.random() * 3;
          return (
            <span
              key={i}
              className="absolute rounded-full animate-pulse-slow"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                backgroundColor: color,
                boxShadow: `0 0 ${size * 4}px ${color}`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
    );
  }

  if (effect === 'particles') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => {
          const left = Math.random() * 100;
          const size = Math.random() * 6 + 2;
          const duration = Math.random() * 10 + 10;
          const delay = Math.random() * 10;
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${left}%`,
                bottom: '-10px',
                width: size,
                height: size,
                backgroundColor: hexToRgba(color, 0.4),
                boxShadow: `0 0 ${size * 3}px ${hexToRgba(color, 0.7)}`,
                animation: `floatUp ${duration}s linear ${delay}s infinite`,
              }}
            />
          );
        })}
        <style>{`
          @keyframes floatUp {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (effect === 'rain') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => {
          const left = Math.random() * 100;
          const duration = Math.random() * 1 + 0.5;
          const delay = Math.random() * 2;
          return (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${left}%`,
                top: '-20px',
                width: 1,
                height: 15,
                backgroundColor: hexToRgba(color, 0.5),
                animation: `rainFall ${duration}s linear ${delay}s infinite`,
              }}
            />
          );
        })}
        <style>{`
          @keyframes rainFall {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(110vh); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (effect === 'snow') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 35 }).map((_, i) => {
          const left = Math.random() * 100;
          const size = Math.random() * 4 + 2;
          const duration = Math.random() * 8 + 8;
          const delay = Math.random() * 8;
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${left}%`,
                top: '-10px',
                width: size,
                height: size,
                backgroundColor: hexToRgba(color, 0.8),
                filter: 'blur(0.5px)',
                animation: `snowFall ${duration}s linear ${delay}s infinite`,
              }}
            />
          );
        })}
        <style>{`
          @keyframes snowFall {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(110vh) translateX(30px); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}

export function ProfilePreview({
  profile,
  links = [],
  socials = [],
  widgets = [],
  fullScreen = false,
}: Props) {
  const a = profile?.appearance;
  const isGradient = a?.backgroundType === 'gradient';
  const gradient = isGradient ? a?.backgroundGradient : undefined;
  const isVideo = a?.backgroundType === 'video' && !!a?.backgroundVideo;
  const imageSrc = profile?.backgroundUrl || profile?.customBackground || '';
  const isImage = a?.backgroundType === 'image' && !!imageSrc;

  const musicPosition = profile?.music?.playerPosition || 'bottom';
  const showMusic = !!profile?.music?.enabled && !!profile?.music?.url;
  const musicAtTop = showMusic && musicPosition === 'top';
  const musicAtBottom = showMusic && musicPosition === 'bottom';

  const profileOpacity = Math.max(0, Math.min(100, a?.profileOpacity ?? 0));
  const panelEnabled = profileOpacity > 0;
  const profileBlur = a?.profileBlur ?? 12;
  const panelColor = a?.profilePanelColor || '#000000';
  const panelRadius = a?.profilePanelRadius ?? 24;

  const bioColor = a?.bioColor || '#ffffff';
  const bioWeight = a?.bioWeight || 'normal';
  const bioSize = a?.bioSize ?? 14;

  const glowEnabled = a?.glowEnabled ?? false;
  const glowColor = a?.glowColor || a?.primaryColor || '#00AAFF';
  const glowIntensity = a?.glowIntensity ?? 50;
  const glowTargets = a?.glowTargets || {
    username: true,
    socials: false,
    badges: false,
    avatar: false,
    links: false,
  };

  const glowAlpha = Math.min(1, glowIntensity / 100);
  const glowStrength = Math.round(glowIntensity * 0.4);

  const makeGlow = (target: keyof typeof glowTargets) => {
    if (!glowEnabled || !glowTargets[target]) return undefined;
    return `0 0 ${glowStrength}px ${hexToRgba(glowColor, glowAlpha * 0.9)}`;
  };

  const wrapperClass = fullScreen
    ? 'relative w-full h-full min-h-screen overflow-hidden bg-bg'
    : 'relative w-full min-h-[640px] sm:min-h-[720px] lg:min-h-[780px] rounded-3xl border border-border overflow-hidden shadow-card bg-bg';

  const contentClass = fullScreen
    ? 'relative w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-14 min-h-screen flex flex-col items-center justify-center'
    : 'relative px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 min-h-[640px] sm:min-h-[720px] lg:min-h-[780px] flex flex-col items-center';

  const videoUrl = upgradeCloudinaryVideoUrl(a?.backgroundVideo);

  const panelStyle: React.CSSProperties | undefined = panelEnabled
    ? {
        backgroundColor: hexToRgba(panelColor, profileOpacity / 100),
        backdropFilter: `blur(${profileBlur}px)`,
        WebkitBackdropFilter: `blur(${profileBlur}px)`,
        borderRadius: `${panelRadius}px`,
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow:
          '0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.05)',
      }
    : undefined;

  const innerContent = (
    <>
      {/* Avatar */}
      <div className="relative mb-4 sm:mb-5">
        <div
          className="absolute inset-0 rounded-full animate-pulse-slow"
          style={{
            background: glowEnabled
              ? `radial-gradient(circle, ${hexToRgba(glowColor, 0.4)} 0%, transparent 70%)`
              : `radial-gradient(circle, ${hexToRgba(a?.primaryColor || '#00AAFF', 0.3)} 0%, transparent 70%)`,
            transform: 'scale(1.4)',
            filter: 'blur(20px)',
          }}
        />
        <img
          src={
            profile?.avatarUrl ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'U'}`
          }
          alt="avatar"
          className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-2 shadow-lg"
          style={{
            borderColor: a?.primaryColor || '#00AAFF',
            boxShadow: `0 0 30px -4px ${hexToRgba(a?.primaryColor || '#00AAFF', 0.6)}`,
          }}
        />
      </div>

      {/* Name + verified */}
      <div className="flex items-center gap-2 text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold text-white font-display drop-shadow"
          style={{ textShadow: makeGlow('username') }}
        >
          {profile?.displayName || 'Your Name'}
        </h2>
        {profile?.verified && (
          <FiCheckCircle className="text-brand shrink-0" size={20} />
        )}
      </div>

      {/* Handle + location + views */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 mt-1 flex-wrap justify-center">
        <span>@{profile?.username || 'username'}</span>

        {profile?.location && (
          <>
            <span className="opacity-40">•</span>
            <span className="inline-flex items-center gap-1">
              <FiMapPin size={11} />
              {profile.location}
            </span>
          </>
        )}

        {(profile?.views ?? 0) > 0 && (
          <>
            <span className="opacity-40">•</span>
            <span className="inline-flex items-center gap-1">
              <FiEye size={11} />
              {profile.views?.toLocaleString()} views
            </span>
          </>
        )}
      </div>

      {/* Online status */}
      {profile && (
        <div className="mt-2">
          <PresenceIndicator user={profile} showText />
        </div>
      )}

      {/* Badges */}
      {profile?.badges &&
        profile.badges.filter((b) => {
          if (!getBadgeMeta(b)) return false;
          if (b === 'premium' && profile.appearance?.showPremiumBadge === false) {
            return false;
          }
          return true;
        }).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {profile.badges
              .filter((b) => {
                if (!getBadgeMeta(b)) return false;
                if (b === 'premium' && profile.appearance?.showPremiumBadge === false) {
                  return false;
                }
                return true;
              })
              .map((b) => {
                const meta = getBadgeMeta(b);
                if (!meta) return null;
                return (
                  <div
                    key={b}
                    className="group relative flex items-center justify-center transition-transform duration-200 hover:scale-125 active:scale-110 cursor-pointer"
                    style={{ filter: makeGlow('badges') }}
                  >
                    <img
                      src={meta.image}
                      alt={meta.label}
                      className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-lg"
                    />
                    <span
                      className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/95 border border-white/15 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                );
              })}
          </div>
        )}

      {/* Bio */}
      {profile?.bio ? (
        <p
          className="text-center mt-4 max-w-sm whitespace-pre-wrap leading-relaxed"
          style={{
            color: bioColor,
            fontWeight:
              bioWeight === 'normal'
                ? 400
                : bioWeight === 'medium'
                  ? 500
                  : bioWeight === 'semibold'
                    ? 600
                    : 700,
            fontSize: `${bioSize}px`,
          }}
        >
          {profile.bio}
        </p>
      ) : (
        <p
          className="text-center mt-4 max-w-sm text-white/40 italic"
          style={{ fontSize: `${bioSize}px` }}
        >
          {profile?.displayName ? 'Add a bio in Customize →' : 'Your bio goes here'}
        </p>
      )}

      {/* Music top */}
      {musicAtTop && (
        <div className="w-full max-w-sm mt-5">
          <MusicPlayerPreview music={profile?.music} />
        </div>
      )}

      {/* Socials */}
      {socials.filter((s) => s.enabled).length > 0 && (
        <div className="flex flex-wrap gap-2.5 mt-5 justify-center">
          {socials
            .filter((s) => s.enabled)
            .map((s) => (
              <SocialIcon
                key={s.id}
                platform={s.platform}
                url={s.url}
                size="md"
                monochrome={a?.monochromeIcons}
                color={a?.iconColor}
              />
            ))}
        </div>
      )}

      {/* Links */}
      {links.filter((l) => l.enabled).length > 0 && (
        <div className="w-full max-w-sm mt-5 space-y-2.5">
          {links
            .filter((l) => l.enabled)
            .map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] backdrop-blur-md border"
                style={{
                  backgroundColor: hexToRgba(a?.primaryColor || '#00AAFF', 0.15),
                  borderColor: hexToRgba(a?.primaryColor || '#00AAFF', 0.35),
                  color: a?.textColor || '#ffffff',
                  boxShadow: makeGlow('links'),
                }}
              >
                <span className="truncate">{l.label}</span>
                <FiExternalLink size={13} className="opacity-60 shrink-0" />
              </a>
            ))}
        </div>
      )}

      {/* Widgets */}
      {widgets.filter((w) => w.enabled).length > 0 && (
        <div className="w-full max-w-sm mt-4 space-y-2">
          {widgets
            .filter((w) => w.enabled)
            .map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-xl text-xs backdrop-blur-md border"
                style={{
                  backgroundColor: hexToRgba(a?.accentColor || '#00AAFF', 0.12),
                  borderColor: hexToRgba(a?.accentColor || '#00AAFF', 0.25),
                  color: a?.textColor || '#ffffff',
                }}
              >
                <p className="font-semibold capitalize">{w.type} widget</p>
                {w.config?.text && (
                  <p className="mt-1 opacity-80">{w.config.text}</p>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Music bottom */}
      {musicAtBottom && (
        <div className="w-full max-w-sm mt-6">
          <MusicPlayerPreview music={profile?.music} />
        </div>
      )}
    </>
  );

  return (
    <div
      className={wrapperClass}
      style={gradient ? { backgroundImage: gradient } : undefined}
    >
      {isVideo && videoUrl && (
        <video
          key={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          // @ts-ignore
          disablePictureInPicture
          controls={false}
          style={{
            filter: `blur(${a?.backgroundBlur || 0}px)`,
            opacity: (a?.backgroundOpacity ?? 100) / 100,
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            imageRendering: 'auto',
          }}
        />
      )}

      {isImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${imageSrc})`,
            filter: `blur(${a?.backgroundBlur ?? 0}px)`,
            opacity: (a?.backgroundOpacity ?? 100) / 100,
          }}
        />
      )}

      {!isVideo && !isImage && !isGradient && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: a?.backgroundColor || '#000000' }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/50 pointer-events-none" />

      {a?.backgroundEffect && a.backgroundEffect !== 'none' && (
        <BackgroundEffect
          effect={a.backgroundEffect}
          color={a.backgroundEffectColor || '#00AAFF'}
        />
      )}

      <div className={contentClass}>
        {panelEnabled ? (
          <div
            className="p-6 sm:p-8 w-full max-w-sm sm:max-w-md"
            style={panelStyle}
          >
            <div className="flex flex-col items-center">{innerContent}</div>
          </div>
        ) : (
          <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">
            {innerContent}
          </div>
        )}
      </div>
    </div>
  );
}