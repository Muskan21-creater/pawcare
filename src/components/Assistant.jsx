import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CalendarCheck, Check, ChevronDown, Info, Loader2, MapPin, Navigation, Phone, RotateCcw, ShieldAlert, Siren, Sparkles, Star } from 'lucide-react';
import { ANALYSIS_STAGES } from '../hooks/useAssistant.js';
import { SCORE_LABELS, SCORE_MAX } from '../ai/recommendProviders.js';
import { INTENTS } from '../ai/classifyIntent.js';
import { categoryById, cx, directionsUrl } from '../lib/utils.js';
import { Rating, StatusBadge } from './ui.jsx';

const EXAMPLES = [
  'My dog has been vomiting since morning. Which service should I contact?',
  'My cat needs urgent help near JP Nagar.',
  'I need a blood test and X-ray for my dog in Jayanagar.',
  'Where can my dog stay while I travel for a week?',
  'Found an injured stray puppy near Whitefield.',
];

const URGENCY_UI = {
  emergency: { icon: Siren, badge: 'bg-alert text-white' },
  urgent: { icon: AlertTriangle, badge: 'bg-amber-100 text-amber-900 ring-1 ring-amber-300' },
  routine: { icon: CalendarCheck, badge: 'bg-brand-tint text-brand-deep ring-1 ring-brand/20' },
};

const LABEL_UI = {
  'Best Match': 'bg-brand text-white',
  'Emergency Available': 'bg-alert-tint text-alert ring-1 ring-alert/30',
  'Closest Option': 'bg-ink text-white',
  'Highly Rated': 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
};

const telHref = (provider) => `tel:${provider.phone.replace(/\s/g, '')}`;

export function UrgencyBadge({ level, label }) {
  const { icon: Icon, badge } = URGENCY_UI[level];
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold', badge)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  );
}

function ScoreBreakdown({ rec }) {
  return (
    <details className="group rounded-xl bg-surface px-4 py-3 text-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span>
          How this was scored <span className="font-normal text-ink-muted">· {rec.score}/100</span>
        </span>
        <ChevronDown className="h-4 w-4 text-ink-muted transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <dl className="mt-3 flex flex-col gap-2.5">
        {Object.keys(SCORE_MAX).map((key) => (
          <div key={key}>
            <div className="flex justify-between text-xs">
              <dt className="text-ink-soft">{SCORE_LABELS[key]}</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {rec.breakdown[key].toFixed(1).replace('.0', '')} / {SCORE_MAX[key]}
              </dd>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(rec.breakdown[key] / SCORE_MAX[key]) * 100}%` }} />
            </div>
          </div>
        ))}
      </dl>
    </details>
  );
}

function Recommendation({ rec, level, onView }) {
  const p = rec.provider;
  const category = categoryById(p.category);
  const callFirst = level === 'emergency' && rec.rank === 1;
  return (
    <li className={cx('card p-5', rec.rank === 1 && 'border-brand/40 ring-1 ring-brand/20')}>
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-bold tabular-nums text-white" aria-label={`Rank ${rec.rank}`}>
          {rec.rank}
        </span>
        <div className="min-w-0 flex-1">
          {rec.labels.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-1.5" aria-label="Highlights">
              {rec.labels.map((label) => (
                <li key={label} className={cx('rounded-full px-2.5 py-0.5 text-xs font-semibold', LABEL_UI[label])}>{label}</li>
              ))}
            </ul>
          )}
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{category.singular}</p>
          <h4 className="mt-1 text-lg font-semibold leading-snug">
            <button type="button" onClick={() => onView(p.id)} className="rounded text-left transition hover:text-brand-deep">{p.name}</button>
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <Rating value={p.rating} count={p.reviewCount} />
            <span className="inline-flex items-center gap-1.5 text-ink-soft">
              <MapPin className="h-4 w-4 text-ink-muted" aria-hidden="true" />
              <span className="tabular-nums">{rec.distanceKm.toFixed(1)} km</span> · {p.area}
            </span>
            <StatusBadge provider={p} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-ink">Why this match</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {rec.reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} aria-hidden="true" />
              {reason}
            </li>
          ))}
        </ul>
        {rec.warning && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {rec.warning}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={telHref(p)} className={cx(callFirst ? 'btn-alert' : 'btn-secondary', 'min-w-[8.5rem] flex-1 sm:flex-none')}>
          <Phone className="h-4 w-4" aria-hidden="true" />
          Call Now
        </a>
        <button type="button" onClick={() => onView(p.id)} className={cx(callFirst ? 'btn-secondary' : 'btn-primary', 'min-w-[8.5rem] flex-1 sm:flex-none')}>
          View Details
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <a href={directionsUrl(p)} target="_blank" rel="noreferrer" className="btn-secondary min-w-[8.5rem] flex-1 sm:flex-none">
          <Navigation className="h-4 w-4" aria-hidden="true" />
          Get Directions
        </a>
      </div>

      <div className="mt-4">
        <ScoreBreakdown rec={rec} />
      </div>
    </li>
  );
}

function SafetyNotice({ result }) {
  const level = result.urgency.level;
  const first = result.recommendations.find((r) => r.status.open) ?? result.recommendations[0];
  if (level === 'emergency') {
    return (
      <div role="alert" className="rounded-2xl border border-alert/30 bg-alert-tint p-5">
        <p className="flex items-center gap-2 text-base font-semibold text-ink">
          <ShieldAlert className="h-5 w-5 text-alert" aria-hidden="true" />
          Contact an emergency vet now
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          What you described usually needs a vet right away. Call first so the team is ready, then travel. Do not wait for an appointment or try treatments at home unless a vet tells you to.
        </p>
        {first && (
          <a href={telHref(first.provider)} className="btn-alert mt-4 min-h-[52px] w-full !whitespace-normal py-3 text-center text-base sm:w-auto">
            <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Call {first.provider.name}<span className="whitespace-nowrap tabular-nums"> · {first.provider.phone}</span></span>
          </a>
        )}
      </div>
    );
  }
  if (level === 'urgent') {
    return (
      <p role="note" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold">Contact a vet today.</strong> If things get worse, or your pet has trouble breathing, collapses or cannot stand, treat it as an emergency and call a 24-hour hospital.
        </span>
      </p>
    );
  }
  return null;
}

function Processing({ stage }) {
  return (
    <div className="card p-6 sm:p-8" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-base font-semibold text-ink">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden="true" />
        Analysing your request
      </p>
      <ol className="mt-5 flex flex-col gap-3">
        {ANALYSIS_STAGES.map((label, i) => {
          const done = i < stage;
          const active = i === stage;
          return (
            <li key={label} className={cx('flex items-center gap-3 text-sm transition', done ? 'text-ink' : active ? 'font-semibold text-ink' : 'text-ink-muted')}>
              <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', done ? 'bg-brand text-white' : active ? 'bg-brand-tint text-brand-deep' : 'bg-surface text-ink-muted')}>
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
              {label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Idle() {
  return (
    <div className="card p-6 sm:p-8">
      <h3 className="text-xl font-semibold">What you get back</h3>
      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          ['How urgent it is', 'Emergency, urgent or routine, based on the signs you mention.'],
          ['The right type of care', 'Clinic, hospital, diagnostics, ambulance, boarding or an NGO.'],
          ['Ranked providers', 'Each with the reasons it was chosen and the score behind it.'],
        ].map(([title, text], i) => (
          <li key={title} className="rounded-xl bg-surface p-4">
            <span className="font-display text-sm font-semibold tabular-nums text-brand-deep">0{i + 1}</span>
            <p className="mt-2 text-sm font-semibold text-ink">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm font-semibold text-ink">Every provider is scored out of 100</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {Object.keys(SCORE_MAX).map((key) => (
            <li key={key} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-soft">
              {SCORE_LABELS[key]} <span className="font-semibold tabular-nums text-ink">{SCORE_MAX[key]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ResultView({ result, onView, onSeeAll, onReset, headingRef }) {
  const { urgency, context, mainIntent, recommendations } = result;
  const intentLabels = result.intents.slice(0, 2).map((i) => INTENTS[i.id].label);
  const category = categoryById(mainIntent.category);

  return (
    <div className="flex flex-col gap-4 animate-rise">
      <SafetyNotice result={result} />

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <UrgencyBadge level={urgency.level} label={urgency.label} />
          {intentLabels.map((label, i) => (
            <span key={label} className={cx('rounded-full border px-3 py-1 text-sm font-medium', i === 0 ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-soft')}>{label}</span>
          ))}
        </div>
        <h3 ref={headingRef} tabIndex={-1} className="mt-4 text-xl font-semibold leading-snug outline-none sm:text-2xl">
          {recommendations.length
            ? `Start with ${recommendations[0].provider.name}${context.pet ? ` for your ${context.pet}` : ''}.`
            : 'We could not find a matching provider.'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{urgency.rationale}</p>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-ink">What we picked up</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {[...urgency.signals.map((s) => s.label), ...result.intents.flatMap((i) => i.matched)].filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 6).map((phrase) => (
                <span key={phrase} className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-ink-soft">“{phrase}”</span>
              ))}
              {urgency.signals.length === 0 && result.intents.every((i) => i.matched.length === 0) && <span className="text-ink-muted">No specific phrases. We used a general default.</span>}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Where we looked</dt>
            <dd className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-ink-soft">
              <MapPin className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="whitespace-nowrap">{context.area}</span>
              {!context.areaDetected && <span className="text-ink-muted">(assumed, add an area to change it)</span>}
            </dd>
          </div>
        </dl>

        {result.confidence === 'low' && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-ink-soft">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
            We were not sure what kind of help you need, so we started with general vet care. Add details such as symptoms, the pet, or an area for a sharper match.
          </p>
        )}
      </div>

      {recommendations.length > 0 ? (
        <ol className="flex flex-col gap-4" aria-label="Recommended providers, best first">
          {recommendations.map((rec) => (
            <Recommendation key={rec.provider.id} rec={rec} level={urgency.level} onView={onView} />
          ))}
        </ol>
      ) : (
        <div className="card p-6 text-center text-sm text-ink-soft">Try describing the problem differently, or browse all providers.</div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => onSeeAll(result.searchPreset)} className="btn-secondary">
          See all {category.label.toLowerCase()}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onReset} className="btn-ghost text-ink-muted">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Start over
        </button>
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          {result.engine.note} {result.fellBack && 'The language-model endpoint was unavailable, so the built-in rules were used instead. '}
          PawCare does not diagnose animals and does not replace a veterinarian.
        </span>
      </p>
    </div>
  );
}

export default function AssistantSection({ assistant, onView, onSeeAll }) {
  const [draft, setDraft] = useState(assistant.text);
  const [error, setError] = useState('');
  const headingRef = useRef(null);
  const previousStatus = useRef(assistant.status);
  const running = assistant.status === 'running';

  // After a fresh analysis, move focus (and on small screens, the viewport) to the answer.
  useEffect(() => {
    if (previousStatus.current === 'running' && assistant.status === 'done') {
      headingRef.current?.focus({ preventScroll: true });
      if (window.innerWidth < 1024) headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    previousStatus.current = assistant.status;
  }, [assistant.status]);

  const submit = (text) => {
    const value = text.trim();
    if (value.length < 3) {
      setError('Describe what is happening, even in a few words.');
      return;
    }
    setError('');
    assistant.run(value);
  };

  return (
    <section id="assistant" className="container-page scroll-mt-20 py-16 sm:py-20" aria-labelledby="assistant-title">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="lg:sticky lg:top-24">
          <p className="eyebrow flex items-center gap-2">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            PawCare AI Assistant
          </p>
          <h2 id="assistant-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Not sure who to call? Just tell us what is happening.</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">Describe your pet’s situation in your own words. We work out how urgent it is, what kind of care fits, and rank nearby providers for you.</p>

          <form
            className="card mt-6 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit(draft);
            }}
          >
            <label htmlFor="assistant-input" className="text-sm font-semibold text-ink">Your situation</label>
            <textarea
              id="assistant-input"
              rows={4}
              maxLength={600}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(draft);
              }}
              placeholder="My dog has been vomiting since morning. Which service should I contact?"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'assistant-error' : 'assistant-hint'}
              className={cx('field mt-2 resize-none py-3 leading-relaxed', error && 'border-alert focus:border-alert focus:ring-alert/20')}
            />
            {error ? (
              <p id="assistant-error" role="alert" className="mt-2 text-sm font-medium text-alert">{error}</p>
            ) : (
              <p id="assistant-hint" className="mt-2 text-xs text-ink-muted">Mention your pet, symptoms and area. Ctrl or ⌘ + Enter to send.</p>
            )}
            <button type="submit" disabled={running} className="btn-primary mt-3 min-h-[52px] w-full text-base">
              {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              {running ? 'Analysing...' : 'Find the Right Care'}
            </button>
          </form>

          <div className="mt-5">
            <p className="text-sm font-semibold text-ink">Try an example</p>
            <ul className="mt-2 flex flex-col gap-2">
              {EXAMPLES.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    disabled={running}
                    onClick={() => {
                      setDraft(example);
                      setError('');
                      assistant.run(example);
                    }}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-left text-sm text-ink-soft transition hover:border-brand/50 hover:text-ink disabled:opacity-50"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            This tool points you to the right kind of care. It does not diagnose animals and is not a substitute for a veterinarian. In an emergency, call a vet immediately.
          </p>
        </div>

        <div aria-live="polite" aria-busy={running} className="min-w-0">
          {assistant.status === 'idle' && <Idle />}
          {running && <Processing stage={assistant.stage} />}
          {assistant.status === 'error' && (
            <div role="alert" className="card flex flex-col items-start gap-3 p-6">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <AlertTriangle className="h-5 w-5 text-alert" aria-hidden="true" />
                {assistant.error?.code ? 'We need a little more to go on' : 'Something went wrong'}
              </p>
              <p className="text-sm text-ink-soft">{assistant.error?.code ? assistant.error.message : 'We could not analyse that request. Please try again.'}</p>
              <button type="button" onClick={() => submit(draft)} className="btn-primary">Try again</button>
            </div>
          )}
          {assistant.status === 'done' && assistant.result && (
            <ResultView
              result={assistant.result}
              headingRef={headingRef}
              onView={onView}
              onSeeAll={onSeeAll}
              onReset={() => {
                assistant.reset();
                setDraft('');
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
