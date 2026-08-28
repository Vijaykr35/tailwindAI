export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  audioBlobRef?: string;
  status: "pending" | "sent" | "failed" | "synced";
  createdAt: number;
}

export interface SyncOp {
  id: string;
  type: "create_message" | "delete_message" | "rename_conversation";
  payload: any;
  attempts: number;
  createdAt: number;
}
