import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  changeEmail,
  changePassword,
  logoutUser,
  resetPassword,
} from '../../services/authService';
import { updateUserProfile, deleteUserAccount } from '../../services/userService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Tabs } from '../../components/ui/Tabs';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { validateEmail, validatePassword } from '../../utils/validation';
import { PrivacySettings } from '../../types';
import {
  FiMail,
  FiLock,
  FiShield,
  FiUser,
  FiTrash2,
  FiLogOut,
  FiSave,
  FiAlertTriangle,
  FiEye,
  FiMonitor,
} from 'react-icons/fi';

type TabId = 'account' | 'security' | 'privacy' | 'sessions' | 'danger';

export default function Settings() { // 👈 এখানে export default আছে
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<TabId>('account');

  // Account tab state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Password tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

  // Privacy state
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    publicProfile: true,
    showAnalytics: false,
    allowMessages: true,
    showEmail: false,
  });
  const [privacySaving, setPrivacySaving] = useState(false);

  // Danger zone
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (profile?.privacy) setPrivacy({ ...privacy, ...profile.privacy });
  }, [profile?.uid]);

  useEffect(() => {
    if (user?.email) setNewEmail(user.email);
  }, [user?.email]);

  // ------------- Account: email change -------------
  const handleEmailChange = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError('');
    if (!user) return;
    const res = validateEmail(newEmail);
    if (!res.valid) {
      setEmailError(res.error || 'Invalid email');
      return;
    }
    if (newEmail === user.email) {
      setEmailError('This is already your email');
      return;
    }
    if (!emailPassword) {
      setEmailError('Enter your current password');
      return;
    }
    setEmailSaving(true);
    try {
      await changeEmail(user, newEmail.trim(), emailPassword);
      setEmailPassword('');
      toast.success('Email updated');
    } catch (err: any) {
      const msg = err?.message?.replace('Firebase: ', '') || 'Failed to update email';
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setEmailSaving(false);
    }
  };

  // ------------- Security: password change -------------
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!user) return;

    if (!currentPassword) errs.currentPassword = 'Required';
    const res = validatePassword(newPassword);
    if (!res.valid) errs.newPassword = res.error || 'Invalid';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setPwdErrors(errs);
    if (Object.keys(errs).length) return;

    setPwdSaving(true);
    try {
      await changePassword(user, newPassword, currentPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (err: any) {
      const msg = err?.message?.replace('Firebase: ', '') || 'Failed to change password';
      toast.error(msg);
    } finally {
      setPwdSaving(false);
    }
  };

  const handleSendReset = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      toast.success('Password reset email sent');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send reset email');
    }
  };

  // ------------- Privacy -------------
  const savePrivacy = async () => {
    if (!profile) return;
    setPrivacySaving(true);
    try {
      await updateUserProfile(profile.uid, { privacy });
      await refreshProfile();
      toast.success('Privacy settings saved');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setPrivacySaving(false);
    }
  };

  // ------------- Delete account (ক্লাউডিনারি ডিলিটসহ) -------------
  const handleDeleteAccount = async () => {
    if (!user || !profile) return;
    if (deleteConfirm !== profile.username) {
      toast.error('Type your username to confirm');
      return;
    }
    setDeleting(true);
    try {
      // 👇 ক্লাউডিনারি থেকে অ্যাভাটার ও ব্যাকগ্রাউন্ড ডিলিট
      const deleteCloudinary = async (pid: string | undefined, type: 'image'|'video') => {
        if(!pid) return;
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: pid, resourceType: type })
        });
      };

      const mediaProfile = profile as typeof profile & {
        avatarPublicId?: string;
        backgroundPublicId?: string;
      };
      if (mediaProfile.avatarPublicId) await deleteCloudinary(mediaProfile.avatarPublicId, 'image');
      if (mediaProfile.backgroundPublicId) await deleteCloudinary(mediaProfile.backgroundPublicId, 'image');

      // ফায়ারবেস অ্যাকাউন্ট ডিলিট
      await deleteUserAccount(user.uid);
      await logoutUser();
      toast.success('Account deleted');
      navigate('/login');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  // ------------- Logout -------------
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      navigate('/login');
    } catch (e: any) {
      toast.error(e?.message || 'Logout failed');
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Settings</h1>
        <p className="text-xs text-muted mt-1">
          Manage your account, security and privacy preferences
        </p>
      </div>

      <Tabs
        value={tab}
        onChange={(v) => setTab(v as TabId)}
        tabs={[
          { id: 'account', label: 'Account', icon: <FiUser size={12} /> },
          { id: 'security', label: 'Security', icon: <FiLock size={12} /> },
          { id: 'privacy', label: 'Privacy', icon: <FiShield size={12} /> },
          { id: 'sessions', label: 'Sessions', icon: <FiMonitor size={12} /> },
          { id: 'danger', label: 'Danger zone', icon: <FiAlertTriangle size={12} /> },
        ]}
      />

      {/* ============ ACCOUNT ============ */}
      {tab === 'account' && (
        <div className="space-y-4">
          <Card title="Email address" description="Used to sign in and receive notifications">
            <form onSubmit={handleEmailChange} className="space-y-3">
              <Input
                label="Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                leftIcon={<FiMail size={14} />}
                error={emailError}
              />
              <Input
                label="Current password"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                leftIcon={<FiLock size={14} />}
                placeholder="Required to change email"
              />
              <Button
                type="submit"
                loading={emailSaving}
                disabled={newEmail === user.email}
              >
                <FiSave size={14} /> Update email
              </Button>
            </form>
          </Card>

          <Card title="Account info">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-bg-soft p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted">Username</p>
                <p className="text-sm text-white font-mono mt-1">@{profile.username}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-soft p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted">Account ID</p>
                <p className="text-sm text-white font-mono mt-1 truncate">{profile.uid}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ============ SECURITY ============ */}
      {tab === 'security' && (
        <div className="space-y-4">
          <Card title="Change password" description="At least 8 characters with letters and numbers">
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <Input
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<FiLock size={14} />}
                error={pwdErrors.currentPassword}
              />
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<FiLock size={14} />}
                error={pwdErrors.newPassword}
                hint="8+ chars, upper, lower and a number"
              />
              <Input
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<FiLock size={14} />}
                error={pwdErrors.confirmPassword}
              />
              <Button type="submit" loading={pwdSaving}>
                <FiSave size={14} /> Change password
              </Button>
            </form>
          </Card>

          <Card
            title="Password reset email"
            description="If you're having trouble, we can send you a reset link"
          >
            <Button variant="secondary" onClick={handleSendReset}>
              <FiMail size={14} /> Send reset email to {user.email}
            </Button>
          </Card>
        </div>
      )}

      {/* ============ PRIVACY ============ */}
      {tab === 'privacy' && (
        <Card
          title="Privacy"
          description="Control who can see and interact with your profile"
          action={
            <Button size="sm" onClick={savePrivacy} loading={privacySaving}>
              <FiSave size={12} /> Save
            </Button>
          }
        >
          <div className="space-y-4">
            <Switch
              checked={privacy.publicProfile}
              onChange={(v) => setPrivacy({ ...privacy, publicProfile: v })}
              label="Public profile"
              description="Anyone with the link can view your profile"
            />
            <Switch
              checked={privacy.showAnalytics}
              onChange={(v) => setPrivacy({ ...privacy, showAnalytics: v })}
              label="Public analytics"
              description="Show view/click counters on your profile"
            />
            <Switch
              checked={privacy.allowMessages}
              onChange={(v) => setPrivacy({ ...privacy, allowMessages: v })}
              label="Allow messages"
              description="Let visitors send you messages"
            />
            <Switch
              checked={privacy.showEmail}
              onChange={(v) => setPrivacy({ ...privacy, showEmail: v })}
              label="Show email"
              description="Display your email on your public profile"
            />
          </div>
        </Card>
      )}

      {/* ============ SESSIONS ============ */}
      {tab === 'sessions' && (
        <Card
          title="Active session"
          description="Devices currently signed into your account"
        >
          <div className="rounded-xl border border-border bg-bg-soft p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand/15 text-brand-soft flex items-center justify-center shrink-0">
              <FiMonitor size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">This device</p>
              <p className="text-[11px] text-muted truncate">
                {typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success">
              ACTIVE
            </span>
          </div>

          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setLogoutOpen(true)}
            >
              <FiLogOut size={14} /> Sign out of this device
            </Button>
          </div>
        </Card>
      )}

      {/* ============ DANGER ZONE ============ */}
      {tab === 'danger' && (
        <div className="space-y-4">
          <Card
            title="Sign out"
            description="Log out of your account on this device"
          >
            <Button variant="secondary" onClick={() => setLogoutOpen(true)}>
              <FiLogOut size={14} /> Log out
            </Button>
          </Card>

          <Card
            className="border-danger/40 bg-danger/5"
            title="Delete account"
            description="This permanently removes your profile, links, uploads and history"
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                <div className="flex items-start gap-2">
                  <FiAlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">This cannot be undone</p>
                    <p className="opacity-90 mt-1">
                      All your data — profile, links, uploads, analytics and
                      messages — will be permanently erased.
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                <FiTrash2 size={14} /> Delete my account
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Logout confirm */}
      <ConfirmDialog
        open={logoutOpen}
        title="Log out?"
        message="You'll need to sign in again to access your dashboard."
        confirmLabel="Log out"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
        danger={false}
      />

      {/* Delete account confirm */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete your account?"
        message={
          <div className="space-y-3">
            <p>
              This permanently deletes your account and all associated data.
              This action cannot be undone.
            </p>
            <div>
              <label className="block text-xs text-muted mb-1">
                Type your username{' '}
                <span className="text-white font-mono">@{profile.username}</span>{' '}
                to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full bg-bg-soft border border-border rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-danger"
                placeholder={profile.username || ''}
              />
            </div>
          </div>
        }
        confirmLabel="Delete permanently"
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteConfirm('');
        }}
        onConfirm={handleDeleteAccount}
        loading={deleting}
        danger
      />
    </div>
  );
}