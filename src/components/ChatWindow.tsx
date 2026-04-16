// ─────────────────────────────────────────────
// NexusAI — Chat Window (Skeuomorphic)
// ─────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  onOpenSettings: () => void;
}

// Empty state
const EmptyState: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="text-center max-w-lg"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-20 h-20 mx-auto mb-6 rounded-2xl skeuo-panel
                   flex items-center justify-center"
      >
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-700/20
                       flex items-center justify-center">
          <svg className="w-9 h-9 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-semibold text-white mb-3"
      >
        Welcome to NexusAI
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-gray-500 text-[15px] leading-relaxed mb-8"
      >
        Your personal AI assistant — fast, smart, and honest about its limits.
      </motion.p>

      {/* Quick start suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left"
      >
        {[
          { icon: '💡', text: 'Explain quantum computing in simple terms' },
          { icon: '💻', text: 'Write a Python script to sort a list' },
          { icon: '✍️', text: 'Help me write a professional email' },
          { icon: '🧮', text: 'Solve a calculus derivative step by step' },
        ].map((suggestion, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const store = useChatStore.getState();
              if (!store.activeConversationId) store.createNewChat();
              store.sendUserMessage(suggestion.text);
            }}
            className="flex items-start gap-3 p-4 rounded-xl skeuo-btn text-left group"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{suggestion.icon}</span>
            <span className="text-[13px] text-gray-400 group-hover:text-gray-200 transition-colors">
              {suggestion.text}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ onOpenSettings }) => {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const isGenerating = useChatStore((s) => s.isGenerating);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages.filter((m) => m.role !== 'system') || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  if (!activeConversation || messages.length === 0) {
    return <EmptyState onOpenSettings={onOpenSettings} />;
  }

  return (
    <div
      className="flex-1 overflow-y-auto scroll-smooth"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="py-6">
        {messages.map((message, i) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <MessageBubble message={message} />
          </motion.div>
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
