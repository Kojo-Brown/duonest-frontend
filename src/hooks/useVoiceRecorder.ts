import { useState, useRef, useCallback } from 'react'

export interface VoiceRecorderState {
  isRecording: boolean
  isPaused: boolean
  recordingTime: number
  audioBlob: Blob | null
  audioUrl: string | null
  error: string | null
}

export interface UseVoiceRecorderReturn extends VoiceRecorderState {
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  clearRecording: () => void
  requestPermission: () => Promise<boolean>
}

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setError(null)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone'
      setError(errorMessage)
      return false
    }
  }, [])

  const startTimer = useCallback(() => {
    setRecordingTime(0)
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType 
        })
        setAudioBlob(blob)
        
        // Convert to data URL for better compatibility
        const reader = new FileReader()
        reader.onloadend = () => {
          setAudioUrl(reader.result as string)
        }
        reader.readAsDataURL(blob)
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setIsPaused(false)
      startTimer()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
      setError(errorMessage)
    }
  }, [startTimer])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      stopTimer()
    }
  }, [isRecording, stopTimer])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      stopTimer()
    }
  }, [isRecording, isPaused, stopTimer])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      startTimer()
    }
  }, [isRecording, isPaused, startTimer])

  const clearRecording = useCallback(() => {
    // Only revoke if it's a blob URL, not a data URL
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl)
    }
    
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setError(null)
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [audioUrl])

  return {
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
  }
}