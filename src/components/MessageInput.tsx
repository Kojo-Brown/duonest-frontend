import { useState, useEffect, useRef } from 'react'
import VoiceRecorder from './VoiceRecorder'

interface LiveTypingData {
  content?: string
  cursorPosition?: number
  action: 'typing' | 'backspace' | 'delete' | 'start_typing' | 'stop_typing'
  timestamp?: number
}

interface MessageInputProps {
  onSendMessage: (content: string) => void
  onSendVoice?: (audioBlob: Blob, duration: number) => void
  onStartTyping?: () => void
  onStopTyping?: () => void
  onLiveTyping?: (data: LiveTypingData) => void
  disabled?: boolean
}

const MessageInput = ({ onSendMessage, onSendVoice, onStartTyping, onStopTyping, onLiveTyping, disabled = false }: MessageInputProps) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<number | null>(null)
  const liveTypingTimeoutRef = useRef<number | null>(null)
  const lastLiveUpdateRef = useRef<number>(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      
      // Stop typing when message is sent
      if (isTyping) {
        setIsTyping(false)
        onStopTyping?.()
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
      
      // Clear live typing timeouts and emit stop event
      if (liveTypingTimeoutRef.current) {
        clearTimeout(liveTypingTimeoutRef.current)
      }
      onLiveTyping?.({ action: 'stop_typing', timestamp: Date.now() })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart || 0
    
    setMessage(value)

    if (disabled) return

    // Handle live typing (throttled to avoid spam)
    const now = Date.now()
    if (onLiveTyping && now - lastLiveUpdateRef.current > 100) { // 100ms throttle
      lastLiveUpdateRef.current = now
      
      onLiveTyping({
        content: value,
        cursorPosition,
        action: 'typing',
        timestamp: now
      })
    }

    // Start typing if not already typing and has content
    if (!isTyping && value.trim()) {
      setIsTyping(true)
      onStartTyping?.()
      onLiveTyping?.({ action: 'start_typing', timestamp: now })
    }

    // Clear existing timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    if (liveTypingTimeoutRef.current) {
      clearTimeout(liveTypingTimeoutRef.current)
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        onStopTyping?.()
      }, 2000)
      
      liveTypingTimeoutRef.current = setTimeout(() => {
        onLiveTyping?.({ action: 'stop_typing', timestamp: Date.now() })
      }, 1500)
    } else {
      // Stop typing immediately if input is empty
      if (isTyping) {
        setIsTyping(false)
        onStopTyping?.()
        onLiveTyping?.({ action: 'stop_typing', timestamp: now })
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || !onLiveTyping) return
    
    const cursorPosition = e.currentTarget.selectionStart || 0
    const now = Date.now()
    
    // Capture special keys for live typing
    if (e.key === 'Backspace') {
      onLiveTyping({
        action: 'backspace',
        cursorPosition,
        timestamp: now
      })
    } else if (e.key === 'Delete') {
      onLiveTyping({
        action: 'delete', 
        cursorPosition,
        timestamp: now
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        {onSendVoice && (
          <VoiceRecorder 
            onSendVoice={onSendVoice}
            disabled={disabled}
          />
        )}
      </div>
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity w-full sm:w-auto"
      >
        Send
      </button>
    </form>
  )
}

export default MessageInput