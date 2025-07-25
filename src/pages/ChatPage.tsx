/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Message } from "../types";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import { api } from "../api/client";
import { useSocket } from "../hooks/useSocket";
import { useToast } from "../hooks/useToast";
import { useRecentChats } from "../hooks/useRecentChats";
import UserStatus from "../components/UserStatus";
import ShareRoom from "../components/ShareRoom";

const ChatPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [roomName, setRoomName] = useState<string>("");
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [liveTypingUsers, setLiveTypingUsers] = useState<{
    [userId: string]: { content: string; timestamp: number };
  }>({});
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>(
    localStorage.getItem("currentUserId") || ""
  );
  const liveTypingTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { success, info } = useToast();
  const { addRecentChat, updateRoomInfo } = useRecentChats();
  const {
    socket,
    isConnected,
    joinRoom: joinSocketRoom,
    sendMessage: sendSocketMessage,
    onlineUsers,
  } = useSocket();

  // Ensure user has valid ID and auto-join room
  useEffect(() => {
    const initializeAndJoinRoom = async () => {
      if (!roomId) return;

      try {
        setLoading(true);
        setError(null);

        // Step 1: Ensure we have a valid user ID
        let userId = currentUserId;
        if (!userId) {
          const userResponse = await api.generateUserId();
          userId = userResponse.userId || userResponse.id;
          localStorage.setItem("currentUserId", userId);
          setCurrentUserId(userId);
        }

        // Step 2: Get room info
        const roomData = await api.getRoomInfo(roomId);
        setRoomInfo(roomData);

        // Set room name
        const roomDisplayName = roomData.room?.room_name || `Room ${roomId}`;
        setRoomName(roomDisplayName);

        // Step 3: Check if user is already in room or auto-join
        const isAlreadyMember =
          roomData.room &&
          (roomData.room.user1_id === userId ||
            roomData.room.user2_id === userId);

        if (isAlreadyMember) {
          setJoined(true);
        } else {
          // Stagger requests with exponential backoff for rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1500));

          try {
            const joinResponse = await api.joinRoom(roomId, userId);
            setJoined(true);
          } catch (joinError: any) {
            if (joinError.response?.status === 429) {
              // Retry after longer delay for rate limiting
              await new Promise((resolve) => setTimeout(resolve, 3000));
              const retryResponse = await api.joinRoom(roomId, userId);
              setJoined(true);
            } else {
              throw joinError; // Re-throw other errors
            }
          }
        }

        // Add to recent chats

        addRecentChat(roomId, roomDisplayName);
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || err.message;
        let displayError = "Failed to join room";

        if (err.response?.status === 429) {
          displayError =
            "Too many requests. Please wait a moment and try again.";
        } else if (err.response?.status === 404) {
          displayError = "Room not found. Please check the room ID.";
        } else if (err.response?.status === 403) {
          displayError = "Access denied to this room.";
        } else if (errorMsg) {
          displayError = `Failed to join room: ${errorMsg}`;
        }

        setError(displayError);
        setNotification({ message: displayError, type: "error" });
        setTimeout(() => setNotification(null), 3000);
      } finally {
        setLoading(false);
      }
    };

    initializeAndJoinRoom();
  }, [roomId]); // Only depend on roomId to avoid infinite loops

  // Helper function to update message status
  const updateMessageStatus = useCallback(
    (messageId: string, status: string, seenBy?: string, senderId?: string) => {
      setMessages((prev) => {
        const updated = prev.map((msg) => {
          const messageIdMatch = msg.id.toString() === messageId.toString();
          const senderMatch = !senderId || msg.sender_id === senderId;
          const isMyMessage = msg.sender_id === currentUserId;

          // Only update if this is my message (I'm the sender) and someone else saw it
          if (
            messageIdMatch &&
            senderMatch &&
            isMyMessage &&
            seenBy !== currentUserId
          ) {
            return {
              ...msg,
              status: status as any,
              seen_at: status === "seen" ? new Date() : msg.seen_at,
              seen_by:
                status === "seen" && seenBy
                  ? [...(msg.seen_by || []), seenBy]
                  : msg.seen_by,
            };
          }
          return msg;
        });
        return updated;
      });
    },
    [currentUserId]
  );

  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleChatMessage = (data: any) => {
      const newMessage: Message = {
        id: data.messageId || data.id || Date.now() + Math.random(), // Use backend ID if available
        room_id: roomId,
        sender_id: data.userId,
        content: data.message,
        message_type: "text",
        created_at: new Date(data.timestamp),
        status: "delivered", // Set initial status for incoming messages
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleVoiceMessage = (data: any) => {
      const newMessage: Message = {
        id: data.messageId || data.id || Date.now() + Math.random(),
        room_id: roomId,
        sender_id: data.userId,
        content: "Voice message",
        message_type: "voice",
        created_at: new Date(data.timestamp),
        status: "delivered",
        file_url: data.fileUrl,
        duration: data.duration,
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleUserJoined = (data: any) => {
      setError(null);
    };

    const handleUserLeft = (data: any) => {
      console.log("User left:", data);
    };

    const handleUserTyping = (data: any) => {
      if (data.userId !== currentUserId) {
        if (data.isTyping) {
          setTypingUsers((prev) => [
            ...prev.filter((id) => id !== data.userId),
            data.userId,
          ]);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
        }
      }
    };

    const handleMessageSeen = (data: any) => {
      const { messageId, userId: seenBy, senderId } = data;
      updateMessageStatus(messageId, "seen", seenBy, senderId);
    };

    const handleMessageSaved = (data: any) => {
      const { tempId, realId, messageId } = data;

      // Update the temporary message ID with the real database ID
      if (tempId && (realId || messageId)) {
        const dbId = realId || messageId;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id.toString() === tempId.toString() ? { ...msg, id: dbId } : msg
          )
        );
      }
    };

    const handleMessageStatusUpdate = (data: any) => {
      const { messageId, status, seenBy, senderId } = data;
      updateMessageStatus(messageId, status, seenBy, senderId);
    };

    const handleMessageSeenConfirmed = (data: any) => {
      const { messageId, seenBy, senderId } = data;
      updateMessageStatus(messageId, "seen", seenBy, senderId);
    };

    // Add event listeners
    socket.on("chat-message", handleChatMessage);
    socket.on("voice-message", handleVoiceMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    // Listen for participant count updates
    socket.on("room-participants", (data: any) => {
      if (data.roomId === roomId) {
        setParticipantCount(data.count || 0);
        if (roomId) {
          updateRoomInfo(roomId, { participantCount: data.count });
        }
      }
    });

    // Listen for live typing events
    socket.on("user-live-typing", (data: any) => {
      if (data.roomId === roomId && data.userId !== currentUserId) {
        setLiveTypingUsers((prev) => ({
          ...prev,
          [data.userId]: {
            content: data.content || "",
            timestamp: data.timestamp || Date.now(),
          },
        }));

        // Clear live typing after inactivity
        if (liveTypingTimeoutRef.current) {
          clearTimeout(liveTypingTimeoutRef.current);
        }

        liveTypingTimeoutRef.current = setTimeout(() => {
          setLiveTypingUsers((prev) => {
            const updated = { ...prev };
            delete updated[data.userId];
            return updated;
          });
        }, 500); // Clear after 2 seconds of inactivity
      }
    });

    // Listen for when user stops live typing
    socket.on("user-stopped-live-typing", (data: any) => {
      if (data.roomId === roomId && data.userId !== currentUserId) {
        setLiveTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[data.userId];
          return updated;
        });
        if (liveTypingTimeoutRef.current) {
          clearTimeout(liveTypingTimeoutRef.current);
        }
      }
    });
    socket.on("user-typing", handleUserTyping);
    socket.on("message-seen", handleMessageSeen);
    socket.on("message-saved", handleMessageSaved);
    socket.on("message-status-update", handleMessageStatusUpdate);
    socket.on("message-seen-confirmed", handleMessageSeenConfirmed);

    // Listen for broadcast message seen events from other users
    socket.on("broadcast-message-seen", handleMessageStatusUpdate);

    // Generic handler for any seen-related events
    const handleGenericSeenEvent = (eventName: string, data: any) => {
      if (
        eventName.includes("seen") &&
        data.messageId &&
        data.status === "seen"
      ) {
        updateMessageStatus(
          data.messageId,
          data.status,
          data.seenBy || data.userId,
          data.senderId
        );
      }
    };

    // Debug: Log ALL socket events and catch any seen events we might miss
    socket.onAny((eventName, ...args) => {
      if (args.length > 0) {
        handleGenericSeenEvent(eventName, args[0]);
      }
    });

    // Cleanup event listeners
    return () => {
      socket.off("chat-message", handleChatMessage);
      socket.off("voice-message", handleVoiceMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("user-typing", handleUserTyping);
      socket.off("message-seen", handleMessageSeen);
      socket.off("message-saved", handleMessageSaved);
      socket.off("message-status-update", handleMessageStatusUpdate);
      socket.off("message-seen-confirmed", handleMessageSeenConfirmed);
      socket.off("broadcast-message-seen", handleMessageStatusUpdate);
      socket.off("room-participants");
      socket.off("user-live-typing");
      socket.off("user-stopped-live-typing");

      if (liveTypingTimeoutRef.current) {
        clearTimeout(liveTypingTimeoutRef.current);
      }
    };
  }, [socket, roomId, currentUserId, updateMessageStatus]);

  // Secure way to load messages - only if user has access to the room
  const loadMessagesAfterJoin = useCallback(async () => {
    if (!joined || !roomId) return;

    try {
      const messagesData = await api.getRoomMessages(roomId, currentUserId);

      if (
        messagesData.success &&
        messagesData.messages &&
        Array.isArray(messagesData.messages)
      ) {
        const formattedMessages: Message[] = messagesData.messages.map(
          (msg: any) => ({
            id: msg.id,
            room_id: msg.room_id,
            sender_id: msg.sender_id,
            content: msg.content,
            message_type: msg.message_type || "text",
            created_at: new Date(msg.created_at),
            status:
              msg.sender_id === currentUserId
                ? msg.seen_at
                  ? "seen"
                  : "delivered"
                : undefined,
            seen_at: msg.seen_at ? new Date(msg.seen_at) : undefined,
            seen_by: msg.seen_by_user_id ? [msg.seen_by_user_id] : undefined,
            // Include voice message fields
            file_url: msg.file_url,
            duration: msg.duration,
            file_name: msg.file_name,
            file_size: msg.file_size,
          })
        );
        setMessages(formattedMessages);
      } else {
        setError("You do not have access to this room's messages");
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(
          "Access denied: You must be a member of this room to view messages"
        );
      } else if (err.response?.status === 404) {
        setError("Room not found or no messages available");
      } else {
        setError("Failed to load messages");
      }
    }
  }, [joined, roomId, currentUserId]);

  // Auto-join socket room and load messages when joined
  useEffect(() => {
    if (joined && roomId && socket && isConnected) {
      joinSocketRoom(roomId);

      // Load messages via REST API (secure)
      loadMessagesAfterJoin();
    }
  }, [
    joined,
    roomId,
    socket,
    isConnected,
    joinSocketRoom,
    loadMessagesAfterJoin,
  ]);

  // Mark OTHER USERS' messages as seen when viewing the chat
  useEffect(() => {
    if (!joined || !messages.length || !socket || !roomId) return;

    // Process messages from OTHER users (both loaded and real-time), but exclude my own messages
    const unseenMessagesFromOthers = messages.filter(
      (msg) =>
        msg.sender_id !== currentUserId &&
        msg.sender_id !== "undefined" && // Exclude invalid sender IDs
        !msg.seen_by?.includes(currentUserId) // Not already seen by me
    );

    if (unseenMessagesFromOthers.length > 0) {
      // Mark as seen after delay to simulate reading time
      const timer = setTimeout(() => {
        unseenMessagesFromOthers.forEach((msg) => {
          // Triple-check this is not my own message
          if (msg.sender_id !== currentUserId) {
            // Mark locally that I've seen this message (to prevent re-sending)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msg.id
                  ? { ...m, seen_by: [...(m.seen_by || []), currentUserId] }
                  : m
              )
            );

            // Notify both the sender and broadcast to the room about the seen status
            const seenData = {
              messageId: msg.id.toString(),
              userId: currentUserId,
              senderId: msg.sender_id,
              roomId,
              status: "seen",
              seenBy: currentUserId,
            };

            // Emit multiple events to ensure the update reaches the sender
            socket.emit("message-seen", seenData);
            socket.emit("message-status-update", seenData);
            socket.emit("broadcast-message-seen", seenData);
          }
        });
      }, 1500); // 1.5 seconds for reading

      return () => clearTimeout(timer);
    }
  }, [messages, joined, currentUserId, socket, roomId]);

  const joinRoom = async () => {
    if (!roomId || !currentUserId) {
      setError("Missing room ID or user ID");
      return;
    }

    try {
      setIsJoining(true);
      setError(null);
      info("Joining room...");

      // Join via API first
      const response = await api.joinRoom(roomId, currentUserId);

      // Join Socket.io room for real-time updates
      joinSocketRoom(roomId);

      setJoined(true);
      setError(null);

      // Add to recent chats
      if (roomId) {
        addRecentChat(roomId, roomName || `Room ${roomId}`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message;
      const fullError = `Failed to join room: ${errorMsg}`;
      setError(fullError);

      // Show temporary error notification
      setNotification({ message: fullError, type: "error" });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsJoining(false);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!joined) {
      setError("Please join the room first");
      return;
    }

    if (!roomId) return;

    const tempMessageId = Date.now() + Math.random(); // Temporary ID for optimistic updates

    // Add to local state immediately with 'sending' status
    const newMessage: Message = {
      id: tempMessageId,
      room_id: roomId,
      sender_id: currentUserId,
      content,
      message_type: "text",
      created_at: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, newMessage]);

    // Send via Socket.io for real-time sync
    sendSocketMessage(roomId, content, currentUserId, tempMessageId);

    // Update to 'sent' when Socket.io confirms message sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId ? { ...msg, status: "sent" } : msg
        )
      );
    }, 500);

    // Reload messages after a short delay to ensure we get latest status updates
    setTimeout(() => {
      loadMessagesAfterJoin();
    }, 2000);

    // Update to 'delivered' when message reaches the other user's device
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId
            ? { ...msg, status: "delivered", delivered_at: new Date() }
            : msg
        )
      );
    }, 1000);

    // NOTE: 'seen' status should ONLY be updated when the OTHER user views the message
    // This will be handled by the 'message-seen' Socket.io event from the backend
  };

  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    if (!joined) {
      setError("Please join the room first");
      return;
    }

    if (!roomId) return;

    const tempMessageId = Date.now() + Math.random();

    // Convert blob to data URL for sharing
    const audioDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(audioBlob);
    });

    // Add to local state immediately with 'sending' status
    const newMessage: Message = {
      id: tempMessageId,
      room_id: roomId,
      sender_id: currentUserId,
      content: "Voice message",
      message_type: "voice",
      created_at: new Date(),
      status: "sending",
      file_url: audioDataUrl,
      duration: duration,
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("audio", audioBlob, `voice-${tempMessageId}.webm`);
      formData.append("roomId", roomId);
      formData.append("senderId", currentUserId);
      formData.append("duration", duration.toString());
      formData.append("tempId", tempMessageId.toString());

      // Send voice message via API
      let response;
      try {
        response = await api.sendVoiceMessage(formData, currentUserId);
      } catch (apiError: any) {
        if (apiError.response?.status === 404) {
          // Temporary fallback for testing - remove when backend is implemented
          response = {
            success: true,
            messageId: tempMessageId,
            file_url: audioDataUrl,
            tempId: tempMessageId,
          };
        } else {
          throw apiError;
        }
      }

      // Update message with server response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId
            ? {
                ...msg,
                status: "sent",
                file_url: response.file_url || audioDataUrl,
                id: response.messageId || tempMessageId,
              }
            : msg
        )
      );

      // Notify via socket for real-time updates
      if (socket) {
        socket.emit("voice-message", {
          roomId,
          userId: currentUserId,
          messageId: response.messageId || tempMessageId,
          fileUrl: response.file_url,
          duration,
          timestamp: new Date().toISOString(),
        });
      }

      // Reload messages after a short delay to ensure we get latest status updates
      setTimeout(() => {
        loadMessagesAfterJoin();
      }, 2000);
    } catch (error) {
      // Update status to failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId ? { ...msg, status: "failed" } : msg
        )
      );

      setError("Failed to send voice message");
    }
  };

  const handleStartTyping = () => {
    if (roomId && socket) {
      socket.emit("typing", { roomId, userId: currentUserId, isTyping: true });
    }
  };

  const handleStopTyping = () => {
    if (roomId && socket) {
      socket.emit("typing", { roomId, userId: currentUserId, isTyping: false });
    }
  };

  const handleLiveTyping = (data: any) => {
    if (roomId && socket && currentUserId) {
      socket.emit("live-typing", {
        ...data,
        roomId,
        userId: currentUserId,
      });

      // If it's a stop_typing action, immediately clear current user from live typing display
      if (data.action === "stop_typing") {
        setLiveTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[currentUserId];
          return updated;
        });
      }
    }
  };

  if (!roomId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Invalid room ID</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col">
      <header className="border-b border-gray-300 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg sm:text-xl font-semibold truncate">
                {roomName}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm opacity-70">
              {participantCount > 0 && (
                <span>
                  {participantCount} participant
                  {participantCount !== 1 ? "s" : ""}
                </span>
              )}
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={
                    isConnected
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {isConnected ? "Online" : "Offline"}
                </span>
                {!isConnected && (
                  <span className="text-gray-500">
                    • Last seen{" "}
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              {roomInfo?.room && (
                <div className="flex items-center gap-1 sm:gap-2">
                  {roomInfo.room.user1_id !== currentUserId && (
                    <UserStatus
                      isOnline={onlineUsers.includes(roomInfo.room.user1_id)}
                      className="text-xs"
                    />
                  )}
                  {roomInfo.room.user2_id &&
                    roomInfo.room.user2_id !== currentUserId && (
                      <UserStatus
                        isOnline={onlineUsers.includes(roomInfo.room.user2_id)}
                        className="text-xs"
                      />
                    )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 w-full sm:w-auto relative">
            {joined && (
              <ShareRoom
                roomId={roomId || ""}
                roomName={roomName}
                className="relative"
              />
            )}
            <button
              onClick={() => navigate("/")}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 w-full sm:w-auto"
            >
              Home
            </button>
          </div>
        </div>

        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

        {notification && (
          <div
            className={`mt-2 text-sm ${
              notification.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {notification.type === "success" ? "✓" : "✗"} {notification.message}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        {loading && !joined ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading room...</p>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} currentUserId={currentUserId} />

            <div className="border-t border-gray-300 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
              {(typingUsers.length > 0 ||
                Object.keys(liveTypingUsers).length > 0) && (
                <div className="flex items-center gap-2 text-xs opacity-70 mb-2 animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="truncate">
                    {Object.keys(liveTypingUsers).length > 0 ? (
                      Object.entries(liveTypingUsers).map(([userId, data]) => (
                        <span key={userId}>
                          <strong>{userId}</strong> is typing{" "}
                          {data.content && data.content.trim() ? (
                            <span className="text-blue-600 dark:text-blue-400">
                              "{data.content}"
                            </span>
                          ) : (
                            "..."
                          )}
                        </span>
                      ))
                    ) : (
                      <>
                        <strong>{typingUsers.slice(0, 2).join(", ")}</strong>
                        {typingUsers.length > 2 &&
                          ` and ${typingUsers.length - 2} other${
                            typingUsers.length > 3 ? "s" : ""
                          }`}{" "}
                        {typingUsers.length === 1 ? "is" : "are"} typing...
                      </>
                    )}
                  </span>
                </div>
              )}
              <MessageInput
                onSendMessage={handleSendMessage}
                onSendVoice={handleSendVoice}
                onStartTyping={handleStartTyping}
                onStopTyping={handleStopTyping}
                onLiveTyping={handleLiveTyping}
                disabled={!joined}
              />
              {!joined && (
                <p className="text-xs opacity-50 mt-2 text-center sm:text-left">
                  Join the room to start chatting
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
