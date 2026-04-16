// ─────────────────────────────────────────────
// localStorage helpers
// API key is no longer stored in localStorage.
// It is read from environment variables only.
// ─────────────────────────────────────────────

import type { Conversation, Settings } from '../types';

const CONVERSATIONS_KEY = 'nexusai_conversations';
const SETTINGS_KEY = 'nexusai_settings';

// ── Conversations ──────────────────────────

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations to localStorage:', e);
  }
}

// ── Settings ───────────────────────────────

export function loadSettings(): Partial<Settings> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

export function clearAllData(): void {
  localStorage.removeItem(CONVERSATIONS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}

// ── Export ──────────────────────────────────

export function exportConversationsJSON(conversations: Conversation[]): void {
  const blob = new Blob([JSON.stringify(conversations, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'nexusai-chats.json');
}

export function exportConversationText(conversation: Conversation): void {
  const lines = conversation.messages
    .filter(m => m.role !== 'system')
    .map(m => `[${m.role === 'user' ? 'You' : 'Assistant'}]\n${m.content}\n`);
  const blob = new Blob([lines.join('\n---\n\n')], { type: 'text/plain' });
  downloadBlob(blob, `${conversation.title || 'chat'}.txt`);
}

export function exportConversationMarkdown(conversation: Conversation): void {
  const lines = conversation.messages
    .filter(m => m.role !== 'system')
    .map(m => `### ${m.role === 'user' ? 'You' : 'Assistant'}\n\n${m.content}\n`);
  const blob = new Blob([`# ${conversation.title}\n\n${lines.join('\n---\n\n')}`], { type: 'text/markdown' });
  downloadBlob(blob, `${conversation.title || 'chat'}.md`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
