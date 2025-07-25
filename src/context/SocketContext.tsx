import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (
    roomId: string,
    message: string,
    userId: string,
    tempId?: number | string
  ) => void;
  markMessageDelivered: (messageId: string) => void;
  markMessageSeen: (messageId: string, userId: string) => void;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    setIsConnecting(true);
    setConnectionError(null);

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError("Connection lost");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError("Failed to connect to server");
    });

    // Listen for presence updates
    newSocket.on("user-online", (userId: string) => {
      console.log("User came online:", userId);
      setOnlineUsers((prev) => [...prev.filter((id) => id !== userId), userId]);
    });

    newSocket.on("user-offline", (userId: string) => {
      console.log("User went offline:", userId);
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    newSocket.on("online-users", (users: string[]) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit("join-room", roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      console.log("Leaving socket room:", roomId);
      socket.emit("leave-room", roomId);
    }
  };

  const sendMessage = (
    roomId: string,
    message: string,
    userId: string,
    tempId?: number | string
  ) => {
    if (socket) {
      console.log("Sending message:", { roomId, message, userId, tempId });
      socket.emit("chat-message", {
        roomId,
        message,
        userId,
        tempId,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const markMessageDelivered = (messageId: string) => {
    if (socket) {
      socket.emit("message-delivered", { messageId });
    }
  };

  const markMessageSeen = (messageId: string, userId: string) => {
    if (socket) {
      console.log("Emitting message-seen:", { messageId, userId });
      socket.emit("message-seen", { messageId, userId });
    }
  };

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    connectionError,
    joinRoom,
    leaveRoom,
    sendMessage,
    markMessageDelivered,
    markMessageSeen,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext };
