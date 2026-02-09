import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAuthStore } from "~/modules/auth/auth.store";
import {
  profileUpdateSchema,
  type ProfileUpdateSchema,
} from "~/modules/settings/settings.schema";
import {
  settingsService,
  type UpdateProfilePayload,
} from "~/modules/settings/settings.service";
import { formatDate } from "~/types";
import { useMutation } from "@tanstack/react-query";

export default function AccountSettingsPage() {
  const { user, hasHydrated, setAuth } = useAuthStore();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarError, setIsAvatarError] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateSchema | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateSchema>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      avatar: undefined,
    },
  });
  useEffect(() => {
    if (user && hasHydrated) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user, hasHydrated, reset]);

  // IMPORTANT: All hooks must be called before any early returns
  const { mutateAsync: updateProfile, isPending } = useMutation({
    mutationFn: async (data: ProfileUpdateSchema) => {
      let avatarUrl: string | undefined | null = user?.avatar;

      // Step 1: Upload avatar to Cloudinary via backend if there's a new file
      if (avatarFile) {
        const response = await settingsService.uploadAvatar({
          avatar: avatarFile,
        });
        avatarUrl = response.fileURL;
      }

      // Step 2: Save profile data with avatar URL to axiosInstance
      const payload: UpdateProfilePayload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: avatarUrl ?? undefined,
      };

      return await settingsService.updateProfile(user!.id, payload);
    },
    onSuccess: (data) => {
      // Update auth store with new user data from backend response
      if (user) {
        setAuth({
          user: {
            ...user,
            ...data, // Use the actual updated user data from backend
          },
          token: localStorage.getItem("accessToken") ?? "",
        });
      }
      // Reset states
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsAvatarError(false);
      setFormData(null);
      setConfirmDialogOpen(false);
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update profile error:", error);
      const message =
        error.response?.data?.message ||
        "Failed to update profile. Please try again.";
      toast.error(message);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store file for upload
      setAvatarFile(file);
      setIsAvatarError(false);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileUpdateSchema) => {
    setFormData(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    if (formData) {
      await updateProfile(formData);
    }
  };

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Early return for loading state - AFTER all hooks
  if (!hasHydrated) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Edit Profile Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-1.5" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>

        {/* Account Info Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-1.5" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Account Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your profile information and account details.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Edit Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={avatarPreview ?? user?.avatar ?? undefined}
                    onLoadingStatusChange={(status) => {
                      setIsAvatarError(status === "error");
                      if (status === "error") {
                        console.error("Avatar image failed to load");
                      }
                    }}
                  />
                  {/* Only show fallback initials if there is no image source OR if image failed to load */}
                  <AvatarFallback className="text-2xl">
                    {!(avatarPreview ?? user?.avatar) || isAvatarError
                      ? (user?.name?.charAt(0) ?? "U")
                      : null}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" {...register("phone")} placeholder="+62..." />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!isDirty && !avatarPreview}>
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Role */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="outline" className="capitalize">
                {user?.role?.toLowerCase() ?? "Customer"}
              </Badge>
            </div>

            {/* Referral Code */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Referral Code</p>
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                  {user?.referralCode ?? "N/A"}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyReferral}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Created Date */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium">
                {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Points (if customer) */}
          {user?.role?.toUpperCase() === "CUSTOMER" && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Points</p>
                <p className="text-2xl font-bold text-primary">
                  {user?.point?.toLocaleString() ?? 0} pts
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onOpenChange={(open) => !isPending && setConfirmDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Changes?</DialogTitle>
            <DialogDescription>
              Are you sure you want to update your profile information?
              {avatarFile && " A new profile picture will also be uploaded."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
