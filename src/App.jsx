import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProvider, useProviderSearch } from './api/providers.js';
import AssistantSection from './components/Assistant.jsx';
import Footer from './components/Footer.jsx';
import { AboutSection, EmergencyStrip, FeaturedSection, Hero, ProvidersSection, ServicesSection, ValueSection } from './components/HomeSections.jsx';
import { BookingModal, FormModal } from './components/Modals.jsx';
import Navbar from './components/Navbar.jsx';
import ProviderDetail from './components/ProviderDetail.jsx';
import { BuiltToScaleSection, HowItWorksSection } from './components/SystemSections.jsx';
import ResultsPage from './components/ResultsPage.jsx';
import { useAssistant } from './hooks/useAssistant.js';
import { DEFAULT_QUERY } from './lib/utils.js';

const BACK_LABELS = { results: 'Back to results', assistant: 'Back to your recommendations', home: 'Back to home' };

// Three views, addressed by a plain hash so each one can be linked to:
//   (none) = home, #find-care = results, #p-<id> = provider page.
function parseRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'find-care') return { name: 'results' };
  if (hash.startsWith('p-')) return { name: 'provider', id: hash.slice(2) };
  return { name: 'home' };
}

function useRoute() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const onChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const navigate = useCallback((hash) => {
    if (window.location.hash.replace(/^#/, '') !== hash) window.location.hash = hash;
    window.scrollTo(0, 0);
  }, []);
  return [route, navigate];
}

function ProviderRoute({ id, onBack, onModal, backLabel }) {
  const { loading, provider } = useProvider(id);
  if (loading) return <div className="container-page min-h-[60vh] py-10" aria-busy="true" />;
  if (!provider) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold">We could not find that provider</h1>
        <p className="mt-2 text-ink-soft">The listing may have been removed.</p>
        <button type="button" onClick={onBack} className="btn-primary mt-6">Browse all providers</button>
      </div>
    );
  }
  return (
    <ProviderDetail
      provider={provider}
      onBack={onBack}
      backLabel={backLabel}
      onBook={() => onModal({ kind: 'booking', provider })}
      onCorrection={() => onModal({ kind: 'correction', initial: { provider: provider.name } })}
    />
  );
}

export default function App() {
  const [route, navigate] = useRoute();
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [modal, setModal] = useState(null);
  const [origin, setOrigin] = useState('results'); // where the provider page was opened from
  const assistant = useAssistant();
  const mainRef = useRef(null);
  const search = useProviderSearch(query);
  const everything = useProviderSearch(DEFAULT_QUERY); // home page sections show the full directory

  const actions = useMemo(() => {
    /** Start a fresh search from anywhere in the app. */
    const startSearch = (partial = {}) => {
      setQuery({ ...DEFAULT_QUERY, ...partial });
      navigate('find-care');
    };
    return {
      startSearch,
      goHome: () => navigate(''),
      browseAll: () => startSearch(),
      browseCategory: (category) => startSearch({ category }),
      findVet: () => startSearch({ category: 'clinic' }),
      emergency: () => startSearch({ category: 'emergency', openNow: true, sort: 'nearest' }),
      viewProvider: (id, from = 'results') => {
        setOrigin(from);
        navigate(`p-${id}`);
      },
      goBackFrom: (from) => {
        if (from === 'assistant') {
          navigate('');
          setTimeout(() => document.getElementById('assistant')?.scrollIntoView({ block: 'start' }), 60);
        } else if (from === 'home') navigate('');
        else navigate('find-care');
      },
      goToSection: (id) => {
        navigate('');
        // Wait for the home page to mount before scrolling to the section.
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      },
      signIn: () => setModal({ kind: 'signin' }),
      listBusiness: () => setModal({ kind: 'list' }),
      correction: (initial) => setModal({ kind: 'correction', initial }),
    };
  }, [navigate]);

  const viewFrom = (from) => (id) => actions.viewProvider(id, from);

  const closeModal = useCallback(() => setModal(null), []);

  return (
    <div className="flex min-h-screen flex-col">
      <button type="button" onClick={() => mainRef.current?.focus()} className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-ink shadow-lift focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to main content
      </button>
      <Navbar route={route} actions={actions} />

      <main ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        {route.name === 'home' && (
          <>
            <Hero providers={everything.results} onSearch={actions.startSearch} onCategory={actions.browseCategory} onView={viewFrom('home')} onAssistant={() => actions.goToSection('assistant')} />
            <EmergencyStrip providers={everything.results} onEmergency={actions.emergency} />
            <AssistantSection assistant={assistant} onView={viewFrom('assistant')} onSeeAll={(preset) => actions.startSearch(preset)} />
            <ValueSection />
            <ServicesSection providers={everything.results} onCategory={actions.browseCategory} onBrowseAll={actions.browseAll} />
            <FeaturedSection providers={everything.results} onView={viewFrom('home')} onBrowseAll={actions.browseAll} />
            <HowItWorksSection onTry={() => actions.goToSection('assistant')} />
            <BuiltToScaleSection />
            <AboutSection onFindVet={actions.findVet} />
            <ProvidersSection onListBusiness={actions.listBusiness} onCorrection={() => actions.correction()} />
          </>
        )}

        {route.name === 'results' && (
          <ResultsPage
            query={query}
            results={search.results}
            loading={search.loading}
            onChange={(partial) => setQuery((q) => ({ ...q, ...partial }))}
            onReset={() => setQuery(DEFAULT_QUERY)}
            onView={viewFrom('results')}
          />
        )}

        {route.name === 'provider' && <ProviderRoute id={route.id} onBack={() => actions.goBackFrom(origin)} backLabel={BACK_LABELS[origin]} onModal={setModal} />}
      </main>

      <Footer actions={actions} />
      {route.name === 'provider' && <div className="h-[68px] bg-ink lg:hidden" aria-hidden="true" />}

      {modal?.kind === 'booking' && <BookingModal provider={modal.provider} onClose={closeModal} />}
      {modal && modal.kind !== 'booking' && <FormModal key={modal.kind} kind={modal.kind} initial={modal.initial} onClose={closeModal} />}
    </div>
  );
}
