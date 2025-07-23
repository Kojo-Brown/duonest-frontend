import { useNavigate } from 'react-router-dom'
import { useRecentChats, type RecentChat } from '../hooks/useRecentChats'

interface RecentChatsProps {
  className?: string
}

const RecentChats = ({ className = "" }: RecentChatsProps) => {
  const { recentChats, loading, removeRecentChat } = useRecentChats()
  const navigate = useNavigate()

  const handleChatClick = (roomId: string) => {
    navigate(`/c/${roomId}`)
  }

  const handleRemoveChat = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation()
    removeRecentChat(roomId)
  }

  const formatLastVisited = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm opacity-70">Loading recent chats...</p>
      </div>
    )
  }

  if (recentChats.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-2">💬</div>
        <p className="text-sm opacity-70">No recent chats yet</p>
        <p className="text-xs opacity-50 mt-1">Start a new chat to see it here</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="text-base sm:text-lg font-semibold mb-4">Recent Chats</h3>
      <div className="space-y-2">
        {recentChats.map((chat: RecentChat) => (
          <div
            key={chat.roomId}
            onClick={() => handleChatClick(chat.roomId)}
            className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{chat.roomName}</h4>
                {chat.isActive && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs opacity-60">
                <span className="truncate">ID: {chat.roomId}</span>
                <span>•</span>
                <span>{formatLastVisited(chat.lastVisited)}</span>
                {chat.participantCount && (
                  <>
                    <span>•</span>
                    <span>{chat.participantCount} online</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleRemoveChat(e, chat.roomId)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all text-red-500"
                title="Remove from recent chats"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentChats