# Union Budget RAG Frontend

A modern React-based chat interface for document-based question answering with multi-language support, voice input/output, and real-time chat management.

## 🌐 Live Demo

**Hosted Application**: [https://union-budget-rag-frontend.vercel.app](https://union-budget-rag-frontend.vercel.app)

The frontend is connected to the hosted backend API at `https://hcl-test.onrender.com/api`

## Architecture

### Application Flow

```
User
  ↓
React App (Vite + TypeScript)
  ├── AuthContext (JWT management)
  ├── React Router (Route protection)
  └── React Query (API state management)
  ↓
API Client (axios-based)
  ↓
Backend API (Flask)
```

### Component Structure

**Pages**:
- `pages/Auth.tsx` - Login/Register
- `pages/Index.tsx` - Main chat interface
- `pages/NotFound.tsx` - 404 page

**Chat Components**:
- `components/chat/ChatArea.tsx` - Message display area
- `components/chat/ChatInput.tsx` - Message input with voice support
- `components/chat/ChatSidebar.tsx` - Conversation list
- `components/chat/ChatMessage.tsx` - Individual message rendering
- `components/chat/MarkdownContent.tsx` - Markdown rendering
- `components/chat/TypingIndicator.tsx` - Loading states

**Services**:
- `services/authService.ts` - Authentication API calls
- `services/chatService.ts` - Chat API calls

**Hooks**:
- `hooks/useChat.ts` - Chat state management
- `hooks/useSpeechRecognition.ts` - Voice input
- `hooks/useSpeechSynthesis.ts` - Voice output
- `hooks/useTheme.ts` - Dark/light theme

### Data Flow

```
1. User sends message (text/voice)
   ↓
2. useChat hook → chatService.sendMessage()
   ↓
3. API Client → POST /api/chats/{id}/message
   ↓
4. Backend processes (RAG pipeline)
   ↓
5. Response received → Update React Query cache
   ↓
6. UI updates (message displayed)
   ↓
7. Optional: Text-to-speech (if enabled)
```

### Key Features

- **Real-time Chat**: React Query for efficient state management
- **Voice Input/Output**: Web Speech API integration
- **Multi-language**: Automatic language detection and display
- **Markdown Rendering**: Rich text message formatting
- **Theme Support**: Dark/light mode toggle
- **Responsive Design**: Mobile-friendly UI with shadcn/ui components

## Setup

### Prerequisites

- Node.js 18+ (or Bun)
- npm/yarn/bun

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   # or
   bun install
   ```

2. **Configure API endpoint** (edit `src/lib/api.ts`):
   ```typescript
   const API_BASE_URL = 'http://localhost:4000/api';
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

App runs at `http://localhost:5173`

## 🌐 Production Deployment

The frontend is deployed on **Vercel**:
- **Live Application**: [https://union-budget-rag-frontend.vercel.app](https://union-budget-rag-frontend.vercel.app)
- **Backend API**: [https://hcl-test.onrender.com/api](https://hcl-test.onrender.com/api)

### Build for Production

```bash
npm run build
# or
bun run build
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Voice**: Web Speech API
- **Styling**: Tailwind CSS

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/              # Login/Register forms
│   │   ├── chat/              # Chat UI components
│   │   └── ui/                # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── hooks/
│   │   ├── useChat.ts         # Chat state management
│   │   ├── useSpeechRecognition.ts
│   │   └── useSpeechSynthesis.ts
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   └── chatService.ts
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Utilities
│   └── App.tsx                # Root component
├── public/                    # Static assets
└── package.json
```

## Features

- **Authentication**: JWT-based login/register
- **Chat Management**: Create, list, delete conversations
- **Message Display**: Markdown rendering with source citations
- **Voice Input**: Speech-to-text for queries
- **Voice Output**: Text-to-speech for responses
- **Language Detection**: Automatic language display
- **Theme Toggle**: Dark/light mode
- **Responsive**: Mobile and desktop support