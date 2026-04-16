// ─────────────────────────────────────────────
// NexusAI — Input Bar (Skeuomorphic)
// ─────────────────────────────────────────────

import React, { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useSettingsStore } from '../store/settingsStore';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';

interface InputBarProps {
  onOpenSettings: () => void;
}

const InputBar: React.FC<InputBarProps> = ({ onOpenSettings }) => {
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const isGenerating = useChatStore((s) => s.isGenerating);
  const model = useSettingsStore((s) => s.model);

  // Accept suggestion from chips
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setTimeout(() => {
        if (e.detail.trim()) {
          sendUserMessage(e.detail.trim());
        }
      }, 100);
    };
    window.addEventListener('suggestion-selected' as string, handler as EventListener);
    return () => window.removeEventListener('suggestion-selected' as string, handler as EventListener);
  }, [sendUserMessage]);

  const handleSend = (message: string, files?: File[]) => {
    if (files && files.length > 0) {
      console.log('Prompt box files attached (not processed by backend yet):', files);
    }
    if (message.trim()) {
      sendUserMessage(message.trim());
    }
  };

  return (
    <div className="relative">
      {/* Subtle top gradient fade */}
      <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0a0c] to-transparent pointer-events-none z-10" />

      <div className="relative z-20 px-4 pb-4 pt-2 bg-[#0a0a0c]">
        <div className="max-w-4xl mx-auto">
          <div className="skeuo-panel rounded-2xl p-1">
            <PromptInputBox 
              onSend={handleSend}
              isLoading={isGenerating}
              placeholder="Type your message here..."
            />
          </div>

          {/* Model indicator */}
          <div className="flex items-center justify-center mt-3 px-1">
            <span className="text-[11px] text-gray-600">
              Using <span className="text-gray-500 font-medium">{model}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
