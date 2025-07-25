import { useEffect, useRef } from "react";
import type { Message } from "../types";
import MessageStatusComponent from "./MessageStatus";
import AudioPlayer from "./AudioPlayer";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
}

const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change (new message or initial load)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-center opacity-50">No messages yet</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
    >
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId;

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                isOwnMessage
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
              }`}
            >
              {message.message_type === 'voice' || message.message_type === 'audio' ? (
                <div className="space-y-2">
                  {message.file_url ? (
                    <AudioPlayer 
                      src={message.file_url.startsWith('http') ? message.file_url : `http://localhost:3000${message.file_url}`} 
                      duration={message.duration}
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="w-4 h-4 text-gray-400">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" x2="12" y1="19" y2="22" />
                          <line x1="8" x2="16" y1="22" y2="22" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Voice message
                      </span>
                    </div>
                  )}
                  {message.content && message.content.trim() && message.content !== "Voice message" && (
                    <p className="break-words text-sm sm:text-base">
                      {message.content}
                    </p>
                  )}
                </div>
              ) : (
                <p className="break-words text-sm sm:text-base">
                  {message.content}
                </p>
              )}
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs opacity-70">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {isOwnMessage && message.status && (
                  <MessageStatusComponent status={message.status} className="text-xs" />
                )}
              </div>
            </div>
          </div>
        );
      })}
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
