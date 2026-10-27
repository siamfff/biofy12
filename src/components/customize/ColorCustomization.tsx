import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/userService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ColorPicker } from '../common/ColorPicker';
import { AppearanceSettings } from '../../types';
import { FiZap } from 'react-icons/fi';

interface Props {
  appearance: AppearanceSettings;
  setAppearance: (a: AppearanceSettings) => void;
}

export function ColorCustomization({ appearance, setAppearance }: Props) {
  const { profile, refreshProfile } = useAuth();
  if (!profile) return null;

  const update = <K extends keyof AppearanceSettings>(k: K, v: AppearanceSettings[K]) =>
    setAppearance({ ...appearance, [k]: v });

  const save = async () => {
    await updateUserProfile(profile.uid, { appearance });
    await refreshProfile();
  };

  return (
    <section id="colors" className="scroll-mt-24">
      <Card title="Color Customization">
        <div className="grid sm:grid-cols-2 gap-4">
          <ColorPicker
            label="Accent Color"
            value={appearance.primaryColor}
            onChange={(v) => {
              update('primaryColor', v);
              update('accentColor', v);
            }}
          />
          <ColorPicker
            label="Text Color"
            value={appearance.textColor}
            onChange={(v) => update('textColor', v)}
          />
          <ColorPicker
            label="Background Color"
            value={appearance.backgroundColor}
            onChange={(v) => update('backgroundColor', v)}
          />
          <ColorPicker
            label="Icon Color"
            value={appearance.iconColor}
            onChange={(v) => update('iconColor', v)}
          />
          <ColorPicker
            label="Background Effect Color"
            value={appearance.backgroundEffectColor}
            onChange={(v) => update('backgroundEffectColor', v)}
          />
          <div className="flex items-end">
            <Button
              variant={appearance.profileGradientEnabled ? 'primary' : 'secondary'}
              onClick={() => update('profileGradientEnabled', !appearance.profileGradientEnabled)}
              fullWidth
            >
              <FiZap size={14} />
              {appearance.profileGradientEnabled ? 'Profile Gradient On' : 'Enable Profile Gradient'}
            </Button>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-border">
          <Button onClick={save}>Save colors</Button>
        </div>
      </Card>
    </section>
  );
}