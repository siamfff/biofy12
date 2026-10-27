import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfileData } from '../../hooks/useProfile';
import { defaultAppearance } from '../../services/userService';
import { ProfilePreview } from '../../components/profile/ProfilePreview';
import { AssetsUploader } from '../../components/customize/AssetsUploader';
import { GeneralCustomization } from '../../components/customize/GeneralCustomization';
import { ColorCustomization } from '../../components/customize/ColorCustomization';
import { OtherCustomization } from '../../components/customize/OtherCustomization';
import { MusicSection } from '../../components/customize/MusicSection';
import { WidgetsSection } from '../../components/customize/WidgetsSection';
import { AppearanceSettings } from '../../types';

const NAV_SECTIONS = [
  { id: 'assets', label: 'Assets' },
  { id: 'general', label: 'General' },
  { id: 'colors', label: 'Colors' },
  { id: 'other', label: 'Other' },
  { id: 'music', label: 'Music' },
  { id: 'widgets', label: 'Widgets' },
];

export default function Customize() {
  const { profile } = useAuth();
  const { links, socials, widgets } = useProfileData();
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance());

  useEffect(() => {
    if (profile?.appearance) {
      setAppearance({ ...defaultAppearance(), ...profile.appearance });
    }
  }, [profile?.uid]);

  if (!profile) return null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-6 max-w-7xl mx-auto">
      {/* Left: Settings — min-w-0 to prevent overflow */}
      <div className="space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Customize</h1>
          <p className="text-xs text-muted mt-1">
            Everything about your profile in one place
          </p>
        </div>

        {/* Mini nav */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {NAV_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-muted hover:text-white hover:bg-bg-card border border-border transition"
            >
              {s.label}
            </button>
          ))}
        </div>

        <AssetsUploader appearance={appearance} setAppearance={setAppearance} />
        <GeneralCustomization appearance={appearance} setAppearance={setAppearance} />
        <ColorCustomization appearance={appearance} setAppearance={setAppearance} />
        <OtherCustomization appearance={appearance} setAppearance={setAppearance} />
        <MusicSection />
        <WidgetsSection />
      </div>

      {/* Right: Preview — fixed 400px */}
      <div className="lg:sticky lg:top-6 h-fit w-full lg:w-[400px]">
        <p className="text-xs text-muted mb-2">Live preview</p>
        <div className="w-full">
          <ProfilePreview
            profile={{ ...profile, appearance }}
            links={links}
            socials={socials}
            widgets={widgets}
          />
        </div>
      </div>
    </div>
  );
}