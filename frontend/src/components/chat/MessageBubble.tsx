import { Message } from "@/types";
import { Check, CheckCheck, Clock, AlertCircle, User } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[85%] items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center overflow-hidden ${isUser ? 'bg-gradient-primary text-white shadow-md' : 'bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm'}`}>
          {isUser ? (
            <User className="h-5 w-5" />
          ) : (
            <img src="/chatsvg.svg" alt="AI" className="h-full w-full object-contain p-1" />
          )}
        </div>
        <div
          className={`rounded-3xl px-5 py-3 flex flex-col shadow-sm ${
            isUser
              ? "bg-gradient-primary text-white rounded-br-sm shadow-md"
              : "bg-[var(--color-bg)] text-[var(--color-fg)] rounded-bl-sm border border-[var(--color-border)]/50"
          }`}
        >
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</div>
          
          {isUser && (
            <div className="flex justify-end mt-1 items-center gap-1 opacity-70">
              {message.status === "pending" && <Clock className="h-3 w-3" />}
              {message.status === "sent" && <Check className="h-3 w-3" />}
              {message.status === "synced" && <CheckCheck className="h-3 w-3" />}
              {message.status === "failed" && <AlertCircle className="h-3 w-3 text-red-300" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
