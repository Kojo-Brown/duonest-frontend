import { useState } from 'react'
import { useToast } from '../hooks/useToast'

interface ShareRoomProps {
  roomId: string
  roomName?: string
  className?: string
}

const ShareRoom = ({ roomId, roomName, className = "" }: ShareRoomProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { success } = useToast()

  const roomUrl = `${window.location.origin}/c/${roomId}`
  const shareTitle = roomName ? `Join "${roomName}" on Duonest` : `Join Room ${roomId} on Duonest`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      success('Room link copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = roomUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      success('Room link copied to clipboard!')
    }
  }

  const shareViaWeb = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: 'Join me in this chat room',
          url: roomUrl,
        })
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    } else {
      copyToClipboard()
    }
  }

  const generateQRCode = () => {
    // Simple QR code generation using a free service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}`
    window.open(qrUrl, '_blank')
  }

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        Share
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-4">
            <h4 className="font-medium mb-3">Share Room</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs opacity-70 mb-1 block">Room Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomUrl}
                    readOnly
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={shareViaWeb}
                  className="flex-1 px-3 py-2 text-sm bg-black dark:bg-white text-white dark:text-black hover:opacity-80 rounded transition-opacity"
                >
                  Share Link
                </button>
                <button
                  onClick={generateQRCode}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title="Generate QR Code"
                >
                  📱
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShareRoom