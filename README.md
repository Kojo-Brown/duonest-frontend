# Duonest Frontend

A real-time chat application built with React, TypeScript, and Socket.io for seamless communication between users.

## Features

### 🚀 Core Chat Features

- **Real-time messaging** - Instant message delivery using Socket.io
- **Room-based chat** - Create or join specific chat rooms
- **Message status tracking** - See when messages are sent, delivered, and seen
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

### 📱 Advanced Features

- **Optimistic UI updates** - Instant message display with status progression
- **Message persistence** - Chat history loaded when rejoining rooms
- **Rate limiting handling** - Graceful handling of API rate limits
- **Auto-reconnection** - Automatic socket reconnection on network issues

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
- **MessageInput** - Input component with live typing
- **MessageList** - Message display with status indicators
- **RecentChats** - Persistent chat history

### Core Hooks

- **useSocket** - Socket.io connection and real-time features
- **useToast** - Toast notification system
- **useRecentChats** - Local storage chat history
- **useTheme** - Dark/light mode management

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

- **Send messages** - Type and press Enter or click Send
- **Live typing** - See what others are typing in real-time
- **Message status** - Track delivery and read receipts
- **Room sharing** - Use the share button to invite others

## Configuration

### Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)
- `VITE_SOCKET_URL` - Socket.io server URL (default: http://localhost:3000)

### Backend Requirements

The frontend expects a backend server with the following endpoints:

- `GET /api/generate-user-id` - Generate new user ID
- `POST /api/u/:userId/create-room` - Create new chat room
- `POST /api/c/:roomId/join` - Join existing room
- `GET /api/c/:roomId` - Get room information
- `GET /api/c/:roomId/messages` - Get room messages
- Socket.io events for real-time communication

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with WebSocket support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request
