import { useState } from 'react';
import { Menu, PawPrint, Stethoscope, X } from 'lucide-react';
import { cx } from '../lib/utils.js';

export function Logo({ onClick, light = false }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 rounded-lg" aria-label="PawCare home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
        <PawPrint className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className={cx('font-display text-xl font-bold tracking-tight', light ? 'text-white' : 'text-ink')}>PawCare</span>
    </button>
  );
}

export default function Navbar({ route, actions }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { label: 'Find Care', onClick: actions.browseAll, active: route.name !== 'home' },
    { label: 'AI Assistant', onClick: () => actions.goToSection('assistant') },
    { label: 'Services', onClick: () => actions.goToSection('services') },
    { label: 'For Providers', onClick: () => actions.goToSection('providers') },
    { label: 'About', onClick: () => actions.goToSection('about') },
  ];
  const run = (fn) => () => {
    setMenuOpen(false);
    fn();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo onClick={run(actions.goHome)} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={link.onClick}
              className={cx('rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-ink/5 hover:text-ink', link.active ? 'text-ink' : 'text-ink-soft')}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={actions.signIn} className="btn-ghost hidden md:inline-flex">Sign In</button>
          <button type="button" onClick={run(actions.findVet)} className="btn-primary">
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
            Find a Vet
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-ink transition hover:bg-ink/5 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="animate-rise border-t border-line bg-white md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col py-3">
            {links.map((link) => (
              <button key={link.label} type="button" onClick={run(link.onClick)} className="flex min-h-[48px] items-center rounded-lg px-2 text-left text-base font-medium text-ink hover:bg-ink/5">
                {link.label}
              </button>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-4">
              <button type="button" onClick={run(actions.signIn)} className="btn-secondary">Sign In</button>
              <button type="button" onClick={run(actions.listBusiness)} className="btn-secondary">List Your Business</button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
