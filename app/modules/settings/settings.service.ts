import { axiosInstance, axiosInstance2 } from "~/lib/axios";
import type {
  AvatarSchema,
  ChangePasswordSchema,
  ProfileUpdateSchema,
  ResetPasswordSchema,
} from "./settings.schema";

interface ImageUrlResponse {
  fileURL: string;
  filePath: string;
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
    const folderName = "avatars";
    const fileName = `avatar_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const response = await axiosInstance2.post<ImageUrlResponse>(
      `/api/files/${folderName}/${fileName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
  async updateProfile(userId: number, payload: UpdateProfilePayload) {
    const { data } = await axiosInstance.patch(
      `/users/${userId}/profile`,
      payload,
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
