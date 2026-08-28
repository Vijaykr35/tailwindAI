# Tailwind AI

Tailwind AI is a fast, local-first AI chatbot built with a modern technology stack. It is designed to provide a premium, privacy-focused conversational experience with seamless integrations for Document AI (RAG) and voice input.

## 🚀 Features

- **Premium UI/UX**: A sleek, dark-mode-first glassmorphic design built with Tailwind CSS, featuring beautiful gradients, micro-animations, and markdown rendering.
- **RAG (Retrieval-Augmented Generation)**: Upload PDF, DOCX, TXT, MD, PY, or CSV files to chat directly with your documents.
- **Streaming Responses**: Real-time token streaming using Server-Sent Events (SSE) for a fast and engaging chat experience.
- **Agentic Capabilities**: The backend leverages LangGraph and LangChain to provide tool-use and complex conversational capabilities powered by Google's Gemini models.
- **Voice Support**: Integrated voice recording for hands-free prompt input.

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Database**: Local IndexedDB for conversations and messages
- **Icons**: Lucide React
- **State Management**: Zustand (`useChatStore`)

### Backend (Server)
- **Framework**: FastAPI (Python)
- **AI Framework**: LangChain & LangGraph
- **LLM Models**: Google Gemini (e.g., `gemini-2.5-flash` for chat, `models/gemini-embedding-2` for embeddings)
- **Vector Storage**: Used for local document embeddings.
- **Database**: Handles robust backend document parsing and conversation tracking.

## 📦 Getting Started

### Prerequisites
- Node.js & npm (for the frontend)
- Python 3.10+ (for the backend)
- A Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory.
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure your `.env` file is configured with the necessary API keys (e.g., `GEMINI_API_KEY`).
4. Start the FastAPI server:
   ```bash
   python app.py
   # Or: uvicorn app:app --host 0.0.0.0 --port 8080 --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

## 🎨 Theme Customization
The app currently supports a highly polished "Midnight Dark" mode. Theme customization can be adjusted in `frontend/src/app/globals.css`.

