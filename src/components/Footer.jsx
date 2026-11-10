import { CATEGORIES } from '../data/providers.js';
import { Logo } from './Navbar.jsx';

function FooterLink({ onClick, children }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="rounded py-1 text-left text-sm text-white/70 transition hover:text-white">
        {children}
      </button>
    </li>
  );
}

export default function Footer({ actions }) {
  return (
    <footer className="bg-ink">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light onClick={actions.goHome} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">Trusted animal care, found fast. Starting in Bengaluru.</p>
        </div>
        <nav aria-label="Find care">
          <h2 className="font-sans text-sm font-semibold text-white">Find care</h2>
          <ul className="mt-3 flex flex-col gap-1">
            {CATEGORIES.map((c) => (
              <FooterLink key={c.id} onClick={() => actions.browseCategory(c.id)}>{c.label}</FooterLink>
            ))}
          </ul>
        </nav>
        <nav aria-label="For providers">
          <h2 className="font-sans text-sm font-semibold text-white">For providers</h2>
          <ul className="mt-3 flex flex-col gap-1">
            <FooterLink onClick={actions.listBusiness}>List Your Business</FooterLink>
            <FooterLink onClick={() => actions.correction()}>Submit a Correction</FooterLink>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="font-sans text-sm font-semibold text-white">PawCare</h2>
          <ul className="mt-3 flex flex-col gap-1">
            <FooterLink onClick={() => actions.goToSection('about')}>About</FooterLink>
            <FooterLink onClick={() => actions.goToSection('services')}>Services</FooterLink>
            <FooterLink onClick={actions.signIn}>Sign In</FooterLink>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-xs leading-relaxed text-white/50">
          MVP prototype with sample data. Providers, reviews and phone numbers shown here are illustrative.
        </p>
      </div>
    </footer>
  );
}
