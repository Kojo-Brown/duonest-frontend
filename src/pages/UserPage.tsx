import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'

const UserPage = () => {
  const { userId } = useParams<{ userId: string }>()
  const [loading, setLoading] = useState(false)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<unknown>(null)
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!userId) return
      
      try {
        setLoading(true)
        const data = await api.getUserDashboard(userId)
        setDashboardData(data)
      } catch (err) {
        setError('Failed to load dashboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [userId])

  const createRoom = async () => {
    if (!userId) return

    try {
      setIsCreatingRoom(true)
      setError(null)
      const response = await api.createRoom(userId)
      console.log('Create room response:', response)
      const roomId = response.room?.room_id
      
      if (!roomId) {
        const errorMsg = 'Room created but no room ID returned'
        setError(errorMsg)
        showError(errorMsg)
        console.error('No room ID found in response:', response)
        return
      }
      
      success('Room created successfully! Redirecting...')
      navigate(`/c/${roomId}`)
    } catch (err) {
      const errorMsg = 'Failed to create room. Please try again.'
      setError(errorMsg)
      showError(errorMsg)
      console.error('Create room error:', err)
    } finally {
      setIsCreatingRoom(false)
    }
  }

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Invalid user ID</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">User Dashboard</h1>
        <p className="text-sm opacity-70">ID: {userId}</p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        <div className="border border-gray-300 dark:border-gray-700 p-4 sm:p-6 rounded">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Create New Room</h2>
          <p className="text-sm opacity-70 mb-4">Start a new chat room and invite others</p>
          
          <button
            onClick={createRoom}
            disabled={isCreatingRoom}
            className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {isCreatingRoom && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {isCreatingRoom ? 'Creating...' : 'Create Room'}
          </button>
        </div>


        <div className="border border-gray-300 dark:border-gray-700 p-4 sm:p-6 rounded">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserPage