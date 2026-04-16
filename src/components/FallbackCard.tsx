// ─────────────────────────────────────────────
// PRD Section 8 — Fallback Redirect Card
// Shown when AI cannot answer a question
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import type { FallbackData } from '../types';

interface FallbackCardProps {
  fallback: FallbackData;
}

const FallbackCard: React.FC<FallbackCardProps> = ({ fallback }) => {
  const [searchQuery, setSearchQuery] = useState(
    fallback.redirects[0]
      ? decodeURIComponent(
          new URL(fallback.redirects[0].url).searchParams.get('q') ||
          new URL(fallback.redirects[0].url).searchParams.get('query') ||
          new URL(fallback.redirects[0].url).searchParams.get('search') ||
          new URL(fallback.redirects[0].url).searchParams.get('page_search_query') ||
          ''
        )
      : ''
  );

  const handleCustomSearch = () => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCustomSearch();
  };

  return (
    <div
      className="my-4 rounded-xl overflow-hidden skeuo-panel border-l-4 border-l-amber-500/50
                 animate-fade-in"
      role="alert"
      aria-label="Could not find a reliable answer"
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">⚠️</span>
        <div>
          <h4 className="text-text-primary font-semibold text-[15px]">
            I couldn't find a reliable answer for this.
          </h4>
          <p className="text-text-secondary text-sm mt-1">
            Here are some resources to help you:
          </p>
        </div>
      </div>

      {/* Redirect Links */}
      <div className="px-5 pb-2 space-y-1.5">
        {fallback.redirects.map((redirect, i) => (
          <a
            key={i}
            href={redirect.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                       hover:bg-white/[0.03] group"
          >
            <span className="text-lg flex-shrink-0">{redirect.icon}</span>
            <span className="text-text-primary text-sm font-medium flex-1">
              {redirect.label}
            </span>
            <span className="text-text-secondary text-xs group-hover:text-accent-primary transition-colors flex items-center gap-1">
              Open
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      {/* Custom search box (PRD Section 8) */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search yourself..."
              className="w-full skeuo-input rounded-lg px-4 py-2.5 text-sm text-gray-200
                         placeholder:text-gray-600 focus:outline-none
                         transition-all"
              aria-label="Custom search query"
            />
          </div>
          <button
            onClick={handleCustomSearch}
            className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg
                       hover:bg-violet-500 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-violet-500/50 flex-shrink-0"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
};

export default FallbackCard;
