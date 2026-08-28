"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Square, Paperclip, X, FileText, Loader2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { syncEngine } from "@/lib/sync/syncEngine";
import { useVoiceRecorder } from "../voice/useVoiceRecorder";
import { apiClient } from "@/lib/api/client";

export function ChatInput() {
  const [text, setText] = useState("");
  const { activeConversationId, isStreaming } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { isRecording, startRecording, stopRecording, supported } = useVoiceRecorder((transcript) => {
    setText((prev) => prev + (prev && !prev.endsWith(" ") ? " " : "") + transcript);
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = async () => {
    if ((!text.trim() && !selectedFile) || !activeConversationId || isStreaming || isUploading) return;
    
    let success = true;

    if (selectedFile) {
      try {
        setIsUploading(true);
        await apiClient.uploadDocument(selectedFile, activeConversationId);
      } catch (error) {
        console.error("Failed to upload file:", error);
        success = false;
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }

    if (success) {
      if (text.trim()) {
        const messageContent = text.trim();
        setText("");
        await syncEngine.queueMessage(activeConversationId, messageContent);
      } else if (selectedFile) {
        await syncEngine.queueMessage(activeConversationId, `I have uploaded a document: ${selectedFile.name}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (!activeConversationId) return null;

  return (
    <div className="p-4 bg-transparent pb-6 w-full">
      <div className="flex flex-col w-full max-w-4xl mx-auto rounded-3xl border border-[var(--color-border)]/50 bg-[var(--color-bg)]/80 backdrop-blur-md shadow-lg focus-within:shadow-xl focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 transition-all duration-300 overflow-hidden">
        {selectedFile && (
          <div className="flex items-center gap-2 px-3 py-2 mx-2 mt-2 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] self-start max-w-[80%] animate-in fade-in slide-in-from-bottom-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="text-xs truncate text-[var(--color-fg)] font-medium">{selectedFile.name}</span>
            <button 
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }} 
              className="p-1 hover:bg-[var(--color-muted-fg)] hover:text-white rounded-full transition-colors ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="relative flex items-end w-full">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          className="w-full max-h-[120px] bg-transparent resize-none py-4 pl-5 pr-14 focus:outline-none scrollbar-hide text-sm"
          rows={1}
          disabled={isStreaming}
        />
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.docx,.txt,.md,.py,.csv"
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || isUploading}
            className={`p-2 rounded-full transition-colors text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-border)]`}
            title="Attach File"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          
          {supported && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-full transition-colors ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-border)]"
              }`}
              title={isRecording ? "Stop Recording" : "Start Recording"}
              disabled={isStreaming}
            >
              {isRecording ? <Square className="h-4 w-4" fill="currentColor" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={(!text.trim() && !selectedFile) || isStreaming || isUploading}
            className={`p-2 rounded-full transition-all duration-200 shadow-sm ${
              (text.trim() || selectedFile) && !isStreaming && !isUploading
                ? "bg-gradient-primary text-white hover:opacity-90 hover:scale-105 hover:shadow-md"
                : "text-[var(--color-muted-fg)] bg-[var(--color-muted)] cursor-not-allowed"
            }`}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
