import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  FileImage,
  Loader2,
  Download,
  Ticket,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { CountdownTimer } from "~/components/shared/countdown-timer";
import { StatusBadge } from "~/components/shared/status-badge";
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  TransactionStatus,
} from "~/types";
import { toast } from "sonner";
import {
  getTransactionById,
  uploadPaymentProof,
  getTickets,
} from "~/services/transaction.service";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

interface Transaction {
  id: number;
  status: string;
  event: {
    title: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    venue?: string;
  };
  ticketType: {
    name: string;
    price: number;
  };
  ticketQty: number;
  totalPrice: number;
  voucher?: {
    discountType: string;
    discountAmount: number;
  };
  coupon?: {
    discountAmount: number;
  };
  pointsUsed: number;
  finalPrice: number;
  createdAt: string;
  expiredAt: string;
}

interface TicketData {
  transactionId: number;
  event: {
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    venue: string;
    image: string;
  };
  ticketType: { name: string; price: number };
  ticketQty: number;
  tickets: Array<{
    id: number;
    qrToken: string;
    attendeeName: string;
    attendeeEmail: string;
    checkedIn: boolean;
    checkedInAt: string | null;
  }>;
}

export default function PaymentPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>("waiting_payment");
  const ticketRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch transaction data on mount
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) {
        toast.error("Transaction ID not found");
        navigate("/transactions");
        return;
      }

      try {
        setIsLoading(true);
        const data = await getTransactionById(Number(transactionId));
        setTransaction(data);
        const status = data.status.toLowerCase() as TransactionStatus;
        setTransactionStatus(status);

        // If DONE, also fetch ticket data
        if (status === "done") {
          try {
            const tickets = await getTickets(Number(transactionId));
            setTicketData(tickets);
          } catch {
            // Tickets may not be available yet
          }
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load transaction",
        );
        navigate("/transactions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleSubmitProof = async () => {
    if (!uploadedFile || !transactionId) {
      toast.error("Please upload payment proof");
      return;
    }

    try {
      setIsSubmitting(true);
      const reader = new FileReader();
      reader.readAsDataURL(uploadedFile);
      reader.onload = async () => {
        try {
          const base64String = reader.result as string;
          await uploadPaymentProof(Number(transactionId), {
            paymentProof: base64String,
          });
          setTransactionStatus("waiting_confirmation");
          window.scrollTo({ top: 0, behavior: "smooth" });
          toast.success("Payment proof uploaded! Waiting for confirmation.");
        } catch (error: any) {
          toast.error(
            error.response?.data?.message || "Failed to upload payment proof",
          );
        } finally {
          setIsSubmitting(false);
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setIsSubmitting(false);
      };
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to upload payment proof",
      );
      setIsSubmitting(false);
    }
  };

  const handleExpire = () => {
    setTransactionStatus("expired");
    toast.error("Payment time expired");
  };

  const handleDownloadTicket = useCallback(
    async (index: number) => {
      const ref = ticketRefs.current[index];
      if (!ref || !ticketData) return;

      try {
        const dataUrl = await toPng(ref, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });
        const link = document.createElement("a");
        const eventName = ticketData.event.title
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase();
        link.download = `ticket-${eventName}-${index + 1}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Ticket downloaded!");
      } catch {
        toast.error("Failed to download ticket");
      }
    },
    [ticketData],
  );

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case "waiting_payment":
        return <Clock className="h-12 w-12 text-warning" />;
      case "waiting_confirmation":
        return <AlertCircle className="h-12 w-12 text-info" />;
      case "done":
        return <CheckCircle className="h-12 w-12 text-success" />;
      case "rejected":
      case "expired":
      case "cancelled":
        return <XCircle className="h-12 w-12 text-destructive" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-muted/30 py-8 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Transaction not found</p>
        </div>
      </div>
    );
  }

  // Calculate discounts
  const voucherDiscount = transaction.voucher
    ? transaction.voucher.discountType === "PERCENTAGE"
      ? Math.floor(
          transaction.totalPrice * (transaction.voucher.discountAmount / 100),
        )
      : transaction.voucher.discountAmount
    : 0;
  const couponDiscount = transaction.coupon?.discountAmount || 0;

  const bankAccount = {
    bank: "Bank Central Asia (BCA)",
    accountNumber: "1234567890",
    accountName: "PT Eventku Indonesia",
  };

  const frontendUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container-narrow">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/transactions")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payment</h1>
            <p className="text-muted-foreground">Order #{transactionId}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column — Status + Payment Actions + Tickets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="flex justify-center mb-4">{getStatusIcon()}</div>
              <StatusBadge status={transactionStatus} className="mb-2" />

              {transactionStatus === "waiting_payment" && (
                <>
                  <p className="text-muted-foreground mb-4">
                    Please complete your payment within:
                  </p>
                  <CountdownTimer
                    expiresAt={transaction.expiredAt}
                    onExpire={handleExpire}
                    className="justify-center"
                  />
                </>
              )}

              {transactionStatus === "waiting_confirmation" && (
                <p className="text-muted-foreground">
                  We're reviewing your payment. This usually takes 1-24 hours.
                </p>
              )}

              {transactionStatus === "done" && (
                <p className="text-muted-foreground">
                  Your payment has been confirmed! Check your email for tickets.
                </p>
              )}

              {transactionStatus === "expired" && (
                <p className="text-muted-foreground">
                  Your payment time has expired. Please create a new order.
                </p>
              )}
            </div>

            {/* Bank Transfer Info */}
            {transactionStatus === "waiting_payment" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Bank Transfer Details
                </h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Bank</p>
                    <p className="font-medium">{bankAccount.bank}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      Account Number
                    </p>
                    <p className="font-mono font-bold text-lg">
                      {bankAccount.accountNumber}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      Account Name
                    </p>
                    <p className="font-medium">{bankAccount.accountName}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">
                      Transfer Amount
                    </p>
                    <p className="font-bold text-2xl text-primary">
                      {formatCurrency(transaction.finalPrice)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Payment Proof */}
            {transactionStatus === "waiting_payment" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Upload Payment Proof
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-proof">Payment Screenshot</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="payment-proof"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                      >
                        {uploadedFile ? (
                          <div className="flex items-center gap-2 text-foreground">
                            <FileImage className="h-6 w-6 text-primary" />
                            <span className="text-sm font-medium">
                              {uploadedFile.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                              PNG, JPG up to 5MB
                            </span>
                          </div>
                        )}
                        <Input
                          id="payment-proof"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>

                  <Button
                    className="w-full btn-gradient"
                    size="lg"
                    onClick={handleSubmitProof}
                    disabled={!uploadedFile || isSubmitting}
                  >
                    {isSubmitting ? "Uploading..." : "Submit Payment Proof"}
                  </Button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* 🎟 YOUR TICKETS — shown when status is DONE */}
            {/* ═══════════════════════════════════════════════════════ */}
            {transactionStatus === "done" &&
              ticketData &&
              ticketData.tickets.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">
                      Your Tickets
                    </h2>
                  </div>

                  {ticketData.tickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 }}
                    >
                      {/* Downloadable ticket card */}
                      <div
                        ref={(el) => {
                          ticketRefs.current[index] = el;
                        }}
                        className="bg-card rounded-2xl border border-border overflow-hidden"
                        style={{ maxWidth: 420 }}
                      >
                        {/* Ticket header gradient */}
                        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-primary-foreground">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs opacity-80">
                                Order #{ticketData.transactionId}
                              </p>
                              <h3 className="font-bold text-lg leading-tight mt-1">
                                {ticketData.event.title}
                              </h3>
                            </div>
                            <div className="text-right">
                              <p className="text-xs opacity-80">Ticket</p>
                              <p className="font-bold text-lg">
                                {index + 1}/{ticketData.tickets.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Ticket body */}
                        <div className="px-6 py-5">
                          <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Date
                              </p>
                              <p className="font-medium">
                                {formatDate(ticketData.event.startDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Ticket Type
                              </p>
                              <p className="font-medium">
                                {ticketData.ticketType.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Attendee
                              </p>
                              <p className="font-medium">
                                {ticket.attendeeName}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Status
                              </p>
                              {ticket.checkedIn ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                                  <CheckCircle className="h-3 w-3" /> Checked In
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  Registered
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Dashed separator */}
                          <div className="border-t-2 border-dashed border-border my-4 relative">
                            <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-muted/30" />
                            <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-muted/30" />
                          </div>

                          {/* QR Code */}
                          <div className="flex flex-col items-center">
                            <div className="bg-white p-3 rounded-xl shadow-sm border">
                              <QRCode
                                value={`${frontendUrl}/check-in/${ticket.qrToken}`}
                                size={180}
                                level="M"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                              Scan at venue for check-in
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Download button (outside the ref so it's not in the PNG) */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full max-w-[420px]"
                        onClick={() => handleDownloadTicket(index)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Ticket{" "}
                        {ticketData.tickets.length > 1 ? `#${index + 1}` : ""}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
          </motion.div>

          {/* Right Column — Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-card rounded-xl border border-border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Order Summary
              </h2>

              <div className="mb-4">
                <h3 className="font-medium text-foreground">
                  {transaction.event.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {transaction.ticketType.name} × {transaction.ticketQty}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Order placed: {formatDateTime(transaction.createdAt)}
                </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(transaction.totalPrice)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Voucher Discount</span>
                    <span>-{formatCurrency(voucherDiscount)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                {transaction.pointsUsed > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Points Used</span>
                    <span>-{formatCurrency(transaction.pointsUsed)}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(transaction.finalPrice)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
