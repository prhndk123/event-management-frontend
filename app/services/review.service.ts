import api from './api';

export interface CreateReviewData {
    rating: number;
    comment: string;
}

/**
 * Create review for an event (Customer only, requires completed transaction)
 */
export const createReview = async (eventId: number, data: CreateReviewData) => {
    const response = await api.post(`/events/${eventId}/reviews`, data);
    return response.data;
};

/**
 * Get organizer profile with reviews and ratings
 */
export const getOrganizerProfile = async (organizerId: number) => {
    const response = await api.get(`/organizers/${organizerId}/profile`);
    return response.data;
};
