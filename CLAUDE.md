# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an education platform hackathon project that aims to solve social challenges in education. The platform features:
- LLM-powered avatar chat for students
- Planned features: Teacher dashboard and student guidance agents
- Voice-based AI interaction with animated 3D avatar
- Real-time streaming responses with typewriter effect

## Technology Stack

- **Frontend Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with custom shadcn/ui-inspired components
- **3D Graphics**: Three.js for avatar rendering
- **LLM Integration**: SambaNova AI API with Llama-4-Maverick-17B-128E-Instruct model
- **Speech**: Browser Speech Recognition API

## Development Commands

```bash
npm run dev       # Start development server (http://localhost:5173)
npm run build     # Build for production
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Project Architecture

### Core Components

- **`src/components/avatar-chat-app.tsx`**: Main application component orchestrating the chat interface
- **`src/components/avatar-scene.tsx`**: 3D avatar rendering using Three.js
- **`src/components/mic-control.tsx`**: Speech recognition and microphone control
- **`src/components/chat-history.tsx`**: Message display with user/assistant differentiation

### Key Hooks

- **`src/hooks/use-speech-recognition.tsx`**: Manages browser speech recognition
- **`src/hooks/use-chat-messages.tsx`**: Manages chat state and message history
- **`src/hooks/use-toast.ts`**: Toast notification system

### LLM Integration

The LLM integration is handled through `src/lib/api.ts`:
- Uses SambaNova's streaming API endpoint
- Implements typewriter effect for natural text display (2 chars per 100ms)
- Handles streaming responses with proper chunk processing
- API key stored in `VITE_LLAMA_API_KEY` environment variable

### Environment Configuration

Create a `.env` file with:
```
VITE_LLAMA_API_KEY=your_api_key_here
```

## Current Implementation Status

**Implemented:**
- 3D avatar rendering with animation states (idle, talking)
- Voice input via speech recognition
- Streaming chat responses with typewriter effect
- Basic chat history UI
- Toast notifications for errors

**Not Yet Implemented:**
- Authentication system
- Teacher dashboard
- Student guidance agents
- Data persistence/database
- Testing framework
- Multi-language support

## Key Technical Details

### Streaming Response Handler
The API implements a sophisticated streaming handler that:
1. Receives chunks from SambaNova API
2. Buffers complete content while displaying progressively
3. Maintains readable display speed (2 characters per 100ms)
4. Properly handles stream completion signals

### Avatar States
The avatar system supports:
- `idle`: Default state when not speaking
- `talking`: Animated state during AI response
- Visual feedback synchronized with streaming responses

### Component Communication
- Uses React context for theme management
- Callback props for inter-component communication
- Custom hooks for shared logic and state management

## Important Considerations

- No authentication is currently implemented - add before production deployment
- API key is exposed to client - consider implementing a backend proxy
- No data persistence - messages are lost on refresh
- Speech recognition requires HTTPS in production
- Three.js performance considerations for lower-end devices

## File Structure Patterns

```
src/
├── components/         # React components
│   └── ui/            # Reusable UI primitives
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and API
└── assets/            # Static assets
```

Path aliases configured:
- `@/` maps to `src/`
- Use absolute imports: `import { Button } from "@/components/ui/button"`