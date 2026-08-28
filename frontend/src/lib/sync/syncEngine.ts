import { db } from "../db/db";
import { apiClient } from "../api/client";
import { useChatStore } from "../../store/chatStore";

class SyncEngine {
  private syncing = false;

  async pushOperations() {
    if (this.syncing) return;
    this.syncing = true;

    try {
      const ops = await db.syncQueue.orderBy("createdAt").toArray();

      for (const op of ops) {
        try {
          if (op.type === "create_message") {
            const { message, conversationId } = op.payload;

            await new Promise<void>((resolve, reject) => {
              let fullResponse = "";
              useChatStore.getState().setIsStreaming(true);
              useChatStore.getState().setStreamingMessage("");

              apiClient.streamChat(
                message.content,
                conversationId,
                (token) => {
                  fullResponse += token;
                  useChatStore.getState().setStreamingMessage((prev) => prev + token);
                },
                async () => {
                  useChatStore.getState().setIsStreaming(false);
                  
                  if (fullResponse) {
                    try {
                      await db.messages.add({
                        id: crypto.randomUUID(),
                        conversationId,
                        role: "assistant",
                        content: fullResponse,
                        status: "synced",
                        createdAt: Date.now(),
                      });
                    } catch (e) {
                      console.warn("Failed to save assistant message to DB", e);
                    }
                  }
                  resolve();
                },
                (error) => {
                  console.error("Stream error:", error);
                  useChatStore.getState().setIsStreaming(false);
                  reject(new Error(error));
                }
              );
            });

            try {
              await db.messages.update(message.id, { status: "synced" });
            } catch (e) {
              console.warn("Failed to update message status", e);
            }
          }

          try {
            await db.syncQueue.delete(op.id);
          } catch (e) {
            console.warn("Failed to delete sync op", e);
          }
        } catch (error) {
          console.error("Failed to sync op", op, error);
          try {
            await db.syncQueue.update(op.id, { attempts: op.attempts + 1 });
          } catch (e) {
            console.warn("Failed to update sync op attempts", e);
          }
        }
      }
    } catch (e) {
      console.warn("Database access error in pushOperations:", e);
    } finally {
      this.syncing = false;
    }
  }

  async queueMessage(conversationId: string, content: string) {
    const msgId = crypto.randomUUID();
    
    try {
      await db.messages.add({
        id: msgId,
        conversationId,
        role: "user",
        content,
        status: "pending",
        createdAt: Date.now(),
      });

      await db.syncQueue.add({
        id: crypto.randomUUID(),
        type: "create_message",
        payload: { conversationId, message: { id: msgId, content } },
        attempts: 0,
        createdAt: Date.now(),
      });
    } catch (e) {
      console.warn("Database access error in queueMessage:", e);
      // Fallback: Try to sync immediately without DB persistence
      this.syncDirectly(conversationId, content);
      return;
    }

    this.pushOperations();
  }

  private async syncDirectly(conversationId: string, content: string) {
    let fullResponse = "";
    useChatStore.getState().setIsStreaming(true);
    useChatStore.getState().setStreamingMessage("");

    apiClient.streamChat(
      content,
      conversationId,
      (token) => {
        fullResponse += token;
        useChatStore.getState().setStreamingMessage((prev) => prev + token);
      },
      () => {
        useChatStore.getState().setIsStreaming(false);
      },
      (error) => {
        console.error("Stream error:", error);
        useChatStore.getState().setIsStreaming(false);
      }
    );
  }
}

export const syncEngine = new SyncEngine();
