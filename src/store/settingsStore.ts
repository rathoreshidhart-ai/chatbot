// ─────────────────────────────────────────────
// PRD Section 5.4 — Settings Store (Zustand)
// API key is now sourced from environment
// variables (VITE_API_KEY), not user input.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import type { Settings, ProviderType } from '../types';
import { DEFAULT_SYSTEM_PROMPT, MODEL_OPTIONS } from '../lib/utils';
import { loadSettings, saveSettings } from '../lib/storage';

// Read API key from environment — admin-configured, never user-visible
export function getApiKey(): string {
  return import.meta.env.VITE_GROQ_API_KEY || '';
}

interface SettingsState extends Settings {
  setProvider: (provider: ProviderType) => void;
  setModel: (model: string) => void;
  setBaseUrl: (url: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setStreamingEnabled: (enabled: boolean) => void;
  setSuggestionsEnabled: (enabled: boolean) => void;
  setShowTimestamps: (show: boolean) => void;
  setFontSize: (size: 'sm' | 'md' | 'lg') => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (max: number) => void;
  setTopP: (topP: number) => void;
  updateSettings: (partial: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  provider: 'groq',
  model: 'llama-3.1-8b-instant',
  baseUrl: '',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  theme: 'dark',
  streamingEnabled: true,
  suggestionsEnabled: true,
  showTimestamps: false,
  fontSize: 'md',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
};

// Merge saved settings with defaults
const savedSettings = loadSettings();

// Validation: protect against known bad models (e.g. leftover OpenAI models) while allowing custom models
let finalModel = savedSettings.model || defaultSettings.model;
const currentProvider = (savedSettings.provider || defaultSettings.provider) as ProviderType;
const availableModels = MODEL_OPTIONS[currentProvider] || [];

if (['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'].includes(finalModel)) {
  console.warn(`Invalid model "${finalModel}" for provider "${currentProvider}". Resetting to default.`);
  finalModel = availableModels[0] || defaultSettings.model;
}

const initialSettings: Settings = { 
  ...defaultSettings, 
  ...savedSettings,
  model: finalModel
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initialSettings,

  setProvider: (provider) => {
    set({ provider });
    saveSettings({ ...get(), provider });
  },

  setModel: (model) => {
    set({ model });
    saveSettings({ ...get(), model });
  },

  setBaseUrl: (baseUrl) => {
    set({ baseUrl });
    saveSettings({ ...get(), baseUrl });
  },

  setSystemPrompt: (systemPrompt) => {
    set({ systemPrompt });
    saveSettings({ ...get(), systemPrompt });
  },

  setTheme: (theme) => {
    set({ theme });
    saveSettings({ ...get(), theme });
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
      document.documentElement.classList.toggle('light', !prefersDark);
    }
  },

  setStreamingEnabled: (streamingEnabled) => {
    set({ streamingEnabled });
    saveSettings({ ...get(), streamingEnabled });
  },

  setSuggestionsEnabled: (suggestionsEnabled) => {
    set({ suggestionsEnabled });
    saveSettings({ ...get(), suggestionsEnabled });
  },

  setShowTimestamps: (showTimestamps) => {
    set({ showTimestamps });
    saveSettings({ ...get(), showTimestamps });
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    saveSettings({ ...get(), fontSize });
  },

  setTemperature: (temperature) => {
    set({ temperature });
    saveSettings({ ...get(), temperature });
  },

  setMaxTokens: (maxTokens) => {
    set({ maxTokens });
    saveSettings({ ...get(), maxTokens });
  },

  setTopP: (topP) => {
    set({ topP });
    saveSettings({ ...get(), topP });
  },

  updateSettings: (partial) => {
    set(partial);
    saveSettings({ ...get(), ...partial });
  },
}));
