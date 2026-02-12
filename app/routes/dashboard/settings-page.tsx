import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Eye,
  EyeOff,
  Building2,
  Loader2,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
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
  changePasswordSchema,
  organizerProfileSchema,
  type ProfileUpdateSchema,
  type ChangePasswordSchema,
  type OrganizerProfileSchema,
} from "~/modules/settings/settings.schema";
import {
  settingsService,
  type UpdateProfilePayload,
} from "~/modules/settings/settings.service";
import { formatDate } from "~/types";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Organizer state
  const isOrganizer = user?.role?.toUpperCase() === "ORGANIZER";
  const [organizerData, setOrganizerData] = useState<any>(null);

  // Fetch Organizer Data
  const { data: fetchedOrganizer, refetch: refetchOrganizer } = useQuery({
    queryKey: ["organizerProfile", user?.id],
    queryFn: () => settingsService.getOrganizerProfile(user!.id),
    enabled: !!user?.id && isOrganizer,
  });

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
    reset: resetProfileForm,
  } = useForm<ProfileUpdateSchema>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Organizer Profile Form
  const {
    register: registerOrganizer,
    handleSubmit: handleOrganizerSubmit,
    formState: { errors: organizerErrors, isDirty: organizerDirty },
    reset: resetOrganizerForm,
    setValue: setOrganizerValue,
    watch: watchOrganizer,
  } = useForm<OrganizerProfileSchema>({
    resolver: zodResolver(organizerProfileSchema),
    defaultValues: {
      brandName: "",
      description: "",
      contactInfo: "",
      notificationEmail: user?.email ?? "",
      publicProfileVisible: true,
      defaultMinPurchase: 0,
      defaultVoucherValidityDays: 30,
    },
  });

  // Watch values for controlled components
  const publicProfileVisible = watchOrganizer("publicProfileVisible");

  // Sync forms with data
  useEffect(() => {
    if (user) {
      resetProfileForm({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user, resetProfileForm]);

  useEffect(() => {
    if (fetchedOrganizer) {
      setOrganizerData(fetchedOrganizer);
      resetOrganizerForm({
        brandName: fetchedOrganizer.name || "",
        description: fetchedOrganizer.bio || "",
        contactInfo: fetchedOrganizer.contactInfo || "",
        notificationEmail:
          fetchedOrganizer.notificationEmail || user?.email || "",
        publicProfileVisible: fetchedOrganizer.publicProfileVisible ?? true,
        defaultMinPurchase: fetchedOrganizer.defaultMinPurchase ?? 0,
        defaultVoucherValidityDays:
          fetchedOrganizer.defaultVoucherValidityDays ?? 30,
      });
      if (fetchedOrganizer.avatar) {
        setLogoPreview(fetchedOrganizer.avatar);
      }
    }
  }, [fetchedOrganizer, resetOrganizerForm, user]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateSchema) => {
      let avatarUrl = user?.avatar;

      if (avatarFile) {
        const response = await settingsService.uploadAvatar({
          avatar: avatarFile,
        });
        avatarUrl = response.fileURL;
      }

      const payload: UpdateProfilePayload = {
        name: data.name,
        email: data.email, // backend handles unique check
        phone: data.phone,
        avatar: avatarUrl ?? undefined,
      };

      return await settingsService.updateProfile(user!.id, payload);
    },
    onSuccess: (data) => {
      updateUser(data);
      toast.success("Profile updated successfully!");
      setConfirmDialogOpen(false);
      setPendingAction(null);
      setAvatarFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordSchema) =>
      settingsService.changePassword(user!.id, data),
    onSuccess: () => {
      toast.success("Password updated successfully!");
      resetPasswordForm();
      setConfirmDialogOpen(false);
      setPendingAction(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update password");
    },
  });

  const updateOrganizerMutation = useMutation({
    mutationFn: async (data: OrganizerProfileSchema) => {
      let logoUrl = organizerData?.avatar; // Use existing logo by default

      if (logoFile) {
        const response = await settingsService.uploadAvatar({
          avatar: logoFile,
        });
        logoUrl = response.fileURL;
      }

      const payload = {
        ...data,
        logo: logoUrl,
      };

      return await settingsService.updateOrganizerProfile(user!.id, payload);
    },
    onSuccess: (data) => {
      toast.success("Organizer settings saved!");
      refetchOrganizer(); // Refresh data
      setConfirmDialogOpen(false);
      setPendingAction(null);
      setLogoFile(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update organizer settings",
      );
    },
  });

  // Handlers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Form submission wrappers
  // Refactor submit logic to store data for confirmation
  const [pendingData, setPendingData] = useState<any>(null);

  const onProfileFormSubmit = (data: ProfileUpdateSchema) => {
    setPendingData(data);
    setPendingAction("profile");
    setConfirmDialogOpen(true);
  };

  const onPasswordFormSubmit = (data: ChangePasswordSchema) => {
    setPendingData(data);
    setPendingAction("password");
    setConfirmDialogOpen(true);
  };

  const onOrganizerFormSubmit = (data: OrganizerProfileSchema) => {
    setPendingData(data);
    setPendingAction("organizer");
    setConfirmDialogOpen(true);
  };

  const executePendingAction = () => {
    if (!pendingData) return;

    if (pendingAction === "profile") {
      updateProfileMutation.mutate(pendingData);
    } else if (pendingAction === "password") {
      changePasswordMutation.mutate(pendingData);
    } else if (pendingAction === "organizer") {
      updateOrganizerMutation.mutate(pendingData);
    }
  };

  const isPending =
    updateProfileMutation.isPending ||
    changePasswordMutation.isPending ||
    updateOrganizerMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isOrganizer && (
            <TabsTrigger value="organizer">Organizer</TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit(onProfileFormSubmit)}>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={avatarPreview ?? user?.avatar ?? undefined}
                        onLoadingStatusChange={(status) => {}}
                      />
                      {/* Only show fallback initials if there is no image source OR if image failed to load */}
                      <AvatarFallback className="text-2xl">
                        {!(avatarPreview ?? user?.avatar)
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
                      {...registerProfile("name")}
                      placeholder="Enter your name"
                    />
                    {profileErrors.name && (
                      <p className="text-sm text-destructive">
                        {profileErrors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerProfile("email")}
                      placeholder="Enter your email"
                    />
                    {profileErrors.email && (
                      <p className="text-sm text-destructive">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      {...registerProfile("phone")}
                      placeholder="+62..."
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-6">
                <Button
                  type="submit"
                  disabled={!profileDirty && !avatarPreview}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and status.
              </CardDescription>
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
                    <p className="text-sm text-muted-foreground">
                      Active Points
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {user?.point?.toLocaleString() ?? 0} pts
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit(onPasswordFormSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showOldPassword ? "text" : "password"}
                      {...registerPassword("oldPassword")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.oldPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      {...registerPassword("newPassword")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    {...registerPassword("confirmPassword")}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="mt-6">
                <Button type="submit">Update Password</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what you want to be notified about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox id="sales" defaultChecked />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="sales" className="font-medium">
                    New Sales
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone purchases a ticket.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="payment-received" defaultChecked />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="payment-received" className="font-medium">
                    Payment Received
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when payment proof is uploaded.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="marketing" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="marketing" className="font-medium">
                    Marketing Emails
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive news and updates about new features.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="security" defaultChecked />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="security" className="font-medium">
                    Security Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about suspicious activity on your account.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toast.success("Preferences saved!")}>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Organizer Tab - Only visible for organizers */}
        {isOrganizer && (
          <TabsContent value="organizer" className="space-y-4">
            {/* Organizer Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Organizer Profile
                </CardTitle>
                <CardDescription>
                  Configure your public organizer profile.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOrganizerSubmit(onOrganizerFormSubmit)}>
                <CardContent className="space-y-6">
                  {/* Logo Upload */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <label
                        htmlFor="logo-upload"
                        className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Brand Logo</p>
                      <p className="text-xs text-muted-foreground">
                        Square image recommended. Max 2MB.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="brandName">Brand / Organizer Name</Label>
                      <Input
                        id="brandName"
                        {...registerOrganizer("brandName")}
                        placeholder="Your brand name"
                      />
                      {organizerErrors.brandName && (
                        <p className="text-sm text-destructive">
                          {organizerErrors.brandName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Contact Information</Label>
                      <Input
                        id="contactInfo"
                        {...registerOrganizer("contactInfo")}
                        placeholder="Phone or email"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        {...registerOrganizer("description")}
                        placeholder="Tell attendees about your organization..."
                        className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        maxLength={500}
                      />
                      {organizerErrors.description && (
                        <p className="text-sm text-destructive">
                          {organizerErrors.description.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Visibility Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Public Profile Visibility
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow attendees to see your organizer profile.
                      </p>
                    </div>
                    <Switch
                      checked={publicProfileVisible}
                      onCheckedChange={(checked) =>
                        setOrganizerValue("publicProfileVisible", checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  {/* Notification Email */}
                  <div className="space-y-2">
                    <Label htmlFor="notificationEmail">
                      Transaction Notification Email
                    </Label>
                    <Input
                      id="notificationEmail"
                      type="email"
                      {...registerOrganizer("notificationEmail")}
                      placeholder="email@example.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Receive transaction updates at this email address.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="mt-4">
                  <Button
                    type="submit"
                    disabled={(!organizerDirty && !logoFile) || isPending}
                  >
                    Save Organizer Settings
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Default Voucher Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Default Voucher Settings</CardTitle>
                <CardDescription>
                  Set default values for new vouchers you create. (This part
                  allows auto-saving logic if needed, currently reusing the same
                  form)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultMinPurchase">
                      Minimum Purchase (IDR)
                    </Label>
                    <Input
                      id="defaultMinPurchase"
                      type="number"
                      {...registerOrganizer("defaultMinPurchase", {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum order amount to use voucher.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultVoucherValidityDays">
                      Default Validity (Days)
                    </Label>
                    <Input
                      id="defaultVoucherValidityDays"
                      type="number"
                      {...registerOrganizer("defaultVoucherValidityDays", {
                        valueAsNumber: true,
                      })}
                      placeholder="30"
                    />
                    <p className="text-xs text-muted-foreground">
                      How long vouchers are valid after creation.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleOrganizerSubmit(onOrganizerFormSubmit)();
                  }}
                  disabled={isPending}
                >
                  Save Defaults
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onOpenChange={(open) => !isPending && setConfirmDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              {pendingAction === "password"
                ? "Are you sure you want to change your password?"
                : "Are you sure you want to save these changes?"}
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
            <Button onClick={executePendingAction} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
