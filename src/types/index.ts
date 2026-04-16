// ─────────────────────────────────────────────
// PRD Section 5.4 — Data Models
// ─────────────────────────────────────────────

export type ProviderType = 'groq';
export interface Redirect {
  label: string;
  url: string;
  icon: string;
  category: string;
}

export interface FallbackData {
  triggered: boolean;
  topic: string;
  reason?: string;
  redirects: Redirect[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  fallback?: FallbackData;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  model: string;
  systemPrompt: string;
}

export interface Settings {
  provider: ProviderType;
  model: string;
  baseUrl: string;
  systemPrompt: string;
  theme: 'dark' | 'light' | 'system';
  streamingEnabled: boolean;
  suggestionsEnabled: boolean;
  showTimestamps: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface SendMessageParams {
  provider: ProviderType;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  messages: Message[];
  systemPrompt: string;
  stream: boolean;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface APIError {
  status: number;
  message: string;
  type: 'auth' | 'rate_limit' | 'server' | 'network' | 'unknown';
}
