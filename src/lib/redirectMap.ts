// ─────────────────────────────────────────────
// PRD Section 5.3 — Redirect Map
// Topic → Redirect URL mapping
// ─────────────────────────────────────────────

import type { Redirect } from '../types';

interface RedirectTemplate {
  label: string;
  icon: string;
  urlTemplate: string;
  category: string;
}

// Tier 1 — Direct knowledge sources (PRD Section 3.6)
const TIER_1: RedirectTemplate[] = [
  { label: 'Wikipedia', icon: '📖', urlTemplate: 'https://en.wikipedia.org/w/index.php?search={query}', category: 'general' },
  { label: 'Khan Academy', icon: '🎓', urlTemplate: 'https://www.khanacademy.org/search?page_search_query={query}', category: 'learning' },
  { label: 'Stack Overflow', icon: '💻', urlTemplate: 'https://stackoverflow.com/search?q={query}', category: 'coding' },
  { label: 'MDN Web Docs', icon: '🌐', urlTemplate: 'https://developer.mozilla.org/en-US/search?q={query}', category: 'coding' },
  { label: 'arXiv', icon: '🔬', urlTemplate: 'https://arxiv.org/search/?query={query}', category: 'research' },
];

// Tier 2 — General search (PRD Section 3.6)
const TIER_2: RedirectTemplate[] = [
  { label: 'Google Search', icon: '🌐', urlTemplate: 'https://www.google.com/search?q={query}', category: 'search' },
  { label: 'DuckDuckGo', icon: '🦆', urlTemplate: 'https://duckduckgo.com/?q={query}', category: 'search' },
  { label: 'Bing', icon: '🔍', urlTemplate: 'https://www.bing.com/search?q={query}', category: 'search' },
];

// Topic-based routing (PRD Section 3.6)
const TOPIC_MAP: Record<string, RedirectTemplate[]> = {
  coding: [
    { label: 'Stack Overflow', icon: '💻', urlTemplate: 'https://stackoverflow.com/search?q={query}', category: 'coding' },
    { label: 'GitHub Search', icon: '🐙', urlTemplate: 'https://github.com/search?q={query}', category: 'coding' },
    { label: 'MDN Web Docs', icon: '📚', urlTemplate: 'https://developer.mozilla.org/en-US/search?q={query}', category: 'coding' },
  ],
  medical: [
    { label: 'WebMD', icon: '🏥', urlTemplate: 'https://www.webmd.com/search/search_results/default.aspx?query={query}', category: 'medical' },
    { label: 'Mayo Clinic', icon: '⚕️', urlTemplate: 'https://www.mayoclinic.org/search/search-results?q={query}', category: 'medical' },
    { label: 'NIH', icon: '🔬', urlTemplate: 'https://search.nih.gov/search?query={query}', category: 'medical' },
  ],
  legal: [
    { label: 'FindLaw', icon: '⚖️', urlTemplate: 'https://www.findlaw.com/search.html?q={query}', category: 'legal' },
    { label: 'Google Scholar (Legal)', icon: '📜', urlTemplate: 'https://scholar.google.com/scholar?q={query}', category: 'legal' },
  ],
  news: [
    { label: 'Google News', icon: '📰', urlTemplate: 'https://news.google.com/search?q={query}', category: 'news' },
    { label: 'Reuters', icon: '🗞️', urlTemplate: 'https://www.reuters.com/search/news?query={query}', category: 'news' },
  ],
  math: [
    { label: 'Wolfram Alpha', icon: '🧮', urlTemplate: 'https://www.wolframalpha.com/input?i={query}', category: 'math' },
    { label: 'Khan Academy', icon: '🎓', urlTemplate: 'https://www.khanacademy.org/search?page_search_query={query}', category: 'math' },
  ],
  science: [
    { label: 'Wolfram Alpha', icon: '🧮', urlTemplate: 'https://www.wolframalpha.com/input?i={query}', category: 'science' },
    { label: 'Khan Academy', icon: '🎓', urlTemplate: 'https://www.khanacademy.org/search?page_search_query={query}', category: 'science' },
  ],
  research: [
    { label: 'Google Scholar', icon: '🎓', urlTemplate: 'https://scholar.google.com/scholar?q={query}', category: 'research' },
    { label: 'arXiv', icon: '🔬', urlTemplate: 'https://arxiv.org/search/?query={query}', category: 'research' },
    { label: 'JSTOR', icon: '📚', urlTemplate: 'https://www.jstor.org/action/doBasicSearch?Query={query}', category: 'research' },
  ],
};

// Keywords to classify topics from AI response
const TOPIC_KEYWORDS: Record<string, string[]> = {
  coding: ['code', 'programming', 'software', 'developer', 'api', 'debug', 'javascript', 'python', 'java', 'react', 'css', 'html', 'database', 'sql', 'git', 'algorithm'],
  medical: ['health', 'medical', 'doctor', 'disease', 'symptom', 'treatment', 'medicine', 'diagnosis', 'hospital', 'clinical'],
  legal: ['law', 'legal', 'court', 'attorney', 'lawyer', 'regulation', 'statute', 'contract', 'rights', 'lawsuit'],
  news: ['news', 'current events', 'today', 'breaking', 'latest', 'politics', 'election'],
  math: ['math', 'mathematics', 'equation', 'formula', 'calculus', 'algebra', 'geometry', 'statistics'],
  science: ['science', 'physics', 'chemistry', 'biology', 'experiment', 'scientific', 'research'],
  research: ['research', 'paper', 'study', 'academic', 'journal', 'publication', 'thesis'],
};

function classifyTopic(topic: string, query: string): string {
  const combined = `${topic} ${query}`.toLowerCase();
  for (const [category, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return category;
      }
    }
  }
  return 'general';
}

export function getRedirects(topic: string, query: string): Redirect[] {
  const category = classifyTopic(topic, query);
  const encodedQuery = encodeURIComponent(query);

  const topicRedirects = TOPIC_MAP[category] || [];
  
  // Build the redirect list: topic-specific first, then general search
  const results: Redirect[] = [];
  const seen = new Set<string>();

  // Add topic-specific redirects
  for (const tmpl of topicRedirects) {
    if (!seen.has(tmpl.label)) {
      seen.add(tmpl.label);
      results.push({
        label: tmpl.label,
        icon: tmpl.icon,
        url: tmpl.urlTemplate.replace('{query}', encodedQuery),
        category: tmpl.category,
      });
    }
  }

  // Add Tier 1 general sources (if not already added)
  for (const tmpl of TIER_1) {
    if (!seen.has(tmpl.label) && results.length < 4) {
      seen.add(tmpl.label);
      results.push({
        label: tmpl.label,
        icon: tmpl.icon,
        url: tmpl.urlTemplate.replace('{query}', encodedQuery),
        category: tmpl.category,
      });
    }
  }

  // Always add Google Search as a fallback
  const google = TIER_2[0];
  if (!seen.has(google.label)) {
    results.push({
      label: google.label,
      icon: google.icon,
      url: google.urlTemplate.replace('{query}', encodedQuery),
      category: google.category,
    });
  }

  return results.slice(0, 5); // PRD says 3–5 links
}
