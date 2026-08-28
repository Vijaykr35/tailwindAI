import { create } from "zustand";

interface ChatState {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  isStreaming: boolean;
  setIsStreaming: (isStreaming: boolean) => void;
  streamingMessage: string;
  setStreamingMessage: (msg: string | ((prev: string) => string)) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  isStreaming: false,
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  streamingMessage: "",
  setStreamingMessage: (msg) =>
    set((state) => ({
      streamingMessage: typeof msg === "function" ? msg(state.streamingMessage) : msg,
    })),
}));
