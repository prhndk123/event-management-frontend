import api from "./api";

export interface EventFilters {
  page?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  category?: string;
  location?: string;
  priceRange?: "all" | "free" | "paid";
  startDate?: string;
  endDate?: string;
}

export interface CreateTicketTypeData {
  name: string;
  description: string;
  price: number;
  totalSeat: number;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  location: string;
  venue: string;
  startDate: string;
  endDate: string;
  image?: string;
  ticketTypes: CreateTicketTypeData[];
}

export interface CreateVoucherData {
  code: string;
  discountAmount: number;
  discountType: "PERCENTAGE" | "FIXED";
  startDate: string;
  endDate: string;
  usageLimit: number;
}

/**
 * Get list of events with filters
 */
export const getEvents = async (filters: EventFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await api.get(`/events?${params.toString()}`);
  return response.data;
};

/**
 * Get event by ID
 */
export const getEventById = async (id: number | string) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

/**
 * Get event by slug
 */
export const getEventBySlug = async (slug: string) => {
  const response = await api.get(`/events/${slug}`);
  return response.data;
};

/**
 * Create new event (Organizer only)
 */
export const createEvent = async (data: CreateEventData) => {
  const response = await api.post("/events", data);
  return response.data;
};

/**
 * Get events for the current organizer
 */
export const getOrganizerEvents = async () => {
  const response = await api.get("/events/me");
  return response.data;
};

/**
 * Publish event (Organizer only)
 */
export const publishEvent = async (eventId: number) => {
  const response = await api.put(`/events/${eventId}/publish`);
  return response.data;
};

/**
 * Create voucher for event (Organizer only)
 */
export const createVoucher = async (
  eventId: number,
  data: CreateVoucherData,
) => {
  const response = await api.post(`/events/${eventId}/vouchers`, data);
  return response.data;
};

/**
 * Get reviews for an event
 */
export const getEventReviews = async (eventId: number) => {
  const response = await api.get(`/events/${eventId}/reviews`);
  return response.data;
};

/**
 * Get current user's check-in status for an event
 */
export const getCheckInStatus = async (eventId: number) => {
  const response = await api.get(`/events/${eventId}/check-in-status`);
  return response.data;
};
/**
 * Get all vouchers for the current organizer
 */
export const getVouchersByOrganizer = async () => {
  const response = await api.get("/vouchers/organizer");
  return response.data;
};

/**
 * Get all attendees for the current organizer's events
 */
export const getOrganizerAttendees = async () => {
  const response = await api.get("/events/me/attendees");
  return response.data;
};

/**
 * Submit a review for an event
 */
export const submitReview = async (
  eventId: number,
  data: { rating: number; comment: string },
) => {
  const response = await api.post(`/events/${eventId}/reviews`, data);
  return response.data;
};

/**
 * Get organizer profile by ID
 */
export const getOrganizerProfile = async (organizerId: number | string) => {
  const response = await api.get(`/organizers/${organizerId}`);
  return response.data;
};

/**
 * Update event (Organizer only)
 */
export const updateEvent = async (eventId: number, data: any) => {
  const response = await api.patch(`/events/${eventId}`, data);
  return response.data;
};

/**
 * Delete event (Organizer only)
 */
export const deleteEvent = async (eventId: number) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};
