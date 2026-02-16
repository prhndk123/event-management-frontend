import api from "./api";

// ─── Types ────────────────────────────────────────────────────────────────

export interface BuyerDTO {
  id: number;
  buyerName: string;
  buyerEmail: string;
  eventTitle: string;
  ticketQty: number;
  totalPaid: number;
  status: string;
  createdAt: string;
}

export interface AttendeeDTO {
  id: number;
  attendeeName: string;
  email: string;
  event: string;
  ticketType: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  buyerName: string;
  totalPaid: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface OrganizerEvent {
  id: number;
  title: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────

export interface BuyerQueryParams {
  page?: number;
  limit?: number;
  eventId?: number;
  search?: string;
}

export interface AttendeeQueryParams {
  page?: number;
  limit?: number;
  eventId?: number;
  status?: "checked_in" | "registered";
  search?: string;
}

// ─── API Calls ───────────────────────────────────────────────────────────

/**
 * Get organizer's events (for filter dropdowns)
 */
export const getOrganizerEvents = async (): Promise<OrganizerEvent[]> => {
  const response = await api.get("/organizer/events");
  return response.data;
};

/**
 * Get paginated buyers list (transaction view)
 */
export const getBuyers = async (
  params: BuyerQueryParams = {},
): Promise<PaginatedResponse<BuyerDTO>> => {
  const response = await api.get("/organizer/buyers", { params });
  return response.data;
};

/**
 * Get paginated attendees list (seat-level view)
 */
export const getAttendees = async (
  params: AttendeeQueryParams = {},
): Promise<PaginatedResponse<AttendeeDTO>> => {
  const response = await api.get("/organizer/attendees", { params });
  return response.data;
};

/**
 * Export buyers as CSV — triggers browser download
 */
export const exportBuyersCSV = async (): Promise<void> => {
  const response = await api.get("/organizer/buyers/export", {
    responseType: "blob",
  });
  downloadBlob(response.data, `buyers-${Date.now()}.csv`);
};

/**
 * Export attendees as CSV — triggers browser download
 */
export const exportAttendeesCSV = async (): Promise<void> => {
  const response = await api.get("/organizer/attendees/export", {
    responseType: "blob",
  });
  downloadBlob(response.data, `attendees-${Date.now()}.csv`);
};

// ─── Helpers ─────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
