import { useEffect, useRef } from 'react';
import { BadgeCheck, BedDouble, HeartHandshake, Hospital, Microscope, Siren, Star, Stethoscope, X } from 'lucide-react';
import { cx, getStatus } from '../lib/utils.js';

export const CATEGORY_ICONS = {
  clinic: Stethoscope,
  hospital: Hospital,
  boarding: BedDouble,
  diagnostics: Microscope,
  ngo: HeartHandshake,
  emergency: Siren,
};

export function Rating({ value, count, size = 'md' }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 tabular-nums', size === 'lg' ? 'text-base' : 'text-sm')}>
      <Star className={cx('fill-sun text-sun', size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden="true" />
      <span className="font-semibold text-ink">{value.toFixed(1)}</span>
      {count != null && <span className="text-ink-muted">({count.toLocaleString('en-IN')} reviews)</span>}
    </span>
  );
}

const STATUS_TONES = {
  open: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  soon: { dot: 'bg-sun', text: 'text-amber-700' },
  closed: { dot: 'bg-ink-muted/60', text: 'text-ink-muted' },
};

export function StatusBadge({ provider, className }) {
  const status = getStatus(provider);
  const tone = STATUS_TONES[status.tone];
  return (
    <span className={cx('inline-flex items-center gap-2 text-sm font-medium', tone.text, className)}>
      <span className={cx('h-2 w-2 shrink-0 rounded-full', tone.dot)} aria-hidden="true" />
      {status.label}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-xs font-semibold text-brand-deep">
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
      Verified
    </span>
  );
}

/** Stand-in for a provider photo: a tinted panel with the category mark. Swap for <img> once photos exist. */
export function ProviderArt({ provider, className, large = false }) {
  const Icon = CATEGORY_ICONS[provider.category];
  const [from, to] = provider.art;
  return (
    <div
      className={cx('relative isolate overflow-hidden', className)}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      role="img"
      aria-label={`${provider.name} photo placeholder`}
    >
      <svg className="absolute inset-0 h-full w-full opacity-[0.16]" aria-hidden="true">
        <defs>
          <pattern id={`grid-${provider.id}`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${provider.id})`} />
      </svg>
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute -bottom-16 left-1/4 h-52 w-52 rounded-full bg-white/[0.06]" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cx('flex items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm', large ? 'h-20 w-20' : 'h-14 w-14')}>
          <Icon className={large ? 'h-9 w-9' : 'h-6 w-6'} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, intro, action, className }) {
  return (
    <div className={cx('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {intro && <p className="mt-3 text-base leading-relaxed text-ink-soft sm:text-lg">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children, labelledBy = 'modal-title' }) {
  const panelRef = useRef(null);

  // Move focus into the dialog, keep Tab inside it, and give focus back on close.
  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    panelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea')];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} tabIndex={-1} className="animate-rise relative flex max-h-[92%] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:max-w-lg sm:rounded-3xl outline-none">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <h2 id={labelledBy} className="text-xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-ink/5 hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
