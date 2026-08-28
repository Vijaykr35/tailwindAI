import Dexie, { type Table } from "dexie";
import { Conversation, Message, SyncOp } from "@/types";

export class ChatDatabase extends Dexie {
  conversations!: Table<Conversation, string>;
  messages!: Table<Message, string>;
  syncQueue!: Table<SyncOp, string>;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      conversations: "id, updatedAt",
      messages: "id, conversationId, createdAt, status",
      syncQueue: "id, createdAt",
    });
  }
}

export const db = new ChatDatabase();
