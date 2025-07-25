import { useState, useEffect } from 'react'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void
  disabled?: boolean
}

const VoiceRecorder = ({ onSendVoice, disabled = false }: VoiceRecorderProps) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    requestPermission
  } = useVoiceRecorder()

  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)

  useEffect(() => {
    const checkPermission = async () => {
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
          setHasPermission(permission.state === 'granted')
        } catch {
          setHasPermission(null)
        }
      }
    }
    checkPermission()
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = async () => {
    if (hasPermission === false) {
      const granted = await requestPermission()
      if (!granted) return
      setHasPermission(true)
    }
    
    setShowRecorder(true)
    await startRecording()
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleSendVoice = () => {
    if (audioBlob) {
      onSendVoice(audioBlob, recordingTime)
      clearRecording()
      setShowRecorder(false)
    }
  }

  const handleCancel = () => {
    if (isRecording) {
      stopRecording()
    }
    clearRecording()
    setShowRecorder(false)
  }

  if (!showRecorder) {
    return (
      <button
        type="button"
        onClick={handleStartRecording}
        disabled={disabled}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Record voice message"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
          <line x1="8" x2="16" y1="22" y2="22" />
        </svg>
      </button>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 max-w-full">
      {error && (
        <div className="text-red-500 text-sm w-full">
          {error}
        </div>
      )}
      
      {!error && (
        <>
          <div className="flex items-center gap-2 min-w-0">
            {isRecording && !isPaused && (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            )}
            
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {formatTime(recordingTime)}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!isRecording && !audioBlob && (
              <button
                type="button"
                onClick={handleStartRecording}
                disabled={disabled}
                className="p-1 text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                title="Start recording"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </button>
            )}

            {isRecording && !isPaused && (
              <button
                type="button"
                onClick={pauseRecording}
                className="p-1 text-yellow-500 hover:text-yellow-600 transition-colors"
                title="Pause recording"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              </button>
            )}

            {isRecording && isPaused && (
              <button
                type="button"
                onClick={resumeRecording}
                className="p-1 text-green-500 hover:text-green-600 transition-colors"
                title="Resume recording"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={handleStopRecording}
                className="p-1 text-gray-500 hover:text-gray-600 transition-colors"
                title="Stop recording"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
              </button>
            )}
          </div>

          {audioBlob && audioUrl && (
            <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
              <audio
                src={audioUrl}
                controls
                className="h-8 w-full sm:w-auto sm:max-w-[120px] min-w-0"
              />
              
              <button
                type="button"
                onClick={handleSendVoice}
                disabled={disabled}
                className="p-1 text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-colors flex-shrink-0"
                title="Send voice message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors sm:ml-auto flex-shrink-0"
            title="Cancel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18" />
              <path d="M6 6L18 18" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

export default VoiceRecorder