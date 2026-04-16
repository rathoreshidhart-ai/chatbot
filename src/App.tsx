// ─────────────────────────────────────────────
// NexusAI — Main App Layout (Skeuomorphic)
// No navbar. Collapsible sidebar + Chat area.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import SettingsModal from './components/SettingsModal';
import { useChatStore } from './store/chatStore';
import { useSettingsStore } from './store/settingsStore';

// Toast notification component
const Toasts: React.FC = () => {
  const toasts = useChatStore((s) => s.toasts);
  const removeToast = useChatStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  const colorMap = {
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    info: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  };

  const iconMap = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️',
  };

  return (
    <div className="fixed bottom-20 right-4 z-[100] space-y-2 max-w-sm" aria-live="assertive">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md
                       skeuo-panel ${colorMap[toast.type]}`}
            role="alert"
          >
            <span className="flex-shrink-0 text-sm mt-0.5">{iconMap[toast.type]}</span>
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const fontSize = useSettingsStore((s) => s.fontSize);

  const fontSizeClass = fontSize === 'sm' ? 'font-size-sm' : fontSize === 'lg' ? 'font-size-lg' : 'font-size-md';

  return (
    <div className={`h-screen flex bg-[#0a0a0c] ${fontSizeClass}`}>

      {/* ── Sidebar (always visible, collapses to icon strip) ── */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* ── Chat Area (auto-adjusts to fill remaining space) ── */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Messages */}
        <ChatWindow onOpenSettings={() => setSettingsOpen(true)} />

        {/* Input */}
        <InputBar onOpenSettings={() => setSettingsOpen(true)} />
      </main>

      {/* ── Settings Modal ── */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* ── Toast Notifications ── */}
      <Toasts />
    </div>
  );
};

export default App;
