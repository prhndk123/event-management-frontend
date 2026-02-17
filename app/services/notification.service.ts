import { api } from "./api";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt: string | null;
  relatedUrl: string | null;
  createdAt: string;
}

interface NotificationListResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UnreadCountResponse {
  count: number;
}

export const notificationService = {
  getNotifications: async (
    page = 1,
    limit = 20,
    isRead?: boolean,
  ): Promise<NotificationListResponse> => {
    console.log(
      `[NotificationService] Fetching notifications page=${page} limit=${limit}`,
    );
    const res = await api.get("/notifications", {
      params: { page, limit, isRead },
    });
    return res.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    // console.log("[NotificationService] Fetching unread count"); // Uncomment if needed, can be noisy
    const res = await api.get("/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    console.log(`[NotificationService] Marking notification ${id} as read`);
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<void> => {
    console.log("[NotificationService] Marking all as read");
    await api.put("/notifications/mark-all-read");
  },
};
