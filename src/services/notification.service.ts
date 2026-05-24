import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "TASK_ASSIGNED" | "COMMENT_ADDED" | "STATUS_CHANGED";
  createdAt: string;
  link?: string;
  isRead: boolean;
}
export const notificationService = {
  /**
   * GET /api/v1/notifications/count
   * Fetches only the number of unread alerts.
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get("/api/v1/notification/count");
      return response.data.data.unreadCount;
    } catch (error) {
      console.error("Signal lost: Notification count unreachable.");
      return 0;
    }
  },

  getUnread: async (): Promise<{
    data: Notification[];
    unreadCount: number;
  }> => {
    const response = await api.get("/api/v1/notification/unread");
    return response.data.data;
  },

  /**
   * PATCH /api/v1/notifications/read-all
   * Flags all alerts as seen to clear the UI badges.
   */
  getNotifications: async (
    page = 1,
    limit = 20,
  ): Promise<{
    data: Notification[];
    meta: { total: number; totalPages: number; currentPage: number };
  }> => {
    try {
      const response = await api.get(
        `/api/v1/notification?page=${page}&limit=${limit}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error("Could not retrieve notification history.");
    }
  },
  markAsRead: async (notifId: string): Promise<Notification> => {
    try {
      const response = await api.patch(`/api/v1/notification/${notifId}/read`);
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to acknowledge alert.");
    }
  },
  markAllAsRead: async (): Promise<{ updatedCount: number }> => {
    try {
      const response = await api.patch("/api/v1/notification/read-all");
      return response.data.data;
    } catch (error) {
      throw new Error("Bulk acknowledgement failed.");
    }
  },
  deleteNotification: async (notifId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/notification/${notifId}`);
    } catch (error) {
      throw new Error("Failed to terminate log entry.");
    }
  },
  clearAll: async (): Promise<{ deletedCount: number }> => {
    try {
      const response = await api.delete("/api/v1/notification/clear-all");
      return response.data.data;
    } catch (error) {
      throw new Error("Bulk purge failed. Mission history remains intact.");
    }
  },
};
