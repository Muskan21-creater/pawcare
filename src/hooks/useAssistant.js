import { useCallback, useRef, useState } from 'react';
import { analyzePetRequest } from '../ai/analyzePetRequest.js';

export const ANALYSIS_STAGES = [
  'Reading your message',
  'Detecting urgency',
  'Identifying the type of care',
  'Matching providers',
  'Ranking for your situation',
];

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Holds the assistant's state at the app level so the result survives
 * opening a provider page and coming back. The local engine answers in
 * milliseconds; the short stage pacing only lets people follow the steps.
 */
export function useAssistant() {
  const [state, setState] = useState({ status: 'idle', text: '', stage: 0, result: null, error: null });
  const latest = useRef(0);

  const run = useCallback(async (text) => {
    const id = (latest.current += 1);
    setState({ status: 'running', text, stage: 0, result: null, error: null });
    const settled = analyzePetRequest(text).then((result) => ({ result }), (error) => ({ error }));

    if (!prefersReducedMotion()) {
      for (let stage = 1; stage < ANALYSIS_STAGES.length; stage += 1) {
        await wait(280);
        if (id !== latest.current) return;
        setState((s) => ({ ...s, stage }));
      }
      await wait(220);
    }
    const { result, error } = await settled;
    if (id !== latest.current) return;
    setState((s) => (error ? { ...s, status: 'error', error } : { ...s, status: 'done', result, stage: ANALYSIS_STAGES.length }));
  }, []);

  const reset = useCallback(() => {
    latest.current += 1;
    setState({ status: 'idle', text: '', stage: 0, result: null, error: null });
  }, []);

  return { ...state, run, reset };
}
