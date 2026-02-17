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
    const params: { page: number; limit: number; isRead?: boolean } = {
      page,
      limit,
    };
    if (typeof isRead === "boolean") params.isRead = isRead;
    const res = await api.get("/notifications", { params });
    return res.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    // console.log("[NotificationService] Fetching unread count"); // Uncomment if needed, can be noisy
    const res = await api.get("/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put("/notifications/mark-all-read");
  },
};
