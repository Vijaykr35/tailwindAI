"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useEffect } from "react";
import { syncEngine } from "@/lib/sync/syncEngine";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Attempt to sync online/offline
    const handleOnline = () => syncEngine.pushOperations();
    window.addEventListener("online", handleOnline);
    
    // Initial sync check
    if (navigator.onLine) {
      syncEngine.pushOperations();
    }

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <main className="flex h-screen overflow-hidden bg-[var(--color-bg)] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--color-accent)]/5 via-[var(--color-bg)] to-[var(--color-bg)]">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full shadow-2xl z-10 rounded-l-3xl overflow-hidden border-l border-[var(--color-border)]/50">
        <MessageList />
        <ChatInput />
      </div>
    </main>
  );
}
