import { useState } from 'react';
import { FiSave, FiInfo } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Textarea } from '../../components/ui/Textarea';
import { useToast } from '../../hooks/useToast';

export default function AdminSettings() {
  const toast = useToast();

  const [siteName, setSiteName] = useState('Nebula');
  const [siteDescription, setSiteDescription] = useState(
    'Your profile, elevated. Customize everything, share one link.',
  );
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxUsernameLength, setMaxUsernameLength] = useState(30);

  const handleSave = () => {
    // These would be saved to Firestore `settings/app` doc in a full impl
    toast.success('Settings saved (local only — backend pending)');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Site Settings</h1>
        <p className="text-xs text-muted mt-1">Configure platform-wide settings</p>
      </div>

      <Card className="border-brand/30 bg-brand/5">
        <div className="flex items-start gap-3">
          <FiInfo size={18} className="text-brand-soft shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Preview Mode
            </h3>
            <p className="text-xs text-muted mt-1">
              Settings below are UI previews. Backend persistence coming in a
              later update.
            </p>
          </div>
        </div>
      </Card>

      <Card title="General" description="Basic site information">
        <div className="space-y-4">
          <Input
            label="Site Name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
          <Textarea
            label="Site Description"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={2}
          />
          <Input
            label="Max Username Length"
            type="number"
            value={maxUsernameLength}
            onChange={(e) => setMaxUsernameLength(Number(e.target.value) || 30)}
            min={3}
            max={60}
          />
        </div>
      </Card>

      <Card title="Controls" description="Registration & availability">
        <div className="space-y-4">
          <Switch
            checked={registrationOpen}
            onChange={setRegistrationOpen}
            label="Registration open"
            description="Allow new users to sign up"
          />
          <Switch
            checked={maintenanceMode}
            onChange={setMaintenanceMode}
            label="Maintenance mode"
            description="Temporarily disable the site for all users"
          />
        </div>
      </Card>

      <Button onClick={handleSave}>
        <FiSave size={14} /> Save Settings
      </Button>
    </div>
  );
}