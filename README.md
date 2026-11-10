# PawCare

An animal-care discovery platform for pet owners in Bengaluru. Find veterinary clinics, animal hospitals, boarding, diagnostics, ambulances and animal welfare NGOs, or describe a situation in plain language and get ranked recommendations.

> MVP prototype. All providers, reviews and phone numbers are sample data.

## Problem

When a pet is unwell, owners do not know which kind of provider to call, who is open, or who is close. Information is scattered across map pins and WhatsApp groups. PawCare answers three questions quickly: what kind of care is needed, how urgent is it, and who should I contact.

## Features

**Current MVP**
- Search by service and neighbourhood, category chips, filters (category, rating, distance, neighbourhood, open now) and sorting
- Provider pages with hours, services, reviews, map placeholder, call, directions and booking request flow
- **PawCare AI Assistant**: describe a situation, get urgency, care type and ranked providers with reasons
- Emergency path, List Your Business and Submit a Correction flows
- Responsive layout, keyboard-accessible modals, skip link, error boundary, loading and empty states

**The "AI" is a rules engine.** No language model is used by default. It is deterministic keyword analysis and scoring that runs in the browser, makes no network calls and needs no API key. The UI says so on every result.

## Intelligent request-analysis workflow

```
user message
  → analyzeRequest()        engine: intents + urgency + context (swappable)
      classifyIntent()      emergency, ambulance, hospital, diagnostics, consult, boarding, ngo
      calculateUrgency()    emergency | urgent | routine
      extractContext()      pet type and neighbourhood
  → recommendProviders()    match by category, then rank
  → recommendations         labels, reasons, score breakdown, actions
```

Safety behaviour: the assistant never names a condition or gives treatment advice. Urgency is decided from phrases the owner used (for example "not breathing", "collapsed", "vomiting since morning"). Emergencies show a call-now banner. Every result carries a disclaimer that PawCare does not diagnose and does not replace a veterinarian.

## Provider recommendation algorithm

Each provider gets up to 100 points, and the breakdown is shown in the UI under "How this was scored".

| Component | Max | Logic |
|---|---|---|
| Category match | 40 | Provider type vs the main intent (runner-up intent counts at 60%) |
| Urgency fit | 20 | 24-hour and ICU capability for emergencies, clinics for urgent, verified status for routine |
| Availability | 15 | Open 24h = 15, open = 12, closing within an hour = 6, closed = 0 (3 for routine) |
| Distance | 15 | Linear falloff over 10 km (emergency), 15 km (urgent) or 25 km (routine) |
| Rating | 10 | 3.5 stars scores 0, 4.8 stars scores full marks |

For emergency and urgent requests, open providers always rank above closed ones. Labels: **Best Match**, **Emergency Available**, **Closest Option**, **Highly Rated**. The sample data stores distance from JP Nagar; for other areas the distance is an estimate from neighbourhood centres.

## Technology stack

React 18, Vite 5, Tailwind CSS 3, Lucide React. No backend, no database. Fonts: Bricolage Grotesque and DM Sans.

## Architecture

```
src/
  ai/
    analyzePetRequest.js     orchestrates the workflow, returns result + trace
    analyzeRequest.js        engine selector (local or remote) with fallback
    classifyIntent.js        intent rules
    calculateUrgency.js      urgency rules
    extractContext.js        pet and area
    signals.js               shared phrase patterns
    recommendProviders.js    scoring and ranking
    engines/localEngine.js   default rules engine
    engines/remoteEngine.js  calls a server endpoint that wraps an LLM
  api/providers.js           data access layer (swap for fetch calls)
  data/providers.js          categories, areas, 10 sample providers
  hooks/useAssistant.js      assistant state kept at app level
  components/                UI (Assistant, SystemSections, ResultsPage, ProviderDetail, ...)
server/analyze.openai.example.js   optional LLM endpoint template (not deployed)
```

Only understanding the request is swappable. Matching and ranking always run locally, so recommendations stay explainable even with an LLM.

## Run locally

```bash
npm install
npm run dev
npm run build     # outputs dist/
```

No environment variables are needed. It deploys to Vercel as a standard Vite project.

## Optional: use an LLM

1. Copy `server/analyze.openai.example.js` to `api/analyze.js`
2. Set `OPENAI_API_KEY` in your host's environment (never in front-end code)
3. Build with `VITE_AI_ENGINE=remote`

If the endpoint fails, the app falls back to the rules engine and says so. The template has not been tested against the live API.

## Roadmap

| Area | Current MVP | Future (not built) |
|---|---|---|
| Provider data | 10 sample listings | Real provider APIs and a managed directory |
| Maps | Map placeholder, Google Maps link | Google Maps integration, live travel time |
| Availability | Computed from opening hours | Live availability and wait times |
| Location | Chosen neighbourhood | Real-time device location |
| Understanding requests | Rules engine | LLM-based intent analysis via server endpoint |
| Booking | Prototype form, nothing sent | Real appointment booking with confirmation |
