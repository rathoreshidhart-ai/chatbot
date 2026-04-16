// ─────────────────────────────────────────────
// PRD Section 7 — Settings Modal
// Full settings panel with all configuration
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useChatStore } from '../store/chatStore';
import { MODEL_OPTIONS, PERSONA_PRESETS, DEFAULT_SYSTEM_PROMPT } from '../lib/utils';
import { exportConversationsJSON, clearAllData } from '../lib/storage';
import type { ProviderType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const settings = useSettingsStore();
  const conversations = useChatStore((s) => s.conversations);
  const addToast = useChatStore((s) => s.addToast);

  const KNOWN_MODELS = ['groq/compound', 'groq/compound-mini', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];

  const [activeTab, setActiveTab] = useState<'api' | 'model' | 'persona' | 'interface' | 'data'>('api');
  const [confirmClearChats, setConfirmClearChats] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(!KNOWN_MODELS.includes(settings.model));
  const [customModelInput, setCustomModelInput] = useState(
    KNOWN_MODELS.includes(settings.model) ? '' : settings.model
  );

  if (!isOpen) return null;

  const handleClearAllChats = () => {
    if (confirmClearChats) {
      const chatStore = useChatStore.getState();
      // Delete all conversations
      conversations.forEach(c => chatStore.deleteConversation(c.id));
      setConfirmClearChats(false);
      addToast('All chats have been cleared.', 'success');
    } else {
      setConfirmClearChats(true);
      setTimeout(() => setConfirmClearChats(false), 3000);
    }
  };

  const handleExportChats = () => {
    exportConversationsJSON(conversations);
    addToast('Chats exported successfully!', 'success');
  };

  const handleResetSettings = () => {
    if (confirm('Reset all settings to default? This will clear your model, persona, and interface preferences.')) {
      localStorage.removeItem('nexusai_settings');
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'api' as const, label: 'API', icon: '🔑' },
    { id: 'model' as const, label: 'Model', icon: '⚙️' },
    { id: 'persona' as const, label: 'Persona', icon: '🎭' },
    { id: 'interface' as const, label: 'Interface', icon: '🎨' },
    { id: 'data' as const, label: 'Data', icon: '💾' },
  ];

  const models = MODEL_OPTIONS[settings.provider] || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl max-h-[85vh] skeuo-panel rounded-2xl
                     flex flex-col animate-fade-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-surface transition-colors text-text-secondary hover:text-text-primary
                         focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                  ${activeTab === tab.id
                    ? 'border-accent-primary text-accent-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* ── API Configuration ── */}
            {activeTab === 'api' && (
              <>
                <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg mb-6">
                  <p className="text-sm font-medium text-accent-primary">Powered by Groq</p>
                  <p className="text-xs text-text-secondary mt-1">
                    API calls are routed through Groq's ultra-fast LPU inference engine.
                  </p>
                </div>
                
                {/* Model Selector — Card Style */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">Select Model</label>
                  <div className="space-y-2">
                    {/* Predefined model cards */}
                    {[
                      { id: 'groq/compound', label: 'groq/compound', desc: '30 RPM · 250 RPD · 70K ctx' },
                      { id: 'groq/compound-mini', label: 'groq/compound-mini', desc: '30 RPM · 250 RPD · 70K ctx' },
                      { id: 'llama-3.1-8b-instant', label: 'llama-3.1-8b-instant', desc: '30 RPM · 14.4K RPD · 6K ctx · 500K TPD' },
                      { id: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b-versatile', desc: '30 RPM · 1K RPD · 12K ctx · 100K TPD' },
                    ].map((model) => {
                      const isSelected = !isCustomMode && settings.model === model.id;
                      return (
                        <button
                          key={model.id}
                          onClick={() => {
                            setIsCustomMode(false);
                            settings.setModel(model.id);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200
                            ${isSelected
                              ? 'bg-accent-primary/10 border-accent-primary/40 ring-1 ring-accent-primary/20'
                              : 'bg-bg-input border-border hover:bg-bg-surface hover:border-border'
                            }`}
                        >
                          {/* Radio circle */}
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                            ${isSelected ? 'border-accent-primary' : 'border-text-secondary/40'}`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-accent-primary" />}
                          </div>
                          {/* Model info */}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${isSelected ? 'text-accent-primary' : 'text-text-primary'}`}>
                              {model.label}
                            </div>
                            <div className="text-xs text-text-secondary/60 mt-0.5">{model.desc}</div>
                          </div>
                          {isSelected && (
                            <svg className="w-4 h-4 text-accent-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      );
                    })}

                    {/* "Other" custom model card */}
                    <button
                      onClick={() => {
                        setIsCustomMode(true);
                        settings.setModel(customModelInput || '');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200
                        ${isCustomMode
                          ? 'bg-accent-primary/10 border-accent-primary/40 ring-1 ring-accent-primary/20'
                          : 'bg-bg-input border-border hover:bg-bg-surface hover:border-border'
                        }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                        ${isCustomMode ? 'border-accent-primary' : 'border-text-secondary/40'}`}
                      >
                        {isCustomMode && <div className="w-2 h-2 rounded-full bg-accent-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${isCustomMode ? 'text-accent-primary' : 'text-text-primary'}`}>
                          Other (Custom Model)
                        </div>
                        <div className="text-xs text-text-secondary/60 mt-0.5">Enter any Groq-supported model name</div>
                      </div>
                    </button>

                    {/* Custom model text input — shown when "Other" is active */}
                    {isCustomMode && (
                      <input
                        type="text"
                        value={customModelInput}
                        onChange={(e) => {
                          setCustomModelInput(e.target.value);
                          settings.setModel(e.target.value);
                        }}
                        placeholder="Enter custom model name..."
                        className="w-full bg-bg-input border border-accent-primary/30 rounded-lg px-4 py-2.5 text-sm text-text-primary
                                   placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/40
                                   focus:border-accent-primary/50"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Model Parameters ── */}
            {activeTab === 'model' && (
              <>
                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-text-primary">Temperature</label>
                    <span className="text-sm text-accent-primary font-mono">{settings.temperature.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => settings.setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-accent-primary"
                  />
                  <div className="flex justify-between text-xs text-text-secondary/50 mt-1">
                    <span>Precise (0)</span>
                    <span>Creative (2)</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Max Tokens</label>
                  <input
                    type="number"
                    min="1"
                    max="128000"
                    value={settings.maxTokens}
                    onChange={(e) => settings.setMaxTokens(parseInt(e.target.value) || 2048)}
                    className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary
                               focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/50"
                  />
                </div>

                {/* Top-p */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-text-primary">Top-p</label>
                    <span className="text-sm text-accent-primary font-mono">{settings.topP.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.topP}
                    onChange={(e) => settings.setTopP(parseFloat(e.target.value))}
                    className="w-full accent-accent-primary"
                  />
                </div>
              </>
            )}

            {/* ── Persona ── */}
            {activeTab === 'persona' && (
              <>
                {/* Preset selector */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Preset</label>
                  <div className="relative">
                    <select
                      value={
                        Object.entries(PERSONA_PRESETS).find(([, v]) => v === settings.systemPrompt)?.[0] || 'Custom'
                      }
                      onChange={(e) => {
                        const preset = PERSONA_PRESETS[e.target.value];
                        if (preset) settings.setSystemPrompt(preset);
                      }}
                      className="w-full bg-bg-input border border-border rounded-lg pl-4 pr-10 py-2.5 text-sm text-text-primary
                                 appearance-none focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/50"
                    >
                      {Object.keys(PERSONA_PRESETS).map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                      {!Object.values(PERSONA_PRESETS).includes(settings.systemPrompt) && (
                        <option value="Custom">Custom</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* System prompt textarea */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-text-primary">System Prompt</label>
                    <button
                      onClick={() => settings.setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}
                      className="text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
                    >
                      Reset to default
                    </button>
                  </div>
                  <textarea
                    value={settings.systemPrompt}
                    onChange={(e) => settings.setSystemPrompt(e.target.value)}
                    rows={12}
                    className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm text-text-primary
                               font-mono leading-relaxed resize-y
                               focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/50"
                  />
                </div>
              </>
            )}

            {/* ── Interface ── */}
            {activeTab === 'interface' && (
              <>
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Theme</label>
                  <div className="flex gap-2">
                    {(['dark', 'light', 'system'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => settings.setTheme(theme)}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-all border
                          ${settings.theme === theme
                            ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/30'
                            : 'bg-bg-input text-text-secondary border-border hover:bg-bg-surface'
                          }`}
                      >
                        {theme === 'dark' ? '🌙 ' : theme === 'light' ? '☀️ ' : '💻 '}{theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Font Size</label>
                  <div className="flex gap-2">
                    {([
                      { value: 'sm' as const, label: 'Small' },
                      { value: 'md' as const, label: 'Medium' },
                      { value: 'lg' as const, label: 'Large' },
                    ]).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => settings.setFontSize(value)}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border
                          ${settings.fontSize === value
                            ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/30'
                            : 'bg-bg-input text-text-secondary border-border hover:bg-bg-surface'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                  {[
                    { label: 'Show timestamps', value: settings.showTimestamps, setter: settings.setShowTimestamps },
                    { label: 'Show suggestions', value: settings.suggestionsEnabled, setter: settings.setSuggestionsEnabled },
                    { label: 'Streaming responses', value: settings.streamingEnabled, setter: settings.setStreamingEnabled },
                  ].map(({ label, value, setter }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-text-primary">{label}</span>
                      <button
                        onClick={() => setter(!value)}
                        className={`relative w-11 h-6 rounded-full transition-all duration-200
                          ${value ? 'bg-accent-primary' : 'bg-bg-surface border border-border'}`}
                        role="switch"
                        aria-checked={value}
                        aria-label={label}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 shadow-sm
                            ${value ? 'left-[22px] bg-white' : 'left-0.5 bg-text-secondary'}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Data ── */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <button
                  onClick={handleExportChats}
                  disabled={conversations.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
                             bg-accent-primary/10 text-accent-primary border border-accent-primary/20
                             hover:bg-accent-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Export all chats (JSON)
                </button>

                <button
                  onClick={handleClearAllChats}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
                             border transition-all
                             ${confirmClearChats
                               ? 'bg-status-error text-white border-status-error'
                               : 'bg-status-error/10 text-status-error border-status-error/20 hover:bg-status-error/20'
                             }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  {confirmClearChats ? 'Click again to confirm' : 'Clear all chats'}
                </button>

                <div className="border-t border-border my-2" />

                <button
                  onClick={handleResetSettings}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
                             bg-bg-input text-text-secondary border border-border hover:bg-bg-surface transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Reset all settings to default
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
