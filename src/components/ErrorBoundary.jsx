import { Component } from 'react';

/** Last line of defence: a render error shows a recovery screen instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 max-w-sm text-ink-soft">PawCare hit an unexpected problem. Reloading usually fixes it. If your pet needs urgent care, call a 24-hour vet hospital directly.</p>
        <button type="button" className="btn-primary mt-6" onClick={() => window.location.assign(window.location.pathname)}>Reload PawCare</button>
      </div>
    );
  }
}
