interface UserStatusProps {
  isOnline: boolean
  lastSeen?: Date
  className?: string
}

const UserStatus = ({ isOnline, lastSeen, className = '' }: UserStatusProps) => {
  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (isOnline) {
    return (
      <div className={`flex items-center gap-1 text-green-600 dark:text-green-400 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-xs">Online</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 text-gray-500 dark:text-gray-400 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
      <span className="text-xs">
        {lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'}
      </span>
    </div>
  )
}

export default UserStatus