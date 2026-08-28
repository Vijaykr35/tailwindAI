const API_BASE_URL = "http://127.0.0.1:8080";

export const apiClient = {
  async fetchConversations() {
    const response = await fetch(`${API_BASE_URL}/conversations`);
    if (!response.ok) throw new Error("Failed to fetch conversations");
    return response.json();
  },

  async fetchHistory(threadId: string) {
    const response = await fetch(`${API_BASE_URL}/history/${threadId}`);
    if (!response.ok) throw new Error("Failed to fetch history");
    return response.json();
  },

  async uploadDocument(file: File, threadId: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("thread_id", threadId);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = "Failed to upload document";
      try {
        const errorData = await response.json();
        if (errorData.message) errorMsg = errorData.message;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    return response.json();
  },

  async streamChat(
    message: string,
    threadId: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (error: string) => void
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, thread_id: threadId }),
      });

      if (!response.ok) {
        throw new Error("Stream connection failed");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") {
              onDone();
              return;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                onError(data.error);
              } else if (data.token) {
                onToken(data.token);
              } else if (data.done) {
                onDone();
                return;
              }
            } catch (err) {
              console.error("Error parsing SSE data:", err);
            }
          }
        }
      }
      onDone();
    } catch (err: any) {
      onError(err.message || "Unknown streaming error");
    }
  },
};
