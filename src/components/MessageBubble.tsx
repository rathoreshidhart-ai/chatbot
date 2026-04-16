// ─────────────────────────────────────────────
// PRD Section 3.2 — Message Bubble
// Individual message renderer with Markdown
// ─────────────────────────────────────────────

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { Components } from 'react-markdown';
import type { Message } from '../types';
import CodeBlock from './CodeBlock';
import FallbackCard from './FallbackCard';
import { formatTimestamp } from '../lib/utils';
import { useSettingsStore } from '../store/settingsStore';

interface MessageBubbleProps {
  message: Message;
}

// Loading dots animation
const LoadingDots = () => (
  <div className="flex items-center gap-1.5 py-2" aria-label="AI is thinking">
    <div className="w-2 h-2 rounded-full bg-violet-400/60 animate-bounce-dot" style={{ animationDelay: '0s' }} />
    <div className="w-2 h-2 rounded-full bg-violet-400/60 animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
    <div className="w-2 h-2 rounded-full bg-violet-400/60 animate-bounce-dot" style={{ animationDelay: '0.4s' }} />
  </div>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const showTimestamps = useSettingsStore((s) => s.showTimestamps);
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming && message.content === '';

  // Markdown component overrides
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match && !className;

      if (isInline) {
        return (
          <code
            className="px-1.5 py-0.5 rounded bg-bg-surface text-text-code font-mono text-[0.9em] border border-border"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <CodeBlock language={match ? match[1] : ''}>
          {String(children).replace(/\n$/, '')}
        </CodeBlock>
      );
    },
    // Style other markdown elements
    h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-text-primary">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-2 text-text-primary">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-text-primary">{children}</h3>,
    p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 ml-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 ml-1">{children}</ol>,
    li: ({ children }) => <li className="text-text-primary leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent-primary/50 pl-4 my-3 italic text-text-secondary">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-secondary hover:text-accent-primary underline decoration-accent-secondary/30
                   hover:decoration-accent-primary transition-colors"
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-3">
        <table className="w-full border-collapse border border-border text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-bg-surface">{children}</thead>,
    th: ({ children }) => (
      <th className="border border-border px-3 py-2 text-left font-semibold text-text-primary">{children}</th>
    ),
    td: ({ children }) => (
      <td className="border border-border px-3 py-2 text-text-primary">{children}</td>
    ),
    hr: () => <hr className="border-border my-4" />,
    strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  };

  return (
    <div
      className={`flex gap-4 px-4 md:px-8 lg:px-16 py-5 animate-fade-in
        ${isUser ? 'justify-end' : 'justify-start'}`}
      role="article"
      aria-label={`${isUser ? 'Your' : 'Assistant'} message`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-700/20
                       flex items-center justify-center mt-1 shadow-inner">
          <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
      )}

      {/* Message content */}
      <div className={`max-w-[85%] md:max-w-[75%] lg:max-w-[65%] min-w-0 ${isUser ? 'order-first' : ''}`}>
        {/* Sender label */}
        <div className={`flex items-center gap-2 mb-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {showTimestamps && (
            <span className="text-xs text-text-secondary/60">
              {formatTimestamp(message.timestamp)}
            </span>
          )}
        </div>

        {/* Message body */}
        <div
          className={`rounded-2xl px-5 py-3.5 text-chat leading-[1.65]
            ${isUser
              ? 'skeuo-panel text-gray-200 rounded-tr-sm'
              : 'bg-transparent text-gray-200'
            }`}
        >
          {isStreaming ? (
            <LoadingDots />
          ) : message.content ? (
            <div className={`prose prose-invert max-w-none${message.isStreaming ? ' streaming-prose' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : null}

          {/* Fallback Card (PRD Section 3.6) */}
          {message.fallback?.triggered && (
            <FallbackCard fallback={message.fallback} />
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-700/20
                       flex items-center justify-center mt-1 shadow-inner">
          <svg className="w-5 h-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
