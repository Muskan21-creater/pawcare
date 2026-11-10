import { ArrowRight, Building2, Check, ChevronRight, MapPin, MessageSquareText, PawPrint, PencilLine, ShieldCheck, Siren, Sparkles } from 'lucide-react';
import { CATEGORIES, USER_AREA } from '../data/providers.js';
import { categoryById, cx, getStatus } from '../lib/utils.js';
import ProviderCard from './ProviderCard.jsx';
import SearchBar from './SearchBar.jsx';
import { CATEGORY_ICONS, Rating, SectionHeading, StatusBadge } from './ui.jsx';

const HERO_CHIPS = ['clinic', 'hospital', 'boarding', 'diagnostics', 'ngo'];

export function Hero({ providers, onSearch, onCategory, onView, onAssistant }) {
  const openNearby = providers
    .filter((p) => getStatus(p).open)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <div className="absolute -left-40 -top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-52 right-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand/15 blur-3xl" aria-hidden="true" />

      <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white ring-1 ring-white/15">
            <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            Verified animal care across Bengaluru
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
            Better Care Starts With Finding the Right Place.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Discover trusted veterinary clinics, pet hospitals, boarding facilities, diagnostics and animal welfare organizations near you.
          </p>

          <div className="mt-8 max-w-3xl">
            <SearchBar onSearch={onSearch} idPrefix="hero" />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-white/60">Popular:</span>
            {HERO_CHIPS.map((id) => {
              const Icon = CATEGORY_ICONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onCategory(id)}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-medium text-white ring-1 ring-white/15 transition duration-200 hover:bg-white hover:text-ink"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {categoryById(id).short}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={onAssistant} className="group mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-semibold text-emerald-300 transition hover:text-white">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Not sure what you need? Describe the situation
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </div>

        {openNearby.length > 0 && (
          <aside className="rounded-3xl bg-white p-5 shadow-lift" aria-label="Open near you">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Open near you now</h2>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {USER_AREA}
              </span>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {openNearby.map((p) => {
                const Icon = CATEGORY_ICONS[p.category];
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => onView(p.id)} className="group flex w-full items-center gap-3 rounded-xl py-3 text-left">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand-deep">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink group-hover:text-brand-deep">{p.name}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                          <Rating value={p.rating} />
                          <span className="tabular-nums">{p.distanceKm.toFixed(1)} km</span>
                        </span>
                        <StatusBadge provider={p} className="mt-0.5 !text-xs" />
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={() => onSearch({ openNow: true, sort: 'nearest' })} className="btn-secondary mt-2 w-full">
              See everything open now
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}

export function EmergencyStrip({ providers, onEmergency }) {
  const open = providers.filter((p) => p.category === 'emergency' && getStatus(p).open).length;
  return (
    <section className="border-b border-alert/15 bg-alert-tint" aria-label="Emergency care">
      <div className="container-page flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 text-sm text-ink sm:items-center sm:text-base">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-alert text-white">
            <Siren className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>
            <strong className="font-semibold">Is it an emergency?</strong>{' '}
            {open > 0 ? `${open} emergency ${open === 1 ? 'service is' : 'services are'} open right now, including a pet ambulance.` : 'See 24-hour hospitals and pet ambulances.'}
          </span>
        </p>
        <button type="button" onClick={onEmergency} className="btn-alert shrink-0">
          Get Emergency Help
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

const VALUES = [
  { icon: ShieldCheck, title: 'Trusted Providers', text: 'Discover verified animal-care providers. We check licences and addresses before a listing earns its badge.' },
  { icon: MapPin, title: 'Find Care Near You', text: 'Search services based on your location, with distance and live opening hours on every card.' },
  { icon: MessageSquareText, title: 'Real Reviews', text: 'Make informed decisions using ratings and reviews written by other pet owners.' },
  { icon: PawPrint, title: 'Everything for Your Pet', text: 'From medical care to boarding and welfare support, in one search.' },
];

export function ValueSection() {
  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading eyebrow="Why PawCare" title="Finding good care should not take ten phone calls." intro="Compare the things that matter when your pet needs help: who is open, how far they are and what other owners say." />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="group rounded-2xl border border-line bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-tint text-brand-deep transition duration-200 group-hover:bg-brand group-hover:text-white">
              <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ServicesSection({ providers, onCategory, onBrowseAll }) {
  return (
    <section id="services" className="scroll-mt-20 border-y border-line bg-white">
      <div className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Discover services"
          title="What does your pet need today?"
          intro="Pick a category to see providers near you, sorted with open places first."
          action={
            <button type="button" onClick={onBrowseAll} className="btn-secondary shrink-0 self-start sm:self-auto">
              Explore Services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            const urgent = category.id === 'emergency';
            const count = providers.filter((p) => p.category === category.id).length;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => onCategory(category.id)}
                  className={cx(
                    'group flex h-full w-full flex-col rounded-2xl border p-6 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lift',
                    urgent ? 'border-alert/25 bg-alert-tint hover:border-alert/50' : 'border-line bg-surface hover:border-brand/40 hover:bg-white',
                  )}
                >
                  <span className="flex w-full items-start justify-between">
                    <span className={cx('flex h-12 w-12 items-center justify-center rounded-xl', urgent ? 'bg-alert text-white' : 'bg-white text-brand-deep ring-1 ring-line group-hover:bg-brand group-hover:text-white group-hover:ring-brand')}>
                      <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-xs font-medium tabular-nums text-ink-muted">{count} listed</span>
                  </span>
                  <span className="mt-5 font-display text-xl font-semibold text-ink">{category.label}</span>
                  <span className="mt-2 text-sm leading-relaxed text-ink-soft">{category.description}</span>
                  <span className={cx('mt-5 inline-flex items-center gap-1.5 text-sm font-semibold', urgent ? 'text-alert' : 'text-brand-deep')}>
                    Explore
                    <ArrowRight className="h-4 w-4 transition duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function FeaturedSection({ providers, onView, onBrowseAll }) {
  const top = [...providers].filter((p) => p.distanceKm <= 6).sort((a, b) => b.rating - a.rating).slice(0, 3);
  if (!top.length) return null;
  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading
        eyebrow={`Near ${USER_AREA}`}
        title="Highest rated within 6 km"
        action={
          <button type="button" onClick={onBrowseAll} className="btn-secondary shrink-0 self-start sm:self-auto">
            See all providers
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {top.map((p) => (
          <ProviderCard key={p.id} provider={p} onView={onView} layout="stack" />
        ))}
      </div>
    </section>
  );
}

export function AboutSection({ onFindVet }) {
  return (
    <section id="about" className="scroll-mt-20 border-y border-line bg-white">
      <div className="container-page grid gap-8 py-16 sm:py-20 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
        <div>
          <p className="eyebrow">About PawCare</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Built for the moment your pet needs someone.</h2>
        </div>
        <div>
          <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
            Animal care in Indian cities is scattered across map pins, WhatsApp groups and word of mouth. PawCare puts clinics, hospitals, boarding, diagnostics, ambulances and welfare groups in one place, with the details checked.
          </p>
          <button type="button" onClick={onFindVet} className="btn-primary mt-6">
            Find a Vet
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

const PROVIDER_BENEFITS = ['Free basic listing', 'Verified badge after a document check', 'Appointment requests sent to your phone'];

export function ProvidersSection({ onListBusiness, onCorrection }) {
  return (
    <section id="providers" className="container-page scroll-mt-20 py-16 sm:py-20">
      <div className="relative isolate overflow-hidden rounded-3xl bg-ink px-6 py-10 sm:px-12 sm:py-14">
        <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">For providers</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Run a clinic, kennel or shelter? Get found by pet owners nearby.</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {PROVIDER_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-base text-white/85">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/10">
            <button type="button" onClick={onListBusiness} className="btn-primary min-h-[52px] text-base">
              <Building2 className="h-5 w-5" aria-hidden="true" />
              List Your Business
            </button>
            <button type="button" onClick={onCorrection} className="btn min-h-[48px] bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20">
              <PencilLine className="h-4 w-4" aria-hidden="true" />
              Submit a Correction
            </button>
            <p className="text-center text-sm text-white/60">Spotted a wrong phone number or closed clinic? Tell us and we will fix the listing.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
