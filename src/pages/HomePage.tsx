/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useToast } from "../hooks/useToast";
import { useRecentChats } from "../hooks/useRecentChats";
import RecentChats from "../components/RecentChats";

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<
    "chat" | "user" | "join" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { addRecentChat } = useRecentChats();

  const startNewChat = async () => {
    try {
      setLoading(true);
      setLoadingType("chat");
      setError(null);

      // Auto-generate user ID in background
      const userResponse = await api.generateUserId();
      const userId = userResponse.userId || userResponse.id;
      localStorage.setItem("currentUserId", userId);

      // Create room directly
      const roomResponse = await api.createRoom(userId);
      const roomId = roomResponse.room?.room_id;

      if (!roomId) {
        const errorMsg = "Failed to create chat room. Please try again.";
        setError(errorMsg);
        showError(errorMsg);
        return;
      }

      success("Chat room created! Redirecting...");

      // Add to recent chats
      addRecentChat(roomId, `Room ${roomId}`);

      // Navigate directly to chat
      navigate(`/c/${roomId}`);
    } catch (err) {
      const errorMsg =
        "Failed to start new chat. Make sure your backend is running on port 3000.";
      setError(errorMsg);
      showError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      showError("Please enter a room ID");
      return;
    }

    try {
      setLoading(true);
      setLoadingType("join");
      setError(null);

      // Add to recent chats
      const trimmedRoomId = roomId.trim();
      addRecentChat(trimmedRoomId, `Room ${trimmedRoomId}`);

      success("Joining room...");
      navigate(`/c/${trimmedRoomId}`);
    } catch (err) {
      const errorMsg = "Failed to join room. Please check the room ID.";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-xl">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Welcome to Duonest
        </h1>
        <p className="text-sm sm:text-base opacity-70">
          Connect and chat with others
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="border border-gray-300 dark:border-gray-700 p-4 sm:p-6 rounded">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            Start Chatting
          </h2>

          <button
            onClick={startNewChat}
            disabled={loading}
            className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-base font-medium flex items-center justify-center gap-2"
          >
            {loadingType === "chat" && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {loadingType === "chat" ? "Creating Chat..." : "🚀 Start New Chat"}
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="border border-gray-300 dark:border-gray-700 p-4 sm:p-6 rounded">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            Join Existing Room
          </h2>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter room ID..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500"
              onKeyPress={(e) => e.key === "Enter" && joinRoom()}
            />
            <button
              onClick={joinRoom}
              disabled={!roomId.trim() || loading}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {loadingType === "join" && (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {loadingType === "join" ? "Joining..." : "Join"}
            </button>
          </div>
        </div>

        <div className="border border-gray-300 dark:border-gray-700 p-4 sm:p-6 rounded">
          <RecentChats />
        </div>
      </div>

      <div className="mt-6 sm:mt-8 text-center text-xs opacity-50">
        <p>Make sure your backend is running on port 3000</p>
      </div>
    </div>
  );
};

export default HomePage;
