import { axiosInstance } from "~/lib/axios";
import type {
  AvatarSchema,
  ChangePasswordSchema,
  ProfileUpdateSchema,
  ResetPasswordSchema,
} from "./settings.schema";

interface ImageUrlResponse {
  url: string;
  message: string;
  public_id?: string;
}
export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone?: string;
  avatar?: string; // URL avatar hasil upload
}

export const settingsService = {
  async uploadAvatar(payload: AvatarSchema) {
    const formData = new FormData();
    formData.append("file", payload.avatar);
    const response = await axiosInstance.post<ImageUrlResponse>(
      `/media/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return { fileURL: response.data.url };
  },
  async updateProfile(userId: number, payload: UpdateProfilePayload) {
    const { data } = await axiosInstance.patch(
      `/users/${userId}/profile`,
      payload,
    );
    return data;
  },
  async updateOrganizerProfile(userId: number, payload: any) {
    const { data } = await axiosInstance.patch(
      `/users/${userId}/organizer-profile`,
      payload,
    );
    return data;
  },
  async getOrganizerProfile(userId: number) {
    const { data } = await axiosInstance.get(
      `/users/${userId}/organizer-profile`,
    );
    return data;
  },
  async changePassword(userId: number, payload: ChangePasswordSchema) {
    const { data } = await axiosInstance.patch(`/users/${userId}/password`, {
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    });
    return data;
  },
  async resetPassword(payload: ResetPasswordSchema) {
    const { data } = await axiosInstance.post("/users/password/reset", {
      email: payload.email,
    });
    return data;
  },
};
