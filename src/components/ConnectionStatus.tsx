interface ConnectionStatusProps {
  isConnected: boolean
  isConnecting?: boolean
  className?: string
}

const ConnectionStatus = ({ isConnected, isConnecting = false, className = "" }: ConnectionStatusProps) => {
  const getStatus = () => {
    if (isConnecting) return { text: "Connecting...", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500" }
    if (isConnected) return { text: "Connected", color: "text-green-600 dark:text-green-400", bg: "bg-green-500" }
    return { text: "Disconnected", color: "text-red-600 dark:text-red-400", bg: "bg-red-500" }
  }

  const status = getStatus()

  return (
    <div className={`flex items-center gap-2 ${status.color} ${className}`}>
      <div className={`w-2 h-2 rounded-full ${status.bg} ${isConnecting ? 'animate-pulse' : ''}`}></div>
      <span className="text-sm font-medium">{status.text}</span>
    </div>
  )
}

export default ConnectionStatus