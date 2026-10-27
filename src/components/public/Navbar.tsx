import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../services/authService';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiGrid,
  FiChevronDown,
} from 'react-icons/fi';
 
const SECTION_NAV = [
  { id: 'features', label: 'Features' },
  { id: 'compare', label: 'Compare' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'discord', label: 'Discord' },
  { id: 'help', label: 'Help Center' },
];
 
const LOGO_URL = 'https://i.postimg.cc/66RGqxBR/a4fe11fa-d54e-437f-9654-ded3cbbe6315.png';
 
const SCROLL_OFFSET = 110;
 
export function Navbar() {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
 
  const isHome = location.pathname === '/';
 
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
 
  useEffect(() => {
    if (!isHome) {
      setActiveSection('');
      return;
    }
 
    const sectionIds = SECTION_NAV.map((s) => s.id);
 
    const handleScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let current = '';
 
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (mid >= top && mid < bottom) {
          current = id;
          break;
        }
      }
 
      const firstEl = document.getElementById(sectionIds[0]);
      if (firstEl && mid < firstEl.offsetTop) {
        current = '';
      }
 
      setActiveSection(current);
    };
 
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isHome]);
 
  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };
 
  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    const go = () => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };
    if (!isHome) {
      navigate('/');
      setTimeout(go, 100);
    } else {
      go();
    }
  };
 
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  };
 
  const homeActive = isHome && activeSection === '';
 
  const linkClass = (active: boolean) =>
    cn(
      'px-3 py-2 rounded-full text-[13px] font-medium transition whitespace-nowrap',
      active
        ? 'text-white bg-brand/20'
        : 'text-muted hover:text-white hover:bg-white/5',
    );
 
  return (
    <>
      <header className="fixed top-4 inset-x-0 z-50 px-3 sm:px-6">
        {/* Floating pill */}
        <div className="mx-auto max-w-6xl h-14 rounded-full border border-brand/25 bg-[#14091f]/60 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(168,85,247,0.4)] pl-4 pr-2 flex items-center justify-between gap-3">
          {/* Logo */}
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <img
              src={LOGO_URL}
              alt="Nebula"
              className="h-8 w-8 rounded-lg object-cover shadow-glow group-hover:scale-110 transition-all"
            />
            <span className="text-lg font-bold text-white font-display hidden sm:block">
              Nebula
            </span>
          </button>
 
          {/* Links */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <button onClick={handleHomeClick} className={linkClass(homeActive)}>
              Home
            </button>
            {SECTION_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={linkClass(isHome && activeSection === item.id)}
              >
                {item.label}
              </button>
            ))}
            <Link to="/leaderboard" className={linkClass(location.pathname === '/leaderboard')}>
              Leaderboard
            </Link>
          </nav>
 
          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 hover:border-brand/60 hover:bg-brand/15 pl-1 pr-3 py-1 transition"
                >
                  <img
                    src={
                      profile?.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'U'}`
                    }
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-white font-medium hidden sm:block max-w-[110px] truncate">
                    {profile?.displayName || 'User'}
                  </span>
                  <FiChevronDown size={14} className="text-muted" />
                </button>
 
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl shadow-card overflow-hidden animate-slide-up glass-strong">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-white truncate">
                        {profile?.displayName || 'User'}
                      </p>
                      <p className="text-[11px] text-muted truncate">
                        @{profile?.username || '—'}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white hover:bg-brand/15"
                      >
                        <FiGrid size={14} /> Dashboard
                      </Link>
                      <Link
                        to="/dashboard/customize"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted hover:text-white hover:bg-brand/15"
                      >
                        <FiUser size={14} /> My profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted hover:text-danger hover:bg-danger/10"
                      >
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="rounded-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
 
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-full hover:bg-white/5 text-muted hover:text-white"
              aria-label="Menu"
            >
              {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>
 
        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden mx-auto max-w-6xl mt-2 rounded-3xl glass-strong animate-fade-in">
            <nav className="p-3 space-y-1">
              <button
                onClick={handleHomeClick}
                className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-brand/10"
              >
                Home
              </button>
              {SECTION_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-brand/10"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/leaderboard"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-brand/10"
              >
                Leaderboard
              </Link>
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-brand/10"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
 
      {/* Spacer, because the navbar is fixed (floating) */}
      <div aria-hidden className="h-20" />
    </>
  );
}