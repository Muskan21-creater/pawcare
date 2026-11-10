import { useMemo, useState } from 'react';
import { CalendarCheck, CircleCheck, Phone } from 'lucide-react';
import { CATEGORIES } from '../data/providers.js';
import { categoryById, cx, DAY_NAMES, formatTime } from '../lib/utils.js';
import { Modal } from './ui.jsx';

function Success({ title, children, onClose }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-brand-deep">
        <CircleCheck className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <div className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{children}</div>
      <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted">Prototype: nothing was sent. In the live product this step calls the API.</p>
      <button type="button" onClick={onClose} className="btn-primary mt-6 w-full sm:w-auto sm:px-8">Done</button>
    </div>
  );
}

/** Next few days the provider is open, each with bookable start times. */
function buildSlots(provider) {
  const now = new Date();
  const days = [];
  for (let offset = 0; offset < 10 && days.length < 5; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const range = provider.hours[date.getDay()];
    if (!range) continue;
    const earliest = offset === 0 ? now.getHours() * 60 + now.getMinutes() + 45 : 0;
    const start = provider.open24 ? 540 : range[0];
    const end = provider.open24 ? 1260 : range[1];
    const times = [];
    for (let t = start; t <= end - 30; t += 60) if (t >= earliest) times.push(t);
    if (!times.length) continue;
    const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : DAY_NAMES[date.getDay()].slice(0, 3);
    days.push({ key: date.toDateString(), label, date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), times: times.slice(0, 9) });
  }
  return days;
}

export function BookingModal({ provider, onClose }) {
  const days = useMemo(() => buildSlots(provider), [provider]);
  const [dayKey, setDayKey] = useState(days[0]?.key);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ pet: '', phone: '' });
  const [done, setDone] = useState(false);
  const day = days.find((d) => d.key === dayKey);
  const category = categoryById(provider.category);
  const ready = day && time != null && form.pet.trim() && /^\d{10}$/.test(form.phone);

  const submit = (e) => {
    e.preventDefault();
    if (ready) setDone(true);
  };

  return (
    <Modal open onClose={onClose} title={done ? 'Request ready' : category.action}>
      {done ? (
        <Success title={`${day.label}, ${day.date} at ${formatTime(time)}`} onClose={onClose}>
          {provider.name} would confirm {form.pet.trim()}’s slot by SMS on {form.phone}.
        </Success>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <p className="text-sm text-ink-soft">
            at <span className="font-semibold text-ink">{provider.name}</span>, {provider.area}
          </p>

          {provider.category === 'emergency' && (
            <p className="flex items-start gap-3 rounded-xl bg-alert-tint p-3 text-sm text-ink">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-alert" aria-hidden="true" />
              <span>For an emergency, call <strong className="tabular-nums">{provider.phone}</strong> instead. Bookings are for follow-up visits.</span>
            </p>
          )}

          <fieldset>
            <legend className="text-sm font-semibold text-ink">Choose a day</legend>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {days.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  aria-pressed={d.key === dayKey}
                  onClick={() => {
                    setDayKey(d.key);
                    setTime(null);
                  }}
                  className={cx('flex min-w-[76px] flex-col items-center rounded-xl border px-3 py-2 transition', d.key === dayKey ? 'border-brand bg-brand-tint text-brand-deep' : 'border-line bg-white text-ink-soft hover:border-brand/50')}
                >
                  <span className="text-sm font-semibold">{d.label}</span>
                  <span className="text-xs">{d.date}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">Choose a time</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {day?.times.map((t) => (
                <button key={t} type="button" aria-pressed={t === time} onClick={() => setTime(t)} className={cx('min-h-[44px] rounded-xl border text-sm font-medium tabular-nums transition', t === time ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:border-brand/50')}>
                  {formatTime(t)}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor="book-pet" className="text-sm font-semibold text-ink">
              Pet’s name
              <input id="book-pet" className="field mt-1.5 font-normal" value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} placeholder="Bruno" autoComplete="off" />
            </label>
            <label htmlFor="book-phone" className="text-sm font-semibold text-ink">
              Your mobile number
              <input id="book-phone" className="field mt-1.5 font-normal tabular-nums" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} placeholder="10-digit number" autoComplete="tel-national" />
            </label>
          </div>

          <button type="submit" disabled={!ready} className="btn-primary min-h-[52px] text-base">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            {time != null ? `Request ${formatTime(time)}` : 'Pick a time to continue'}
          </button>
        </form>
      )}
    </Modal>
  );
}

const FORMS = {
  list: {
    title: 'List Your Business',
    intro: 'Tell us about your practice. Our team calls within two working days to verify the details.',
    submit: 'Submit Listing',
    successTitle: 'Thanks, we have what we need',
    success: (v) => `We would call ${v.phone} to verify ${v.name} before it goes live.`,
    fields: [
      { id: 'name', label: 'Business name', placeholder: 'Happy Paws Veterinary Clinic' },
      { id: 'category', label: 'Category', options: CATEGORIES.map((c) => c.singular) },
      { id: 'area', label: 'Neighbourhood', placeholder: 'JP Nagar' },
      { id: 'phone', label: 'Contact number', placeholder: '10-digit number', numeric: true },
    ],
  },
  correction: {
    title: 'Submit a Correction',
    intro: 'Wrong hours, a new phone number or a clinic that has closed? Corrections keep listings trustworthy.',
    submit: 'Send Correction',
    successTitle: 'Correction noted',
    success: (v) => `Our team would review your note about ${v.provider} and update the listing.`,
    fields: [
      { id: 'provider', label: 'Which listing?', placeholder: 'Provider name' },
      { id: 'issue', label: 'What is wrong?', options: ['Opening hours', 'Phone number', 'Address or map pin', 'Permanently closed', 'Services listed', 'Something else'] },
      { id: 'details', label: 'What should it say?', placeholder: 'For example: closes at 8 pm on Saturdays', multiline: true },
    ],
  },
  signin: {
    title: 'Sign in to PawCare',
    intro: 'Save providers, keep your pet’s records and track appointment requests.',
    submit: 'Send OTP',
    successTitle: 'Check your phone',
    success: (v) => `A one-time password would be sent to ${v.phone}.`,
    fields: [{ id: 'phone', label: 'Mobile number', placeholder: '10-digit number', numeric: true }],
  },
};

export function FormModal({ kind, initial = {}, onClose }) {
  const config = FORMS[kind];
  const [values, setValues] = useState(() => Object.fromEntries(config.fields.map((f) => [f.id, initial[f.id] ?? (f.options ? f.options[0] : '')])));
  const [done, setDone] = useState(false);
  const valid = config.fields.every((f) => (f.numeric ? /^\d{10}$/.test(values[f.id]) : String(values[f.id]).trim()));
  const set = (id, value) => setValues((v) => ({ ...v, [id]: value }));

  return (
    <Modal open onClose={onClose} title={config.title}>
      {done ? (
        <Success title={config.successTitle} onClose={onClose}>{config.success(values)}</Success>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) setDone(true);
          }}
        >
          <p className="text-sm leading-relaxed text-ink-soft">{config.intro}</p>
          {config.fields.map((f) => {
            const id = `${kind}-${f.id}`;
            return (
              <label key={f.id} htmlFor={id} className="text-sm font-semibold text-ink">
                {f.label}
                {f.options ? (
                  <select id={id} className="field mt-1.5 font-normal" value={values[f.id]} onChange={(e) => set(f.id, e.target.value)}>
                    {f.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : f.multiline ? (
                  <textarea id={id} rows={3} className="field mt-1.5 py-2.5 font-normal" value={values[f.id]} onChange={(e) => set(f.id, e.target.value)} placeholder={f.placeholder} />
                ) : (
                  <input
                    id={id}
                    className={cx('field mt-1.5 font-normal', f.numeric && 'tabular-nums')}
                    value={values[f.id]}
                    onChange={(e) => set(f.id, f.numeric ? e.target.value.replace(/\D/g, '') : e.target.value)}
                    placeholder={f.placeholder}
                    inputMode={f.numeric ? 'numeric' : undefined}
                    maxLength={f.numeric ? 10 : undefined}
                    autoComplete="off"
                  />
                )}
              </label>
            );
          })}
          <button type="submit" disabled={!valid} className="btn-primary mt-1 min-h-[52px] text-base">{config.submit}</button>
        </form>
      )}
    </Modal>
  );
}
