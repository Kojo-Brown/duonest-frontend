export interface User {
  id: string
  created_at: Date
  last_active: Date
  status: 'unpaired' | 'in_room'
  current_room_id?: string
  isOnline?: boolean
  lastSeen?: Date
}

export interface CoupleRoom {
  room_id: string
  user1_id: string
  user2_id?: string
  created_at: Date
  is_active: boolean
  last_activity: Date
}

export type MessageType = 
  | 'text' | 'image' | 'video' | 'voice' | 'audio' | 'file' | 'gif' | 'sticker'
  | 'location' | 'contact' | 'link' | 'poll' | 'drawing' | 'emoji_reaction'
  | 'reply' | 'forward' | 'system'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed'

export interface Message {
  id: number
  room_id: string
  sender_id: string
  content: string
  message_type: MessageType
  created_at: Date
  
  // Message status fields
  status?: MessageStatus
  delivered_at?: Date
  seen_at?: Date
  seen_by?: string[]
  
  // File/Media fields
  file_url?: string
  file_name?: string
  file_size?: number
  thumbnail_url?: string
  duration?: number
  
  // Message relationship fields
  reply_to_message_id?: number
  forwarded_from?: string
  
  // Location fields
  location_lat?: number
  location_lng?: number
  
  // Special features
  expires_at?: Date
  view_once?: boolean
  poll_options?: string[]
  emoji?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}