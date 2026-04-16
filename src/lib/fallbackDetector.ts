// ─────────────────────────────────────────────
// PRD Section 5.3 — Fallback Detection Logic
// ─────────────────────────────────────────────

import type { FallbackData } from '../types';
import { getRedirects } from './redirectMap';

interface FallbackJSON {
  can_answer: boolean;
  topic: string;
  query: string;
  reason?: string;
}

// Uncertainty keywords that suggest the AI can't answer
const UNCERTAINTY_KEYWORDS = [
  "i don't have access to",
  "i don't have real-time",
  "i cannot provide",
  "i'm not able to",
  "i am not able to",
  "i don't have information",
  "i cannot access",
  "beyond my knowledge",
  "outside my training",
  "i don't know",
  "i'm unable to",
  "i am unable to",
  "i cannot determine",
  "i can't provide",
  "my training data doesn't",
  "my knowledge cutoff",
  "as of my last update",
  "i don't have up-to-date",
  "consult a professional",
  "consult a doctor",
  "consult a lawyer",
  "seek professional advice",
];

/**
 * Detects if the AI response indicates a fallback scenario.
 * 
 * Detection follows PRD Section 5.3:
 *  1. Check for structured FALLBACK: JSON flag (highest priority)
 *  2. Check for keyword-based uncertainty detection
 * 
 * Returns FallbackData if fallback is triggered, null otherwise.
 */
export function detectFallback(
  aiResponse: string,
  userQuery: string
): FallbackData | null {
  // Step 1: Check for FALLBACK: JSON prefix (PRD Section 6)
  const fallbackMatch = aiResponse.match(/FALLBACK:\s*(\{[^}]+\})/);
  if (fallbackMatch) {
    try {
      const parsed: FallbackJSON = JSON.parse(fallbackMatch[1]);
      if (parsed.can_answer === false) {
        const topic = parsed.topic || 'general';
        const query = parsed.query || userQuery;
        return {
          triggered: true,
          topic,
          reason: parsed.reason,
          redirects: getRedirects(topic, query),
        };
      }
    } catch {
      // JSON parse failed, continue to keyword detection
    }
  }

  // Step 2: Check for inline JSON without prefix (Section 3.6 format)
  const jsonMatch = aiResponse.match(/\{\s*"can_answer"\s*:\s*false[^}]*\}/);
  if (jsonMatch) {
    try {
      const parsed: FallbackJSON = JSON.parse(jsonMatch[0]);
      if (parsed.can_answer === false) {
        const topic = parsed.topic || 'general';
        const query = parsed.query || userQuery;
        return {
          triggered: true,
          topic,
          reason: parsed.reason,
          redirects: getRedirects(topic, query),
        };
      }
    } catch {
      // Continue to keyword detection
    }
  }

  // Step 3: Keyword-based uncertainty detection
  const lower = aiResponse.toLowerCase();
  const uncertaintyScore = UNCERTAINTY_KEYWORDS.filter(kw => lower.includes(kw)).length;
  
  // Require at least 2 uncertainty keywords to trigger fallback
  // (prevents false positives from normal caveats)
  if (uncertaintyScore >= 2) {
    return {
      triggered: true,
      topic: 'general',
      reason: 'Multiple uncertainty indicators detected in response',
      redirects: getRedirects('general', userQuery),
    };
  }

  return null;
}

/**
 * Strips the FALLBACK JSON line from the AI response for display.
 */
export function stripFallbackJSON(response: string): string {
  return response
    .replace(/FALLBACK:\s*\{[^}]+\}\s*\n?/g, '')
    .replace(/\{\s*"can_answer"\s*:\s*false[^}]*\}\s*\n?/g, '')
    .trim();
}
