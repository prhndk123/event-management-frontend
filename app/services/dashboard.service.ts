import api from "./api";

/**
 * Get dashboard summary (organizer overview stats + daily chart).
 * Optionally pass startDate and endDate (ISO strings) to filter by date range.
 */
export const getSummary = async (startDate?: string, endDate?: string) => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get("/dashboard/summary", { params });
  return response.data;
};

/**
 * Get dashboard analytics (monthly revenue, category distribution, top events).
 * Optionally pass startDate and endDate (ISO strings) to filter by date range.
 */
export const getAnalytics = async (startDate?: string, endDate?: string) => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get("/dashboard/analytics", { params });
  return response.data;
};
