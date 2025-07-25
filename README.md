# Duonest Frontend

A real-time chat application built with React, TypeScript, and Socket.io for seamless communication between users.

## Features

### 🚀 Core Chat Features

- **Real-time messaging** - Instant message delivery using Socket.io
- **Voice messages** - Record and send voice notes with waveform visualization
- **Room-based chat** - Create or join specific chat rooms
- **Message status tracking** - Visual check marks (✓✓) with colors for sent/delivered/seen
- **Live typing indicators** - Real-time typing status and content preview
- **User presence** - Online/offline status for participants

### 👥 User Management

- **Auto user ID generation** - Seamless user creation without registration
- **Room participant tracking** - See who's currently in the room
- **Recent chats** - Persistent history of visited rooms with timestamps

### 🎨 User Interface

- **Dark/Light mode** - Automatic theme switching support
- **Responsive design** - Works on desktop and mobile devices
- **Room sharing** - Easy room invitation system
- **Connection status** - Visual indicators for network connectivity
- **Audio waveform** - Visual representation of voice message content
- **WhatsApp-style UI** - Familiar chat interface with modern design

### 📱 Advanced Features

- **Optimistic UI updates** - Instant message display with status progression
- **Message persistence** - Chat history loaded when rejoining rooms
- **Rate limiting handling** - Graceful handling of API rate limits
- **Auto-reconnection** - Automatic socket reconnection on network issues
- **Voice recording** - Built-in microphone recording with duration display
- **Audio playback** - Play voice messages with progress tracking
- **Real-time status sync** - Automatic message status updates without page refresh

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000` (default)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd duonest-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (optional):

```bash
# Create .env file
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/           # HTTP client and API endpoints
├── components/    # Reusable React components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── types/         # TypeScript type definitions
└── main.tsx       # Application entry point
```

### Key Components

- **HomePage** - Landing page with room creation/joining
- **ChatPage** - Main chat interface with real-time messaging
- **UserPage** - User dashboard and management
- **MessageInput** - Input component with live typing and voice recording
- **MessageList** - Message display with status indicators and voice playback
- **AudioPlayer** - Voice message player with waveform visualization
- **VoiceRecorder** - Voice recording component with real-time feedback
- **MessageStatus** - Visual status indicators with colored check marks
- **RecentChats** - Persistent chat history

### Core Hooks

- **useSocket** - Socket.io connection and real-time features
- **useToast** - Toast notification system
- **useRecentChats** - Local storage chat history
- **useTheme** - Dark/light mode management
- **useVoiceRecorder** - Voice recording functionality with WebRTC API

## Usage

### Starting a New Chat

1. Click "🚀 Start New Chat" on the homepage
2. You'll be automatically assigned a user ID and room
3. Share the room ID with others to invite them

### Joining an Existing Room

1. Enter a room ID on the homepage
2. Click "Join" to enter the room
3. Start chatting instantly

### Message Features

- **Send text messages** - Type and press Enter or click Send
- **Send voice messages** - Hold microphone button to record, release to send
- **Live typing** - See what others are typing in real-time
- **Message status** - Visual check marks showing sent (✓), delivered (✓✓), and seen (blue ✓✓)
- **Voice playback** - Click play button to listen to voice messages with waveform progress
- **Room sharing** - Use the share button to invite others

### Voice Message Features

- **Record audio** - Press and hold the microphone button
- **Real-time duration** - See recording time while recording
- **Waveform display** - Visual representation of audio content
- **Duration display** - Shows total duration when not playing, current time when playing
- **Progress tracking** - Waveform bars fill as audio plays
- **Click to seek** - Click anywhere on waveform to jump to that position

## Configuration

### Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)
- `VITE_SOCKET_URL` - Socket.io server URL (default: http://localhost:3000)

### Backend Requirements

The frontend expects a backend server with the following endpoints:

#### REST API Endpoints
- `GET /api/generate-user-id` - Generate new user ID
- `POST /api/u/:userId/create-room` - Create new chat room
- `POST /api/c/:roomId/join` - Join existing room
- `GET /api/c/:roomId` - Get room information
- `GET /api/c/:roomId/messages` - Get room messages
- `POST /api/voice-message` - Upload voice message (multipart/form-data)

#### Static File Serving
- `GET /uploads/voice/:filename` - Serve voice message files with CORS headers

#### Socket.io Events
- `chat-message` - Real-time text message delivery
- `voice-message` - Real-time voice message notification
- `message-seen` - Message read receipt updates
- `typing` - Typing indicator events
- `user-joined` / `user-left` - User presence updates

## Browser Support

- Chrome/Edge 88+ (Required for voice recording)
- Firefox 85+ (Required for voice recording)
- Safari 14+ (Required for voice recording)
- Mobile browsers with WebSocket and WebRTC support

### Voice Message Requirements
- Microphone access permission
- WebRTC MediaRecorder API support
- Modern browser with getUserMedia() support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request
