import { ArrowRight, MapPin, Navigation } from 'lucide-react';
import { categoryById, cx, directionsUrl } from '../lib/utils.js';
import { ProviderArt, Rating, StatusBadge, VerifiedBadge } from './ui.jsx';

/** Listing card. `layout="row"` for search results, `"stack"` for home page grids. */
export default function ProviderCard({ provider, onView, layout = 'row' }) {
  const category = categoryById(provider.category);
  const row = layout === 'row';
  return (
    <article className={cx('card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lift', row && 'sm:flex-row')}>
      <ProviderArt provider={provider} className={cx('h-36 shrink-0', row && 'sm:h-auto sm:w-48 lg:w-56')} />

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{category.singular}</span>
            {provider.verified && <VerifiedBadge />}
          </div>
          <h3 className="mt-1.5 text-lg font-semibold leading-snug">
            <button type="button" onClick={() => onView(provider.id)} className="rounded text-left transition hover:text-brand-deep">
              {provider.name}
            </button>
          </h3>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <Rating value={provider.rating} count={provider.reviewCount} />
          <span className="flex items-start gap-2 text-ink-soft">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <span>
              {provider.area}, Bengaluru <span className="text-ink-muted">·</span>{' '}
              <span className="tabular-nums">{provider.distanceKm.toFixed(1)} km away</span>
            </span>
          </span>
          <StatusBadge provider={provider} />
        </div>

        <ul className="flex flex-wrap gap-1.5" aria-label="Services">
          {provider.services.slice(0, 3).map((service) => (
            <li key={service} className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-ink-soft">{service}</li>
          ))}
          {provider.services.length > 3 && (
            <li className="rounded-md px-1 py-1 text-xs font-medium text-ink-muted">+{provider.services.length - 3} more</li>
          )}
        </ul>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button type="button" onClick={() => onView(provider.id)} className="btn-primary flex-1 sm:flex-none">
            View Details
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
          <a href={directionsUrl(provider)} target="_blank" rel="noreferrer" className="btn-secondary flex-1 sm:flex-none">
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Get Directions
          </a>
        </div>
      </div>
    </article>
  );
}
