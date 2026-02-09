import api from './api';

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
export const createTransaction = async (eventId: number, data: CreateTransactionData) => {
    const response = await api.post(`/events/${eventId}/transactions`, data);
    return response.data;
};

/**
 * Get current user's transactions (Customer only)
 */
export const getMyTransactions = async () => {
    const response = await api.get('/me/transactions');
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
export const uploadPaymentProof = async (transactionId: number, data: UploadPaymentProofData) => {
    const response = await api.put(`/transactions/${transactionId}/payment-proof`, data);
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
export const rejectTransaction = async (transactionId: number) => {
    const response = await api.put(`/transactions/${transactionId}/reject`);
    return response.data;
};

/**
 * Cancel transaction (Customer only)
 */
export const cancelTransaction = async (transactionId: number) => {
    const response = await api.delete(`/transactions/${transactionId}`);
    return response.data;
};
