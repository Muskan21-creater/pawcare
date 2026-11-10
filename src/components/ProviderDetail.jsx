import { ArrowLeft, CalendarCheck, Check, Clock, Mail, MapPin, Navigation, PencilLine, Phone, Star } from 'lucide-react';
import { USER_AREA } from '../data/providers.js';
import { categoryById, cx, DAY_NAMES, directionsUrl, formatRange } from '../lib/utils.js';
import { ProviderArt, Rating, StatusBadge, VerifiedBadge } from './ui.jsx';

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

function MapPlaceholder({ provider }) {
  const [x, y] = provider.pin;
  return (
    <div className="relative h-56 overflow-hidden rounded-2xl border border-line bg-[#E9EEE8]" role="img" aria-label={`Map preview showing ${provider.name} in ${provider.area}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect x="250" y="20" width="110" height="70" rx="10" fill="#D5E6D3" />
        <rect x="30" y="140" width="90" height="60" rx="10" fill="#D5E6D3" />
        <path d="M-10 190 C80 150 120 175 200 130 S330 70 420 60" fill="none" stroke="#C7DCE8" strokeWidth="16" />
        <g stroke="white" strokeLinecap="round" fill="none">
          <path d="M-10 70 H420" strokeWidth="10" />
          <path d="M-10 150 H420" strokeWidth="7" />
          <path d="M90 -10 V230" strokeWidth="7" />
          <path d="M210 -10 V230" strokeWidth="10" />
          <path d="M320 -10 V230" strokeWidth="6" />
          <path d="M-10 20 L420 200" strokeWidth="5" />
        </g>
      </svg>
      <div className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${x}%`, top: `${y}%` }}>
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lift ring-4 ring-white">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-medium text-ink-soft shadow-card">
        Map preview · {provider.distanceKm.toFixed(1)} km from {USER_AREA}
      </span>
    </div>
  );
}

function ActionButtons({ provider, onBook, stacked = false, compact = false }) {
  const category = categoryById(provider.category);
  const urgent = provider.category === 'emergency';
  const call = (
    <a key="call" href={`tel:${provider.phone.replace(/\s/g, '')}`} className={cx(urgent ? 'btn-alert' : 'btn-secondary', stacked && urgent && 'min-h-[52px] text-base')}>
      <Phone className="h-4 w-4" aria-hidden="true" />
      {compact ? 'Call' : 'Call Now'}
    </a>
  );
  const book = (
    <button key="book" type="button" onClick={onBook} className={cx(urgent ? 'btn-secondary' : 'btn-primary', stacked && !urgent && 'min-h-[52px] text-base')}>
      <CalendarCheck className="h-4 w-4" aria-hidden="true" />
      {category.action}
    </button>
  );
  const directions = (
    <a key="dir" href={directionsUrl(provider)} target="_blank" rel="noreferrer" className="btn-secondary">
      <Navigation className="h-4 w-4" aria-hidden="true" />
      {compact ? 'Directions' : 'Get Directions'}
    </a>
  );
  // In an emergency the phone call is the fastest route to help, so it leads.
  return urgent ? [call, directions, book] : [book, call, directions];
}

export default function ProviderDetail({ provider, onBack, onBook, onCorrection, backLabel = 'Back to results' }) {
  const category = categoryById(provider.category);
  const today = new Date().getDay();

  return (
    <div className="container-page pb-28 pt-5 sm:pt-6 lg:pb-16">
      <button type="button" onClick={onBack} className="btn-ghost -ml-3">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </button>

      <ProviderArt provider={provider} large className="mt-3 h-44 rounded-3xl sm:h-64" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <div className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{category.singular}</span>
              {provider.verified && <VerifiedBadge />}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{provider.name}</h1>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              <Rating value={provider.rating} count={provider.reviewCount} size="lg" />
              <StatusBadge provider={provider} />
            </div>
            <p className="mt-3 flex items-start gap-2 text-ink-soft">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <span>
                {provider.address} <span className="whitespace-nowrap text-ink-muted">· {provider.distanceKm.toFixed(1)} km away</span>
              </span>
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {provider.highlights.map((h) => (
                <li key={h} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-soft">{h}</li>
              ))}
            </ul>
          </header>

          <section className="mt-10" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-xl font-semibold">About</h2>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-ink-soft">{provider.about}</p>
          </section>

          <section className="mt-10" aria-labelledby="services-heading">
            <h2 id="services-heading" className="text-xl font-semibold">Services offered</h2>
            <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {provider.services.map((service) => (
                <li key={service} className="flex items-center gap-3 text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-deep">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {service}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10" aria-labelledby="location-heading">
            <h2 id="location-heading" className="text-xl font-semibold">Location</h2>
            <div className="mt-4">
              <MapPlaceholder provider={provider} />
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-soft">{provider.address}</p>
              <a href={directionsUrl(provider)} target="_blank" rel="noreferrer" className="btn-secondary shrink-0">
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get Directions
              </a>
            </div>
          </section>

          <section className="mt-10" aria-labelledby="reviews-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="reviews-heading" className="text-xl font-semibold">Reviews</h2>
              <Rating value={provider.rating} count={provider.reviewCount} />
            </div>
            <ul className="mt-4 flex flex-col gap-4">
              {provider.reviews.map((review) => (
                <li key={review.author} className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-sm font-semibold text-white">{review.author[0]}</span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{review.author}</p>
                        <p className="text-xs text-ink-muted">{review.pet} · {review.date}</p>
                      </div>
                    </div>
                    <span className="flex shrink-0 gap-0.5" aria-label={`${review.rating} out of 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={cx('h-4 w-4', n <= review.rating ? 'fill-sun text-sun' : 'fill-line text-line')} aria-hidden="true" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{review.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="hidden flex-col gap-2.5 lg:flex">
              <ActionButtons provider={provider} onBook={onBook} stacked />
            </div>

            <div className="lg:mt-6 lg:border-t lg:border-line lg:pt-5">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Clock className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                Opening hours
              </h2>
              <dl className="mt-3 flex flex-col text-sm">
                {WEEK_ORDER.map((d) => (
                  <div key={d} className={cx('flex justify-between gap-4 rounded-lg px-2.5 py-1.5', d === today && 'bg-brand-tint font-semibold text-ink')}>
                    <dt>{DAY_NAMES[d]}{d === today && <span className="font-normal text-brand-deep"> · today</span>}</dt>
                    <dd className={cx('tabular-nums', !provider.hours[d] && 'text-ink-muted')}>{formatRange(provider.hours[d])}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <h2 className="text-base font-semibold">Contact</h2>
              <ul className="mt-3 flex flex-col gap-2.5 text-sm">
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                  <a href={`tel:${provider.phone.replace(/\s/g, '')}`} className="font-semibold tabular-nums text-ink hover:text-brand-deep">{provider.phone}</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                  <span className="break-all text-ink-soft">{provider.email}</span>
                </li>
              </ul>
            </div>
          </div>

          <button type="button" onClick={onCorrection} className="btn-ghost mt-3 w-full text-ink-muted">
            <PencilLine className="h-4 w-4" aria-hidden="true" />
            Something wrong? Submit a Correction
          </button>
        </aside>
      </div>

      {/* Mobile and tablet: actions stay within thumb reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-[1.7fr_1fr_1.15fr] gap-2 [&>*]:min-w-0 [&>*]:gap-1.5 [&>*]:px-2 [&>*]:text-[13px]">
          <ActionButtons provider={provider} onBook={onBook} compact />
        </div>
      </div>
    </div>
  );
}
