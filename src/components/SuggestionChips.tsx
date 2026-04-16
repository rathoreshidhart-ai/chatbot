// ─────────────────────────────────────────────
// PRD Section 3.7 — Suggestion Chips
// Follow-up question chips shown after AI response
// ─────────────────────────────────────────────

import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 animate-fade-in" role="group" aria-label="Suggested follow-up questions">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className="px-3.5 py-2 text-sm text-text-secondary bg-bg-surface border border-border rounded-xl
                     hover:border-accent-primary/50 hover:text-accent-primary hover:bg-accent-primary/5
                     transition-all duration-200 text-left
                     focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;
