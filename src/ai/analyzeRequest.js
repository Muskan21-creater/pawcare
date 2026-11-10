import { localEngine } from './engines/localEngine.js';
import { remoteEngine } from './engines/remoteEngine.js';

// 'local' (default, works with no setup) or 'remote' (needs a server endpoint with an LLM key).
// Set VITE_AI_ENGINE=remote at build time to switch.
const DEFAULT_ENGINE = import.meta.env?.VITE_AI_ENGINE === 'remote' ? 'remote' : 'local';

/**
 * The provider abstraction. Understanding a request is the only step that can
 * be swapped for an LLM; if the remote engine fails the local engine answers,
 * and the result says so.
 */
export async function analyzeRequest(input, { engine = DEFAULT_ENGINE } = {}) {
  if (engine === 'remote') {
    try {
      return await remoteEngine(input);
    } catch (error) {
      const fallback = await localEngine(input);
      return { ...fallback, fellBack: true };
    }
  }
  return localEngine(input);
}
