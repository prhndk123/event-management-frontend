import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { useSettingsStore } from "~/store/settings-store";

export default function NotificationSettingsPage() {
  const { notifications, updateNotifications, isSaving, setSaving } =
    useSettingsStore();

  const handleToggle = (key: keyof typeof notifications) => {
    updateNotifications({ [key]: !notifications[key] });
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast.success("Notification preferences saved!");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Notification Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Control how you receive notifications.
        </p>
      </div>

      {/* Transaction Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Notifications</CardTitle>
          <CardDescription>
            Get notified about your transaction status updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="txn-accepted" className="text-sm font-medium">
                Transaction Accepted
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email when your payment is confirmed.
              </p>
            </div>
            <Switch
              id="txn-accepted"
              checked={notifications.emailOnTransactionAccepted}
              onCheckedChange={() => handleToggle("emailOnTransactionAccepted")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="txn-rejected" className="text-sm font-medium">
                Transaction Rejected
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email when your payment is rejected.
              </p>
            </div>
            <Switch
              id="txn-rejected"
              checked={notifications.emailOnTransactionRejected}
              onCheckedChange={() => handleToggle("emailOnTransactionRejected")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="payment-reminder" className="text-sm font-medium">
                Payment Reminder
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive reminder to upload payment proof before expiry.
              </p>
            </div>
            <Switch
              id="payment-reminder"
              checked={notifications.emailPaymentReminder}
              onCheckedChange={() => handleToggle("emailPaymentReminder")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Event Notifications</CardTitle>
          <CardDescription>
            Stay updated about your upcoming events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="event-reminder" className="text-sm font-medium">
                Event Reminder
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive reminder before your events start.
              </p>
            </div>
            <Switch
              id="event-reminder"
              checked={notifications.eventReminder}
              onCheckedChange={() => handleToggle("eventReminder")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notif" className="text-sm font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email.
              </p>
            </div>
            <Switch
              id="email-notif"
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inapp-notif" className="text-sm font-medium">
                In-App Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications within the app.
              </p>
            </div>
            <Switch
              id="inapp-notif"
              checked={notifications.inAppNotifications}
              onCheckedChange={() => handleToggle("inAppNotifications")}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
