import { useAuth } from '../../hooks/useAuth';
import {
  updateUserProfile,
  isPremiumActive,
} from '../../services/userService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { AppearanceSettings } from '../../types';
import { FiSave, FiStar, FiInfo } from 'react-icons/fi';

interface Props {
  appearance: AppearanceSettings;
  setAppearance: (a: AppearanceSettings) => void;
}

export function OtherCustomization({ appearance, setAppearance }: Props) {
  const { profile, refreshProfile } = useAuth();
  if (!profile) return null;

  const premiumActive = isPremiumActive(profile);
  const showPremiumBadge = appearance.showPremiumBadge !== false;

  const update = <K extends keyof AppearanceSettings>(
    k: K,
    v: AppearanceSettings[K],
  ) => setAppearance({ ...appearance, [k]: v });

  const save = async () => {
    await updateUserProfile(profile.uid, { appearance });
    await refreshProfile();
  };

  const toggles: {
    key: keyof AppearanceSettings;
    label: string;
    desc: string;
  }[] = [
    {
      key: 'monochromeIcons',
      label: 'Monochrome Icons',
      desc: 'Make social icons grayscale',
    },
    {
      key: 'animatedTitle',
      label: 'Animated Title',
      desc: 'Animate your display name',
    },
    {
      key: 'swapBoxColors',
      label: 'Swap Box Colors',
      desc: 'Invert card colors',
    },
    {
      key: 'volumeControl',
      label: 'Volume Control',
      desc: 'Show volume slider on music player',
    },
    {
      key: 'useDiscordAvatar',
      label: 'Use Discord Avatar',
      desc: 'Sync Discord avatar',
    },
    {
      key: 'discordAvatarDecoration',
      label: 'Discord Avatar Decoration',
      desc: 'Show avatar decoration',
    },
  ];

  return (
    <section id="other" className="scroll-mt-24">
      <Card title="Other Customization">
        {/* Premium Badge toggle — only if premium active */}
        {premiumActive && (
          <div className="mb-5 rounded-xl border border-brand/40 bg-brand/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-9 w-9 rounded-lg bg-brand/20 text-brand-soft flex items-center justify-center shrink-0">
                  <FiStar size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium flex items-center gap-2">
                    Premium Badge
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-brand/20 text-brand-soft">
                      Active
                    </span>
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Show or hide the Premium badge on your profile
                  </p>
                </div>
              </div>
              <Switch
                checked={showPremiumBadge}
                onChange={(v) => update('showPremiumBadge', v)}
              />
            </div>
          </div>
        )}

        {!premiumActive && !profile.premium && (
          <div className="mb-5 rounded-xl border border-border bg-bg-soft p-3 flex items-start gap-2">
            <FiInfo size={14} className="text-muted shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted">
              Premium badge is auto-granted when you subscribe to Premium. It
              stays active as long as your subscription is active.
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{t.label}</p>
                <p className="text-[11px] text-muted mt-0.5">{t.desc}</p>
              </div>
              <Switch
                checked={(appearance[t.key] as boolean) ?? false}
                onChange={(v) => update(t.key, v as any)}
              />
            </div>
          ))}
        </div>
        <div className="mt-5 pt-5 border-t border-border">
          <Button onClick={save}>
            <FiSave size={14} /> Save toggles
          </Button>
        </div>
      </Card>
    </section>
  );
}