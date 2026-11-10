import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronRight, CircleDashed, ListOrdered, MessageSquareText, PhoneCall, ScanSearch, Tags } from 'lucide-react';
import { cx } from '../lib/utils.js';
import { SectionHeading } from './ui.jsx';

const STEPS = [
  { icon: MessageSquareText, title: 'Tell us what you need', text: 'Describe the situation in your own words, or tap an example.', code: 'analyzePetRequest()' },
  { icon: ScanSearch, title: 'PawCare analyzes your request', text: 'It looks for urgency signs such as trouble breathing, or vomiting since morning.', code: 'calculateUrgency()' },
  { icon: Tags, title: 'We identify the right type of care', text: 'Emergency, clinic, hospital, diagnostics, ambulance, boarding or NGO.', code: 'classifyIntent()' },
  { icon: ListOrdered, title: 'Providers are ranked for your situation', text: 'Each match is scored on category, urgency fit, availability, distance and rating.', code: 'recommendProviders()' },
  { icon: PhoneCall, title: 'Take action quickly', text: 'Call, get directions or open the provider page, without searching again.', code: 'Call · Directions · Details' },
];

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function HowItWorksSection({ onTry }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Walks through the steps slowly. Stops on hover or focus, and never runs with reduced motion.
  useEffect(() => {
    if (paused || reducedMotion()) return undefined;
    const timer = setInterval(() => setActive((i) => (i + 1) % STEPS.length), 2600);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-white">
      <div className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="How PawCare works"
          title="From a worried message to the right call in five steps."
          intro="The same steps run every time, so you can see why a provider was recommended."
          action={
            <button type="button" onClick={onTry} className="btn-primary shrink-0 self-start sm:self-auto">
              Try the Assistant
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        />
        <ol
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {STEPS.map(({ icon: Icon, title, text, code }, i) => {
            const on = i === active;
            return (
              <li key={title} className="relative">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={on ? 'step' : undefined}
                  className={cx('flex h-full w-full flex-col rounded-2xl border p-5 text-left transition duration-300', on ? 'border-brand/50 bg-brand-tint/50 shadow-card' : 'border-line bg-surface hover:border-brand/30')}
                >
                  <span className="flex items-center justify-between">
                    <span className={cx('flex h-12 w-12 items-center justify-center rounded-xl transition duration-300', on ? 'bg-brand text-white' : 'bg-white text-brand-deep ring-1 ring-line')}>
                      <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="font-display text-sm font-semibold tabular-nums text-ink-muted">0{i + 1}</span>
                  </span>
                  <span className="mt-4 text-base font-semibold leading-snug text-ink">{title}</span>
                  <span className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</span>
                  <code className="mt-4 self-start rounded-md bg-white px-2 py-1 font-mono text-[11px] text-ink-muted ring-1 ring-line">{code}</code>
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="absolute -right-[18px] top-9 hidden h-4 w-4 text-ink-muted lg:block" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

const LIVE = [
  'Structured sample data for 10 Bengaluru providers',
  'Request analysis that runs in your browser with keyword rules',
  'Urgency detection and care-type classification',
  'Transparent 100-point provider ranking',
  'Open or closed status computed from opening hours',
  'Search, filters, provider pages and a booking flow (prototype, nothing is sent)',
];

const PLANNED = [
  'Real provider APIs and a managed directory',
  'Google Maps integration for routes and live travel time',
  'Live availability and wait times',
  'Real-time location instead of a chosen area',
  'LLM-based intent analysis through a server endpoint',
  'Real appointment booking with provider confirmation',
];

const LAYERS = [
  { name: 'React interface', now: 'Live' },
  { name: 'analyzeRequest()', now: 'Live' },
  { name: 'Engine', now: 'Rules engine live · LLM planned' },
  { name: 'Provider data', now: 'Sample data live · API planned' },
];

export function BuiltToScaleSection() {
  return (
    <section id="built-to-scale" className="container-page scroll-mt-20 py-16 sm:py-20">
      <SectionHeading
        eyebrow="Built to scale"
        title="A working MVP today, with clear places to plug in the real thing."
        intro="Everything marked Live works in this prototype. Everything marked Planned is not built yet."
      />

      <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Architecture layers">
        {LAYERS.map((layer, i) => (
          <li key={layer.name} className="relative rounded-2xl border border-line bg-white p-4">
            <p className="font-mono text-sm font-semibold text-ink">{layer.name}</p>
            <p className="mt-1 text-xs text-ink-muted">{layer.now}</p>
            {i < LAYERS.length - 1 && <ChevronRight className="absolute -right-[13px] top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink-muted lg:block" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            Live in this MVP
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {LIVE.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-dashed border-ink/25 bg-white/60 p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink-soft">
            <CircleDashed className="h-3.5 w-3.5" aria-hidden="true" />
            Planned, not built yet
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {PLANNED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
