/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { api } from '../api/client';

export interface RecentChat {
  roomId: string;
  roomName?: string;
  lastVisited: Date;
  participantCount?: number;
  isActive?: boolean;
}

const MAX_RECENT_CHATS = 10;

export const useRecentChats = () => {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUserId = localStorage.getItem('currentUserId');

  // Load recent chats from backend on mount
  useEffect(() => {
    const loadRecentChats = async () => {
      if (!currentUserId) return;
      
      try {
        setLoading(true);
        const chats = await api.getRecentChats(currentUserId);
        const formattedChats = chats.map((chat: any) => ({
          ...chat,
          lastVisited: new Date(chat.lastVisited),
        }));
        setRecentChats(formattedChats);
      } catch (error: any) {
        console.error("Failed to load recent chats:", error);
        
        // If backend endpoint doesn't exist yet, silently fail
        if (error.response?.status === 404 || error.response?.status === 500) {
          console.log("Recent chats backend not ready yet, using empty state");
          setRecentChats([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadRecentChats();
  }, [currentUserId]);


  // Add or update a recent chat
  const addRecentChat = useCallback(
    async (roomId: string, roomName?: string) => {
      if (!currentUserId) return;
      
      // Update local state optimistically first (immediate UI feedback)
      setRecentChats((prev) => {
        const filtered = prev.filter((chat) => chat.roomId !== roomId);
        const newChat: RecentChat = {
          roomId,
          roomName: roomName || `Room ${roomId}`,
          lastVisited: new Date(),
          isActive: true,
        };
        return [newChat, ...filtered].slice(0, MAX_RECENT_CHATS);
      });
      
      // Then sync with backend (with error handling)
      try {
        await api.addRecentChat(currentUserId, roomId, roomName);
      } catch (error: any) {
        console.error("Failed to sync recent chat to backend:", error);
        // Don't revert UI state - user can still see it locally
        if (error.response?.status === 429) {
          console.log("Rate limited on recent chat sync, will retry later");
        }
      }
    },
    [currentUserId]
  );

  // Update room info (participant count, etc.)
  const updateRoomInfo = useCallback(
    async (roomId: string, updates: Partial<RecentChat>) => {
      if (!currentUserId) return;
      
      try {
        await api.updateRecentChat(currentUserId, roomId, updates);
        
        // Update local state
        setRecentChats((prev) =>
          prev.map((chat) =>
            chat.roomId === roomId ? { ...chat, ...updates } : chat
          )
        );
      } catch (error) {
        console.error("Failed to update recent chat:", error);
      }
    },
    [currentUserId]
  );

  // Remove a recent chat
  const removeRecentChat = useCallback(
    async (roomId: string) => {
      if (!currentUserId) return;
      
      try {
        await api.removeRecentChat(currentUserId, roomId);
        
        // Update local state
        setRecentChats((prev) => prev.filter((chat) => chat.roomId !== roomId));
      } catch (error) {
        console.error("Failed to remove recent chat:", error);
      }
    },
    [currentUserId]
  );

  // Clear all recent chats
  const clearRecentChats = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      // Remove all chats for this user
      await Promise.all(
        recentChats.map(chat => api.removeRecentChat(currentUserId, chat.roomId))
      );
      setRecentChats([]);
    } catch (error) {
      console.error("Failed to clear recent chats:", error);
    }
  }, [currentUserId, recentChats]);

  return {
    recentChats,
    loading,
    addRecentChat,
    updateRoomInfo,
    removeRecentChat,
    clearRecentChats,
  };
};
