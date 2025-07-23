import { useEffect, useState } from 'react'

interface LiveTypingData {
  userId: string
  roomId: string
  content?: string
  cursorPosition?: number
  action: 'typing' | 'backspace' | 'delete' | 'start_typing' | 'stop_typing'
  timestamp: number
}

interface LiveTypingDisplayProps {
  liveTypingData: LiveTypingData | null
  currentUserId: string
  className?: string
}

const LiveTypingDisplay = ({ liveTypingData, currentUserId, className = "" }: LiveTypingDisplayProps) => {
  const [displayText, setDisplayText] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!liveTypingData || liveTypingData.userId === currentUserId) {
      setIsVisible(false)
      return
    }

    if (liveTypingData.action === 'start_typing' || liveTypingData.action === 'typing') {
      setIsVisible(true)
      if (liveTypingData.content !== undefined) {
        setDisplayText(liveTypingData.content)
        setCursorPosition(liveTypingData.cursorPosition || 0)
      }
    } else if (liveTypingData.action === 'stop_typing') {
      // Fade out after a delay
      setTimeout(() => setIsVisible(false), 1000)
    }
  }, [liveTypingData, currentUserId])

  if (!isVisible || !displayText) return null

  return (
    <div className={`live-typing-container p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-3 ${className}`}>
      <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
        {liveTypingData?.userId} is typing...
      </div>
      <div className="relative bg-white dark:bg-gray-800 p-2 rounded border min-h-[24px]">
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {displayText.slice(0, cursorPosition)}
        </span>
        <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0"></span>
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {displayText.slice(cursorPosition)}
        </span>
        {displayText.length === 0 && (
          <span className="text-gray-400 text-sm italic">Start typing...</span>
        )}
      </div>
    </div>
  )
}

export default LiveTypingDisplay