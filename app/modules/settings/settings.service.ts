import { axiosInstance } from "~/lib/axios";
import type {
  ChangePasswordSchema,
  ProfileUpdateSchema,
  ResetPasswordSchema,
} from "./settings.schema";

export const settingsService = {
  async updateProfile(payload: ProfileUpdateSchema) {
    const { data } = await axiosInstance.patch("/users/:id/profile", {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      avatar: payload.avatar,
    });
    return data;
  },
  async changePassword(payload: ChangePasswordSchema) {
    const { data } = await axiosInstance.patch("/users/:id/password", {
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    });
    return data;
  },
  async resetPassword(payload: ResetPasswordSchema) {
    const { data } = await axiosInstance.post("/users/:id/password/reset", {
      email: payload.email,
    });
    return data;
  },
};
