import type { MessageStatus } from '../types'

interface MessageStatusProps {
  status: MessageStatus
  className?: string
}

const MessageStatus = ({ status, className = '' }: MessageStatusProps) => {
  console.log('MessageStatus rendering with status:', status);
  
  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Sending...
          </span>
        )
      case 'sent':
        return (
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Sent
          </span>
        )
      case 'delivered':
        return (
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Delivered
          </span>
        )
      case 'seen':
        return (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Seen
          </span>
        )
      case 'failed':
        return (
          <span className="text-xs text-red-500 dark:text-red-400">
            Failed
          </span>
        )
      default:
        return (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Not sent
          </span>
        )
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      {getStatusText()}
    </div>
  )
}

export default MessageStatus