import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSocket } from './hooks/useSocket'
import { useToast } from './hooks/useToast'
import HomePage from './pages/HomePage'
import UserPage from './pages/UserPage'
import ChatPage from './pages/ChatPage'
import Toast from './components/Toast'

function App() {
  const { connectionError } = useSocket()
  const { toasts, removeToast } = useToast()

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors">
        {connectionError && (
          <div className="p-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 rounded text-sm text-red-600 dark:text-red-400">
              ⚠️ {connectionError} - Some features may not work properly
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/u/:userId" element={<UserPage />} />
          <Route path="/c/:roomId" element={<ChatPage />} />
        </Routes>
        
        {/* Toast notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </Router>
  )
}

export default App
