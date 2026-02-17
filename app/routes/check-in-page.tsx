import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Ticket,
} from "lucide-react";
import { checkInByToken } from "~/services/transaction.service";

interface CheckInResult {
  success: boolean;
  message: string;
  attendee: {
    name: string;
    event: string;
    ticketType: string;
    checkedInAt: string;
  };
}

export default function CheckInPage() {
  const { token } = useParams();
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const doCheckIn = async () => {
      if (!token) {
        setError("Invalid QR code — no token provided");
        setIsLoading(false);
        return;
      }

      try {
        const data = await checkInByToken(token);
        setResult(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Check-in failed");
      } finally {
        setIsLoading(false);
      }
    };

    doCheckIn();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">
            Processing check-in...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-8 text-center max-w-md w-full shadow-lg"
        >
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Check-in Failed
          </h1>
          <p className="text-muted-foreground">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!result) return null;

  // Already checked in
  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-8 text-center max-w-md w-full shadow-lg"
        >
          <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Already Checked In
          </h1>
          <p className="text-muted-foreground mb-6">
            This ticket has already been scanned.
          </p>

          <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Attendee</span>
              <span className="font-medium">{result.attendee.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Event</span>
              <span className="font-medium">{result.attendee.event}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ticket</span>
              <span className="font-medium">{result.attendee.ticketType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Checked In At</span>
              <span className="font-medium">
                {new Date(result.attendee.checkedInAt).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success!
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-card rounded-2xl border border-border p-8 text-center max-w-md w-full shadow-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-12 w-12 text-success" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Check-in Successful!
          </h1>
          <p className="text-muted-foreground mb-8">Welcome to the event 🎉</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-muted/50 rounded-xl p-4 text-left space-y-3"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <Ticket className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              {result.attendee.event}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Attendee</span>
            <span className="font-medium">{result.attendee.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ticket Type</span>
            <span className="font-medium">{result.attendee.ticketType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Checked In</span>
            <span className="font-medium">
              {new Date(result.attendee.checkedInAt).toLocaleString()}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
