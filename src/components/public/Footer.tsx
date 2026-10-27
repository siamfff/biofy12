import { Link } from 'react-router-dom';
 
const PRODUCT_LINKS = [
  { to: '/#features', label: 'Features' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#compare', label: 'Compare' },
  { to: '/leaderboard', label: 'Leaderboard', internal: true },
];
 
const RESOURCE_LINKS = [
  { to: '/#help', label: 'Help Center' },
  { to: '/#discord', label: 'Discord' },
  { to: '/#faq', label: 'FAQ' },
];
 
const BNF_LINKS = [
  { to: 'https://thebnf.cyou/#about', label: 'About BNF' },
  { to: 'https://thebnf.cyou/#projects', label: 'Our Projects' },
  { to: 'https://thebnf.cyou', label: 'Official Website' },
];
 
const LEGAL_LINKS = [
  { to: '/terms', label: 'Terms of Service' },
  { to: '/privacy', label: 'Privacy Policy' },
];
 
const LOGO_URL =
  'https://i.postimg.cc/66RGqxBR/a4fe11fa-d54e-437f-9654-ded3cbbe6315.png';
 
const colTitle = 'text-base font-semibold text-white mb-4 font-display';
const linkCls = 'text-sm text-muted hover:text-brand-soft transition';
 
export function Footer() {
  return (
    <footer className="relative border-t border-border mt-24 bg-gradient-to-b from-transparent to-brand/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Link to="/" className="flex items-center gap-2.5 group">
                <img
                  src={LOGO_URL}
                  alt="Nebula"
                  className="h-9 w-9 rounded-lg object-cover shadow-glow group-hover:scale-110 transition"
                />
                <span className="text-xl font-bold text-white font-display">
                  Nebula
                </span>
              </Link>
 
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1.5 text-xs text-white">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                System Status
              </span>
            </div>
 
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Create feature-rich, customizable and modern link-in-bio pages with Nebula.
            </p>
 
            <p className="text-xs text-muted mt-4">
              A{' '}
              <a
                href="https://thebnf.cyou"
                target="_blank"
                rel="noreferrer"
                className="text-brand-soft hover:underline font-medium"
              >
                The BNF
              </a>{' '}
              project
            </p>
          </div>
 
          {/* Links */}
          <div className="md:col-span-2">
            <h4 className={colTitle}>Product</h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.to}>
                  {l.internal ? (
                    <Link to={l.to} className={linkCls}>
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.to} className={linkCls}>
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
 
          <div className="md:col-span-2">
            <h4 className={colTitle}>Resources</h4>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((l) => (
                <li key={l.to}>
                  <a href={l.to} className={linkCls}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
 
          <div className="md:col-span-3">
            <h4 className={colTitle}>The BNF</h4>
            <ul className="space-y-2.5">
              {BNF_LINKS.map((l) => (
                <li key={l.to}>
                  <a
                    href={l.to}
                    target="_blank"
                    rel="noreferrer"
                    className={linkCls}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
 
        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted text-center sm:text-left">
            © {new Date().getFullYear()} Nebula · An{' '}
            <a
              href="https://thebnf.cyou"
              target="_blank"
              rel="noreferrer"
              className="text-brand-soft hover:underline"
            >
              The BNF
            </a>{' '}
            Product. All rights reserved.
          </p>
 
          <div className="flex flex-wrap items-center gap-5">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="text-xs text-muted hover:text-brand-soft transition">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}