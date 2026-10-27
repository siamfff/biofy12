import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/public/Navbar';
import { Footer } from '../../components/public/Footer';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import {
  FiUser,
  FiImage,
  FiShare2,
  FiMusic,
  FiGrid,
  FiAward,
  FiBarChart2,
  FiZap,
  FiShield,
  FiSmartphone,
  FiCheck,
  FiArrowRight,
  FiMessageSquare,
  FiChevronDown,
} from 'react-icons/fi';
 
const HERO_IMAGE =
  'https://i.postimg.cc/Qty8Jb10/9e148ce5-7238-44a4-8d61-17afc86cea13.png';
 
const FEATURES = [
  { icon: <FiUser size={20} />, title: 'Custom Profiles', desc: 'Every profile is yours — avatar, bio, username and identity.', color: '#a855f7' },
  { icon: <FiImage size={20} />, title: 'Backgrounds', desc: 'Images, gradients or short video backgrounds. Full control.', color: '#c084fc' },
  { icon: <FiShare2 size={20} />, title: 'Social Links', desc: 'Add 14+ socials with beautiful, instantly-recognized icons.', color: '#f59e0b' },
  { icon: <FiMusic size={20} />, title: 'Music Player', desc: 'Set a track that plays on your profile with full player settings.', color: '#ec4899' },
  { icon: <FiGrid size={20} />, title: 'Widgets', desc: 'Discord, Spotify, GitHub and more blocks you can reorder.', color: '#22c55e' },
  { icon: <FiAward size={20} />, title: 'Badges', desc: 'Collect badges like Verified, Premium, Staff and Bug Hunter.', color: '#8b5cf6' },
  { icon: <FiBarChart2 size={20} />, title: 'Analytics', desc: 'See views, link clicks and growth — all in one dashboard.', color: '#d946ef' },
  { icon: <FiZap size={20} />, title: 'Premium', desc: 'Advanced customization, video backgrounds and priority access.', color: '#facc15' },
  { icon: <FiShield size={20} />, title: 'Fast & Secure', desc: 'Firebase-backed auth, isolated user data and hardened rules.', color: '#10b981' },
  { icon: <FiSmartphone size={20} />, title: 'Mobile Friendly', desc: 'Every profile looks polished on phone, tablet and desktop.', color: '#a78bfa' },
];
 
const FAQ = [
  { q: 'What is Nebula?', a: 'Nebula is a link-in-bio platform. You get one clean, fully customizable page that holds all your socials, links, music and widgets, so you only ever share a single URL.' },
  { q: 'Is Nebula free?', a: 'Yes. You can build and share a profile for free. Premium unlocks advanced customization, extended analytics and an exclusive badge.' },
  { q: 'What can I do with Nebula?', a: 'Add links and socials, set a background (image, gradient or video), play music, show Discord or Spotify widgets, collect badges and track views and clicks.' },
  { q: 'How long does setup take?', a: 'Under a minute. Claim your username, add your links, pick a style and share your page.' },
  { q: 'Is my data safe?', a: 'Accounts use Firebase Authentication and each user can only edit their own data. You can make your profile private any time from Settings.' },
];
 
const PLANS = [
  { name: 'Free', price: '$0', period: 'forever', blurb: 'For beginners, link all your socials in one place.', perks: ['Public profile', 'Unlimited links', 'Basic themes', 'Music player'], highlight: false },
  { name: 'Premium', price: '$4.99', period: '/month', blurb: 'Discover your creativity and unlock more features.', perks: ['Everything in Free', 'Premium badge', 'Advanced appearance', 'Priority support'], highlight: true },
  { name: 'Creator', price: '$9.99', period: '/month', blurb: 'For creators who want to grow their audience.', perks: ['Everything in Premium', 'Creator badge', 'Extended analytics', 'Custom domain'], highlight: false },
  { name: 'Lifetime', price: '$99.99', period: 'one-time', blurb: 'Pay once. Keep it forever.', perks: ['Everything forever', 'Founder badge', 'Early access', 'Direct support line'], highlight: false },
];
 
/* Floating purple particles (hero background) */
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 7) % 100}%`,
  size: 3 + (i % 4),
  delay: `${(i * 1.3) % 9}s`,
  duration: `${9 + (i % 5) * 2}s`,
}));
 
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-brand-soft/70 animate-drift"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            boxShadow: '0 0 10px rgba(192,132,252,0.8)',
          }}
        />
      ))}
    </div>
  );
}
 
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border bg-bg-card/80 transition-colors ${
        open ? 'border-brand/50' : 'border-border hover:border-brand/30'
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <FiChevronDown
          size={16}
          className={`text-brand-soft shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{a}</p>}
    </div>
  );
}
 
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl sm:text-5xl font-bold text-white font-display">{title}</h2>
      {sub && <p className="text-sm sm:text-base text-muted mt-3 max-w-xl mx-auto">{sub}</p>}
    </div>
  );
}
 
export default function Home() {
  const [claim, setClaim] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const handlePrimaryCTA = () => {
    if (user) navigate('/dashboard');
    else navigate('/register');
  };
 
  const onClaim = (e: FormEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard');
      return;
    }
    const name = claim.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    navigate(name ? `/register?claim=${encodeURIComponent(name)}` : '/register');
  };
 
  return (
    <div className="relative min-h-screen bg-bg overflow-x-hidden">
      {/* Top purple glow (behind everything) */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[900px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(124,58,237,0.38) 0%, rgba(88,28,135,0.18) 45%, transparent 75%)',
        }}
      />
 
      <div className="relative z-10">
        <Navbar />
 
        {/* HERO */}
        <section className="relative">
          <Particles />
 
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/30 bg-brand/10 text-brand-soft text-xs font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-soft animate-pulse" />
              New · Video backgrounds + 14 social platforms
            </div>
 
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white font-display leading-[1.05] max-w-4xl mx-auto">
              Everything you need,{' '}
              <span className="text-gradient">right here.</span>
            </h1>
 
            <p className="text-sm sm:text-lg text-muted max-w-2xl mx-auto mt-6 leading-relaxed">
              Nebula is your go-to for modern, feature-rich link-in-bio pages.
              Drag, drop, reorder — make it truly yours.
            </p>
 
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Button size="lg" onClick={handlePrimaryCTA}>
                <FiZap size={16} /> {user ? 'Go to Dashboard' : 'Sign Up for Free'}
              </Button>
              <a href="#pricing">
                <Button variant="secondary" size="lg">
                  View Pricing
                </Button>
              </a>
            </div>
 
            {!user && (
              <>
                <form
                  onSubmit={onClaim}
                  className="flex items-center gap-2 max-w-md mx-auto mt-8 rounded-2xl border border-border bg-bg-card/80 backdrop-blur p-1.5 focus-within:border-brand/60 focus-within:shadow-glow transition"
                >
                  <span className="pl-3 text-sm text-muted select-none">nebula/</span>
                  <input
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="username"
                    maxLength={30}
                    aria-label="Claim your username"
                    className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-muted/60 outline-none py-2"
                  />
                  <Button type="submit">Claim Now</Button>
                </form>
                <p className="text-[11px] text-muted mt-3">
                  Free forever · No credit card ·{' '}
                  <a href="#pricing" className="text-brand-soft hover:underline">
                    View pricing
                  </a>
                </p>
              </>
            )}
          </div>
 
          {/* Tilted preview mockup */}
          <div
            className="relative max-w-6xl mx-auto px-3 sm:px-6 pb-20"
            style={{ perspective: '1600px' }}
          >
            <div
              className="relative rounded-3xl border border-brand/40 overflow-hidden"
              style={{
                transform: 'rotateX(12deg)',
                transformOrigin: 'center top',
                boxShadow: '0 0 120px -30px rgba(168,85,247,0.65)',
              }}
            >
              <img src={HERO_IMAGE} alt="Nebula Preview" className="w-full block" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
          </div>
        </section>
 
        {/* FEATURES */}
        <section id="features" className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Packed with everything"
              sub="All the tools you need to build a profile that stands out."
            />
 
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-bg-card/80 p-5 hover:border-brand/50 hover:-translate-y-1 hover:shadow-[0_0_40px_-16px_rgba(168,85,247,0.6)] transition-all duration-200"
                >
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: f.color + '22', color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* HOW IT WORKS */}
        <section className="py-20 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="How it works" sub="Live in under a minute." />
 
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { n: '01', title: 'Create your account', desc: 'Sign up with your email. No credit card required.' },
                { n: '02', title: 'Customize your profile', desc: 'Add links, socials, music and pick your style.' },
                { n: '03', title: 'Share your profile', desc: 'Send one link everywhere. Track every click.' },
              ].map((s) => (
                <div
                  key={s.n}
                  className="rounded-2xl border border-border bg-bg-card/80 p-6 hover:border-brand/40 transition"
                >
                  <p className="text-4xl font-bold font-display text-gradient">{s.n}</p>
                  <h3 className="text-base font-semibold text-white mt-3">{s.title}</h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* CUSTOMIZATION */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white font-display">
                Make it yours — down to the last pixel.
              </h2>
              <p className="text-sm sm:text-base text-muted mt-4 leading-relaxed">
                Colors, blur, opacity, borders, shadows, cursor, animations,
                background video — you decide every detail.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {['Backgrounds', 'Colors', 'Blur', 'Transparency', 'Fonts', 'Animations', 'Links', 'Socials', 'Music', 'Widgets'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white">
                    <FiCheck size={14} className="text-brand-soft" /> {f}
                  </div>
                ))}
              </div>
            </div>
 
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Primary color', color: '#a855f7' },
                { label: 'Accent', color: '#c084fc' },
                { label: 'Success', color: '#22c55e' },
                { label: 'Warning', color: '#f59e0b' },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-border bg-bg-card/80 p-4">
                  <div
                    className="h-16 rounded-xl mb-3"
                    style={{ backgroundColor: c.color, boxShadow: `0 0 30px -8px ${c.color}` }}
                  />
                  <p className="text-xs font-medium text-white">{c.label}</p>
                  <p className="text-[10px] text-muted font-mono mt-0.5">{c.color}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* ANALYTICS */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Know your audience" sub="Track views, clicks and growth in real time." />
 
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { label: 'Profile views', value: '12.4K', growth: '+18%', color: '#a855f7' },
                { label: 'Link clicks', value: '3.8K', growth: '+12%', color: '#c084fc' },
                { label: 'Countries', value: '42', growth: '+5', color: '#f59e0b' },
                { label: 'Conversion', value: '31%', growth: '+2%', color: '#22c55e' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-bg-card/80 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted">{s.label}</p>
                    <span className="text-[10px] font-semibold" style={{ color: s.color }}>
                      {s.growth}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white font-display">{s.value}</p>
                  <div className="h-1.5 rounded-full bg-bg-soft mt-3 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: '65%',
                        background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* PRICING */}
        <section id="pricing" className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Simple pricing" sub="Start free. Upgrade anytime." />
 
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {PLANS.map((p) => (
                <div
                  key={p.name}
                  className={`relative rounded-3xl border p-6 flex flex-col transition-all duration-200 hover:-translate-y-1 ${
                    p.highlight
                      ? 'border-brand/70 bg-gradient-to-b from-brand/20 via-brand/5 to-transparent shadow-glow'
                      : 'border-border bg-bg-card/80 hover:border-brand/40'
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand border border-brand/60 px-3 py-0.5 text-[10px] font-semibold text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-white font-display">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-white font-display">{p.price}</span>
                    <span className="text-xs text-muted">{p.period}</span>
                  </div>
                  <p className="text-xs text-muted mt-2 leading-relaxed">{p.blurb}</p>
                  <ul className="space-y-2.5 my-6 flex-1">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-white/90">
                        <FiCheck size={15} className="text-brand-soft shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={p.highlight ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={handlePrimaryCTA}
                  >
                    {user ? 'Go to Dashboard' : p.highlight ? 'Learn more' : 'Get started'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* COMPARE */}
        <section id="compare" className="py-20 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <SectionTitle
              title="Compare with others"
              sub="Nebula gives you more customization with less friction."
            />
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: 'Setup time', us: '30 seconds', them: 'Minutes' },
                { label: 'Customization', us: 'Everything', them: 'Limited' },
                { label: 'Analytics', us: 'Built-in', them: 'Extra cost' },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-border bg-bg-card/80 p-5">
                  <p className="text-xs text-muted mb-3">{c.label}</p>
                  <p className="text-sm font-semibold text-brand-soft">Nebula · {c.us}</p>
                  <p className="text-[11px] text-muted mt-1">Others · {c.them}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* DISCORD */}
        <section id="discord" className="py-20 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent p-8 sm:p-12 text-center">
              <div className="inline-flex h-14 w-14 rounded-2xl bg-[#5865F2] items-center justify-center mb-4">
                <FiMessageSquare size={24} className="text-white" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white font-display">
                Join the community
              </h2>
              <p className="text-sm sm:text-base text-muted mt-3 max-w-lg mx-auto">
                Get help, share your profile, and see what others are building.
              </p>
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto my-8">
                {[
                  { v: '2.4K', l: 'Members' },
                  { v: '180+', l: 'Online' },
                  { v: '12K+', l: 'Messages' },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border bg-bg-card/80 p-3">
                    <p className="text-xl font-bold text-white font-display">{s.v}</p>
                    <p className="text-[10px] text-muted">{s.l}</p>
                  </div>
                ))}
              </div>
              <a href="https://discord.com" target="_blank" rel="noreferrer">
                <Button size="lg">
                  <FiMessageSquare size={16} /> Join Discord
                </Button>
              </a>
            </div>
          </div>
        </section>
 
        {/* HELP */}
        <section id="help" className="py-20 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <SectionTitle
              title="Need a hand?"
              sub="Our Help Center has answers. Or reach the team directly."
            />
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/help">
                <Button variant="secondary">Visit Help Center</Button>
              </Link>
              <a href="#discord">
                <Button variant="ghost">Ask in Discord</Button>
              </a>
            </div>
          </div>
        </section>
 
        {/* FAQ */}
        <section id="faq" className="py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Frequently asked questions" />
            <div className="space-y-3">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>
 
        {/* FINAL CTA */}
        <section className="py-24 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-6xl font-bold text-white font-display leading-[1.05]">
              Your profile. Your identity.{' '}
              <span className="text-gradient">Your space.</span>
            </h2>
            <p className="text-sm sm:text-base text-muted mt-6 max-w-xl mx-auto">
              {user
                ? 'Welcome back — jump into your dashboard.'
                : 'Claim your username before someone else does.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Button size="lg" onClick={handlePrimaryCTA}>
                {user ? 'Go to Dashboard' : 'Sign Up for Free'} <FiArrowRight size={16} />
              </Button>
              <a href="#pricing">
                <Button variant="secondary" size="lg">
                  View Pricing
                </Button>
              </a>
            </div>
          </div>
        </section>
 
        <Footer />
      </div>
    </div>
  );
}