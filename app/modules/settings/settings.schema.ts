import { z } from "zod";

// ============= Profile Settings =============
export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;

// ============= Password Settings =============
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// ============= Notification Settings =============
export const notificationSettingsSchema = z.object({
  emailOnTransactionAccepted: z.boolean().default(true),
  emailOnTransactionRejected: z.boolean().default(true),
  emailPaymentReminder: z.boolean().default(true),
  eventReminder: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
});

export type NotificationSettingsSchema = z.infer<
  typeof notificationSettingsSchema
>;

// ============= Organizer Settings =============
export const organizerProfileSchema = z.object({
  brandName: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  contactInfo: z.string().optional(),
  notificationEmail: z.string().email("Please enter a valid email").optional(),
  publicProfileVisible: z.boolean(),
  defaultMinPurchase: z
    .number()
    .min(0, "Minimum purchase cannot be negative")
    .optional(),
  defaultVoucherValidityDays: z
    .number()
    .min(1, "Validity must be at least 1 day")
    .max(365)
    .optional(),
});

export type OrganizerProfileSchema = z.infer<typeof organizerProfileSchema>;
