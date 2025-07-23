import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      // Handle unauthorized access
    }
    return Promise.reject(error);
  }
);

export const api = {
  // User endpoints
  generateUserId: () =>
    apiClient.get("/generate-user-id").then((res) => res.data),

  getUserDashboard: (userId: string) =>
    apiClient.get(`/u/${userId}`).then((res) => res.data),

  createRoom: (userId: string) =>
    apiClient.post(`/u/${userId}/create-room`).then((res) => res.data),

  // Room endpoints
  joinRoom: (roomId: string, userId?: string) =>
    apiClient.post(`/c/${roomId}/join`, { userId }).then((res) => res.data),

  getRoomInfo: (roomId: string) =>
    apiClient.get(`/c/${roomId}`).then((res) => res.data),

  getRoomMessages: (roomId: string, userId: string) =>
    apiClient.get(`/c/${roomId}/messages?userId=${userId}`).then((res) => res.data),

  // Recent chats methods
  getRecentChats: (userId: string) =>
    apiClient.get(`/recent-chats/${userId}`).then((res) => res.data),

  addRecentChat: (userId: string, roomId: string, roomName?: string) =>
    apiClient.post('/recent-chats', { userId, roomId, roomName }).then((res) => res.data),

  updateRecentChat: (userId: string, roomId: string, updates: any) =>
    apiClient.put(`/recent-chats/${userId}/${roomId}`, updates).then((res) => res.data),

  removeRecentChat: (userId: string, roomId: string) =>
    apiClient.delete(`/recent-chats/${userId}/${roomId}`).then((res) => res.data),

  // Health check
  healthCheck: () =>
    apiClient.get("/health", { baseURL: API_BASE_URL }).then((res) => res.data),

  // Generic methods
  get: <T>(url: string) => apiClient.get<T>(url).then((res) => res.data),

  post: <T>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data).then((res) => res.data),

  put: <T>(url: string, data: unknown) =>
    apiClient.put<T>(url, data).then((res) => res.data),

  delete: <T>(url: string) => apiClient.delete<T>(url).then((res) => res.data),
};

export default apiClient;
