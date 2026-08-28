"use client";

import { useState, useRef, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { PlusCircle, MessageSquare, Trash2, Bot, Edit2, Check, X, LogOut } from "lucide-react";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

export function Sidebar() {
  const conversations = useLiveQuery(() =>
    db.conversations.orderBy("updatedAt").reverse().toArray()
  );
  const { activeConversationId, setActiveConversationId } = useChatStore();
  const logout = useAuthStore((state) => state.logout);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleNewChat = async () => {
    const id = crypto.randomUUID();
    await db.conversations.add({
      id,
      title: "New Conversation",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    });
    setActiveConversationId(id);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.messages.where("conversationId").equals(id).delete();
    await db.conversations.delete(id);
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const startEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveEdit = async (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      await db.conversations.update(id, { title: editTitle.trim(), updatedAt: Date.now() });
    }
    setEditingId(null);
  };

  const cancelEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="w-72 border-r border-transparent bg-transparent flex flex-col h-full relative z-0">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-bg)] rounded-xl shadow-md border border-[var(--color-border)] p-1">
            <img src="/chatsvg.svg" alt="App Logo" className="h-7 w-7 object-contain" />
          </div>
          <h2 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-fg)] to-[var(--color-muted-fg)]">Tailwind AI</h2>
        </div>
        <button
          onClick={handleNewChat}
          className="bg-gradient-primary text-white hover:opacity-90 transition-all p-2 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          title="New Chat"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {conversations?.map((conv) => (
          <div
            key={conv.id}
            onClick={() => {
              if (editingId !== conv.id) setActiveConversationId(conv.id);
            }}
            className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${
              activeConversationId === conv.id
                ? "bg-[var(--color-bg)] shadow-md border border-[var(--color-border)]/50"
                : "hover:bg-[var(--color-bg)]/40 border border-transparent"
            }`}
          >
            {activeConversationId === conv.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-primary rounded-l-xl" />
            )}
            
            {editingId === conv.id ? (
              <div className="flex items-center gap-2 w-full z-10 ml-1">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(conv.id, e);
                    if (e.key === "Escape") cancelEdit(e);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[var(--color-muted)] text-sm px-2 py-1 rounded border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)]"
                />
                <button onClick={(e) => saveEdit(conv.id, e)} className="text-green-500 hover:opacity-80"><Check className="h-4 w-4" /></button>
                <button onClick={(e) => cancelEdit(e)} className="text-red-500 hover:opacity-80"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 overflow-hidden ml-1 z-10">
                  <MessageSquare className={`h-4 w-4 shrink-0 transition-colors ${activeConversationId === conv.id ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted-fg)]'}`} />
                  <span className={`truncate text-sm transition-colors ${activeConversationId === conv.id ? 'font-semibold text-[var(--color-fg)]' : 'font-medium text-[var(--color-muted-fg)] group-hover:text-[var(--color-fg)]'}`}>{conv.title}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => startEditing(conv.id, conv.title, e)}
                    className="p-1 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
                    title="Rename"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-1 text-[var(--color-muted-fg)] hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {!conversations?.length && (
          <div className="text-sm text-[var(--color-muted-fg)] text-center mt-10">
            No conversations yet.
          </div>
        )}
      </div>

      <div className="p-5 border-t border-[var(--color-border)]/30 backdrop-blur-sm flex flex-col gap-4">
        <ThemeSwitcher />
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-muted-fg)] hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all font-medium text-sm"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
