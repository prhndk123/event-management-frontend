import api from "./api";

export interface CreateTransactionData {
  ticketTypeId: number;
  quantity: number;
  voucherCode?: string;
  couponCode?: string;
  pointsToUse?: number;
}

export interface UploadPaymentProofData {
  paymentProof: string;
}

/**
 * Create transaction (Customer only)
 */
export const createTransaction = async (
  eventId: number,
  data: CreateTransactionData,
) => {
  const response = await api.post(`/events/${eventId}/transactions`, data);
  return response.data;
};

/**
 * Get current user's transactions (Customer only)
 */
export const getMyTransactions = async (
  page: number = 1,
  take: number = 10,
) => {
  const response = await api.get("/me/transactions", {
    params: { page, take },
  });
  return response.data;
};

/**
 * Get transactions for the current organizer (Organizer only)
 */
export const getOrganizerTransactions = async () => {
  const response = await api.get("/organizer/transactions");
  return response.data;
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (transactionId: number) => {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data;
};

/**
 * Upload payment proof (Customer only)
 */
export const uploadPaymentProof = async (
  transactionId: number,
  data: UploadPaymentProofData,
) => {
  const response = await api.put(
    `/transactions/${transactionId}/payment-proof`,
    data,
  );
  return response.data;
};

/**
 * Confirm transaction (Organizer only)
 */
export const confirmTransaction = async (transactionId: number) => {
  const response = await api.put(`/transactions/${transactionId}/confirm`);
  return response.data;
};

/**
 * Reject transaction (Organizer only)
 */
export const rejectTransaction = async (
  transactionId: number,
  reason?: string,
) => {
  const response = await api.put(`/transactions/${transactionId}/reject`, {
    reason,
  });
  return response.data;
};

/**
 * Cancel transaction (Customer only)
 */
export const cancelTransaction = async (transactionId: number) => {
  const response = await api.put(`/transactions/${transactionId}/cancel`);
  return response.data;
};

/**
 * Get tickets (attendees) for a confirmed transaction
 */
export const getTickets = async (transactionId: number) => {
  const response = await api.get(`/transactions/${transactionId}/tickets`);
  return response.data;
};

/**
 * Check-in via QR token (public)
 */
export const checkInByToken = async (token: string) => {
  const response = await api.get(`/check-in/${token}`);
  return response.data;
};
