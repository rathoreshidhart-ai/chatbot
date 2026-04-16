// ─────────────────────────────────────────────
// PRD Section 5.4 — Chat Store (Zustand)
// Manages conversations, messages, streaming
// ─────────────────────────────────────────────

import { create } from 'zustand';
import type { Conversation, Message, FallbackData } from '../types';
import { generateId, truncate, DEFAULT_SYSTEM_PROMPT } from '../lib/utils';
import { loadConversations, saveConversations } from '../lib/storage';
import { sendMessage } from '../lib/apiClient';
import { detectFallback, stripFallbackJSON } from '../lib/fallbackDetector';
import { useSettingsStore } from './settingsStore';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isGenerating: boolean;
  abortController: AbortController | null;
  error: string | null;
  toasts: Array<{ id: string; message: string; type: 'error' | 'warning' | 'success' | 'info' }>;

  // Actions
  createNewChat: () => string;
  setActiveConversation: (id: string) => void;
  sendUserMessage: (content: string) => Promise<void>;
  stopGenerating: () => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  pinConversation: (id: string) => void;
  clearError: () => void;
  addToast: (message: string, type: 'error' | 'warning' | 'success' | 'info') => void;
  removeToast: (id: string) => void;
  getActiveConversation: () => Conversation | undefined;
}

const loaded = loadConversations();

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: loaded,
  activeConversationId: loaded.length > 0 ? loaded[0].id : null,
  isGenerating: false,
  abortController: null,
  error: null,
  toasts: [],

  createNewChat: () => {
    const settings = useSettingsStore.getState();
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      model: settings.model,
      systemPrompt: settings.systemPrompt,
    };
    set((state) => {
      const updated = [newConversation, ...state.conversations];
      saveConversations(updated);
      return { conversations: updated, activeConversationId: newConversation.id };
    });
    return newConversation.id;
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
  },

  sendUserMessage: async (content: string) => {
    const state = get();
    const settings = useSettingsStore.getState();

    // Ensure there's an active conversation
    let conversationId = state.activeConversationId;
    if (!conversationId) {
      conversationId = get().createNewChat();
    }

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Create placeholder assistant message
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    // Add messages to conversation
    set((state) => {
      const conversations = state.conversations.map((conv) => {
        if (conv.id !== conversationId) return conv;
        const isFirstMessage = conv.messages.filter(m => m.role === 'user').length === 0;
        return {
          ...conv,
          title: isFirstMessage ? truncate(content, 40) : conv.title,
          messages: [...conv.messages, userMessage, assistantMessage],
          updatedAt: Date.now(),
        };
      });
      saveConversations(conversations);
      return { conversations, isGenerating: true, error: null };
    });

    // Stream AI response
    const abortController = new AbortController();
    set({ abortController });

    try {
      const conversation = get().conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const messagesToSend = conversation.messages
        .filter(m => m.id !== assistantMessage.id)
        .filter(m => m.role !== 'system');

      let fullResponse = '';
      let pendingFlush = false;
      let flushTimer: ReturnType<typeof setTimeout> | null = null;
      const FLUSH_INTERVAL = 50; // ms — batches tokens for smooth rendering

      // Flush buffered content to Zustand state
      const flushToState = () => {
        pendingFlush = false;
        flushTimer = null;
        set((state) => {
          const conversations = state.conversations.map((conv) => {
            if (conv.id !== conversationId) return conv;
            return {
              ...conv,
              messages: conv.messages.map((msg) => {
                if (msg.id !== assistantMessage.id) return msg;
                return { ...msg, content: fullResponse };
              }),
            };
          });
          return { conversations };
        });
      };

      const stream = sendMessage(
        {
          provider: settings.provider,
          model: settings.model,
          baseUrl: settings.baseUrl,
          messages: messagesToSend,
          systemPrompt: settings.systemPrompt,
          stream: settings.streamingEnabled,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          topP: settings.topP,
        },
        abortController.signal
      );

      for await (const token of stream) {
        fullResponse += token;

        // Throttle state updates — batch tokens & flush every FLUSH_INTERVAL ms
        if (!pendingFlush) {
          pendingFlush = true;
          flushTimer = setTimeout(flushToState, FLUSH_INTERVAL);
        }
      }

      // Final flush: ensure all remaining buffered content is rendered
      if (flushTimer) clearTimeout(flushTimer);
      flushToState();

      // Streaming complete — run fallback detection
      const fallback = detectFallback(fullResponse, content);
      const cleanContent = fallback ? stripFallbackJSON(fullResponse) : fullResponse;

      // Final update: mark streaming complete, clean content, add fallback
      set((state) => {
        const conversations = state.conversations.map((conv) => {
          if (conv.id !== conversationId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((msg) => {
              if (msg.id !== assistantMessage.id) return msg;
              return {
                ...msg,
                content: cleanContent,
                isStreaming: false,
                fallback: fallback || undefined,
              };
            }),
          };
        });
        saveConversations(conversations);
        return { conversations, isGenerating: false, abortController: null };
      });
    } catch (error: unknown) {
      const apiError = error as { message?: string; type?: string };
      const errorMessage = apiError?.message || 'An unexpected error occurred';
      const errorType = apiError?.type;

      // Update assistant message with error
      set((state) => {
        const conversations = state.conversations.map((conv) => {
          if (conv.id !== conversationId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((msg) => {
              if (msg.id !== assistantMessage.id) return msg;
              return { ...msg, content: '', isStreaming: false };
            }),
          };
        });
        saveConversations(conversations);
        return { conversations, isGenerating: false, abortController: null };
      });

      // Show appropriate toast
      if (errorType === 'rate_limit') {
        get().addToast(errorMessage, 'warning');
      } else {
        get().addToast(errorMessage, 'error');
      }
    }
  },

  stopGenerating: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set((state) => {
        const conversations = state.conversations.map((conv) => ({
          ...conv,
          messages: conv.messages.map((msg) =>
            msg.isStreaming ? { ...msg, isStreaming: false } : msg
          ),
        }));
        saveConversations(conversations);
        return { conversations, isGenerating: false, abortController: null };
      });
    }
  },

  renameConversation: (id, title) => {
    set((state) => {
      const conversations = state.conversations.map((conv) =>
        conv.id === id ? { ...conv, title } : conv
      );
      saveConversations(conversations);
      return { conversations };
    });
  },

  deleteConversation: (id) => {
    set((state) => {
      const conversations = state.conversations.filter((conv) => conv.id !== id);
      const activeConversationId =
        state.activeConversationId === id
          ? conversations[0]?.id || null
          : state.activeConversationId;
      saveConversations(conversations);
      return { conversations, activeConversationId };
    });
  },

  pinConversation: (id) => {
    set((state) => {
      const conversations = state.conversations.map((conv) =>
        conv.id === id ? { ...conv, pinned: !conv.pinned } : conv
      );
      saveConversations(conversations);
      return { conversations };
    });
  },

  clearError: () => set({ error: null }),

  addToast: (message, type) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },
}));
