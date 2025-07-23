import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import MessageStatus from './MessageStatus'

interface MessageListProps {
  messages: Message[]
  currentUserId?: string
}

const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll when messages change (new message or initial load)
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-center opacity-50">No messages yet</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                isOwnMessage
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white'
              }`}
            >
              <p className="break-words text-sm sm:text-base">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs opacity-70">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                {isOwnMessage && message.status && (
                  <MessageStatus 
                    status={message.status} 
                    className="text-xs" 
                  />
                )}
              </div>
            </div>
          </div>
        )
      })}
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList