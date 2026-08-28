"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { MessageBubble } from "./MessageBubble";
import { useChatStore } from "@/store/chatStore";
import { useEffect, useRef } from "react";
import { MessageSquarePlus } from "lucide-react";

export function MessageList() {
  const { activeConversationId, isStreaming, streamingMessage } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useLiveQuery(
    () => {
      if (!activeConversationId) return [];
      return db.messages.where("conversationId").equals(activeConversationId).sortBy("createdAt");
    },
    [activeConversationId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-muted-fg)] bg-[var(--color-bg)]/50">
        <div className="bg-[var(--color-muted)] p-6 rounded-3xl shadow-sm border border-[var(--color-border)]/50 flex flex-col items-center max-w-sm text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
             <MessageSquarePlus className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-fg)] mb-2">Welcome to Tailwind AI</h3>
          <p className="text-sm">Select a conversation from the sidebar or start a new one to begin chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 pt-10 space-y-6">
      {messages?.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      
      {isStreaming && streamingMessage && (
        <MessageBubble
          message={{
            id: "streaming-temp",
            conversationId: activeConversationId,
            role: "assistant",
            content: streamingMessage,
            status: "pending",
            createdAt: Date.now(),
          }}
        />
      )}
      
      {isStreaming && !streamingMessage && (
        <div className="flex w-full justify-start mb-4">
          <div className="flex max-w-[85%] items-end gap-2 flex-row">
            <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center overflow-hidden bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm">
              <img src="/chatsvg.svg" alt="AI" className="h-full w-full object-contain p-1" />
            </div>
            <div className="bg-[var(--color-bg)] shadow-sm border border-[var(--color-border)] rounded-2xl rounded-bl-none px-5 py-4 flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-gradient-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gradient-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-gradient-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
