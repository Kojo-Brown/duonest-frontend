import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

const Toast = ({ message, type, onClose, duration = 4000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const baseClasses = "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out max-w-sm"
  
  const typeClasses = {
    success: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700",
    error: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700",
    info: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
  }

  const icons = {
    success: "✅",
    error: "❌", 
    info: "ℹ️"
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icons[type]}</span>
        <p className="text-sm font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="ml-auto text-lg opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast