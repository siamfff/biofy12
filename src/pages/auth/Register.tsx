import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  registerUser,
  checkUsernameExists,
  signInWithGoogle,
} from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validation';
import { useDebounce } from '../../hooks/useDebounce';
import { FcGoogle } from 'react-icons/fc';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiChevronLeft } from 'react-icons/fi';

const LOGO_URL = 'https://i.postimg.cc/66RGqxBR/a4fe11fa-d54e-437f-9654-ded3cbbe6315.png';

type Step = 1 | 2 | 3;

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();

  // If already logged in → dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const [step, setStep] = useState<Step>(1);
  const [username, setUsername] = useState(() =>
    (searchParams.get('claim') || '').toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30),
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToS, setAgreeToS] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const debouncedUsername = useDebounce(username, 400);

  useEffect(() => {
    let cancelled = false;
    if (!debouncedUsername) {
      setAvailable(null);
      return;
    }
    const res = validateUsername(debouncedUsername);
    if (!res.valid) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    checkUsernameExists(debouncedUsername)
      .then((exists) => !cancelled && setAvailable(!exists))
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedUsername]);

  const handleUsernameContinue = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const res = validateUsername(username);
    if (!res.valid) errs.username = res.error!;
    if (available === false) errs.username = 'Username is taken';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStep(2);
  };

  const handleEmailContinue = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const res = validateEmail(email);
    if (!res.valid) errs.email = res.error!;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStep(3);
  };

  const handleCreateAccount = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const res = validatePassword(password);
    if (!res.valid) errs.password = res.error!;
    if (!agreeToS) errs.agreeToS = 'You must agree to the Terms of Service';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await registerUser(email.trim(), password, username, username);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message?.replace('Firebase: ', '') || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        toast.success('Almost there — set your username!');
        navigate('/setup-username');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.message?.replace('Firebase: ', '') || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-bg-card p-7 sm:p-8 shadow-card">
          <img
            src={LOGO_URL}
            alt="Nebula"
            className="h-12 w-12 rounded-2xl object-cover shadow-glow mb-6"
          />

          {/* STEP 1: Username */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-white font-display">
                Create your account
              </h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Build your profile, share your links, and customize everything
                in one place.
              </p>

              <form onSubmit={handleUsernameContinue} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <FiUser
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                    />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="username"
                      autoFocus
                      className="w-full bg-bg-soft border border-border rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[11px]">
                    <span className="text-muted">nebula.app/u/</span>
                    <span
                      className={
                        checking
                          ? 'text-muted'
                          : available === true
                            ? 'text-success'
                            : available === false
                              ? 'text-danger'
                              : 'text-muted'
                      }
                    >
                      {checking
                        ? 'Checking…'
                        : available === true
                          ? '✓ Available'
                          : available === false
                            ? '✗ Taken'
                            : ''}
                    </span>
                  </div>
                  {errors.username && (
                    <p className="text-xs text-danger mt-1">{errors.username}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!username || available !== true || checking}
                  className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
                >
                  Continue
                </button>

                <p className="text-center text-xs text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand-soft hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}

          {/* STEP 2: Email */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-white font-display">
                Create your account
              </h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Build your profile, share your links, and customize everything
                in one place.
              </p>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-4 inline-flex items-center gap-1 text-xs text-muted hover:text-white transition"
              >
                <FiChevronLeft size={14} /> Back
              </button>

              <div className="mt-4 rounded-xl bg-bg-soft border border-border p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted">Username</p>
                  <p className="text-sm text-white font-medium truncate">
                    nebula.app/u/{username}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-brand-soft hover:underline shrink-0 ml-2"
                >
                  Edit
                </button>
              </div>

              <form onSubmit={handleEmailContinue} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      autoFocus
                      className="w-full bg-bg-soft border border-border rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-danger mt-1">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm hover:brightness-110 transition shadow-glow"
                >
                  Continue
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-bg-soft border border-border hover:border-brand/40 text-white font-medium text-sm transition disabled:opacity-60"
              >
                {googleLoading ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FcGoogle size={20} />
                )}
                Sign up with Google
              </button>
            </>
          )}

          {/* STEP 3: Password */}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-white font-display">
                Finish your signup
              </h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Your email is set. Add a password and confirm your username.
              </p>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-4 inline-flex items-center gap-1 text-xs text-muted hover:text-white transition"
              >
                <FiChevronLeft size={14} /> Back
              </button>

              <div className="mt-4 rounded-xl bg-bg-soft border border-border p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted">Email Address</p>
                  <p className="text-sm text-white font-medium truncate">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-brand-soft hover:underline shrink-0 ml-2"
                >
                  Edit
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      autoFocus
                      className="w-full bg-bg-soft border border-border rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted hover:text-white hover:bg-bg-elevated transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-danger mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <FiUser
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                    />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      className="w-full bg-bg-soft border border-border rounded-xl pl-10 pr-3 py-3 text-sm text-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToS}
                    onChange={(e) => setAgreeToS(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border bg-bg-soft accent-brand cursor-pointer"
                  />
                  <span className="text-xs text-muted leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-brand-soft hover:underline">
                      ToS
                    </Link>{' '}
                    &{' '}
                    <Link to="/privacy" className="text-brand-soft hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToS && (
                  <p className="text-xs text-danger">{errors.agreeToS}</p>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeMarketing}
                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border bg-bg-soft accent-brand cursor-pointer"
                  />
                  <span className="text-xs text-muted leading-relaxed">
                    I agree to receive offers, news and updates from Nebula.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !agreeToS}
                  className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}