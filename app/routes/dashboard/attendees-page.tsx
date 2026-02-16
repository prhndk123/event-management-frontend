import { useState } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  CreditCard,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import * as organizerService from "~/services/organizer.service";
import { formatCurrency } from "~/types";
import { toast } from "sonner";

// ─── Pagination Component ─────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Buyers Tab ──────────────────────────────────────────────────────────

function BuyersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const { data: events } = useQuery({
    queryKey: ["organizer-events"],
    queryFn: organizerService.getOrganizerEvents,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["organizer-buyers", page, search, eventFilter],
    queryFn: () =>
      organizerService.getBuyers({
        page,
        limit: 10,
        search: search || undefined,
        eventId: eventFilter !== "all" ? Number(eventFilter) : undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await organizerService.exportBuyersCSV();
      toast.success("Buyers CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleEventFilterChange = (value: string) => {
    setEventFilter(value);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Buyers List</CardTitle>
            <CardDescription>
              All completed transactions across your events.
              {data?.meta && (
                <span className="ml-1 font-medium">
                  ({data.meta.total} total)
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by buyer name or email..."
              className="pl-8"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={eventFilter} onValueChange={handleEventFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {buyer.buyerName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {buyer.buyerEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {buyer.eventTitle}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{buyer.ticketQty}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(buyer.totalPaid)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50"
                      >
                        {buyer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(buyer.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No buyers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data?.meta && (
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Attendees Tab ───────────────────────────────────────────────────────

function AttendeesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const { data: events } = useQuery({
    queryKey: ["organizer-events"],
    queryFn: organizerService.getOrganizerEvents,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["organizer-attendees", page, search, eventFilter, statusFilter],
    queryFn: () =>
      organizerService.getAttendees({
        page,
        limit: 10,
        search: search || undefined,
        eventId: eventFilter !== "all" ? Number(eventFilter) : undefined,
        status:
          statusFilter !== "all"
            ? (statusFilter as "checked_in" | "registered")
            : undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await organizerService.exportAttendeesCSV();
      toast.success("Attendees CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleEventFilterChange = (value: string) => {
    setEventFilter(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Attendee List</CardTitle>
            <CardDescription>
              Seat-level view of all registered attendees.
              {data?.meta && (
                <span className="ml-1 font-medium">
                  ({data.meta.total} total)
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="pl-8"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={eventFilter} onValueChange={handleEventFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="checked_in">Checked In</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attendee</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Ticket Type</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {person.attendeeName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {person.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[180px] truncate">
                      {person.event}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{person.ticketType}</Badge>
                    </TableCell>
                    <TableCell>
                      {person.checkedIn ? (
                        <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span>Checked In</span>
                            {person.checkedInAt && (
                              <span className="text-xs font-normal text-muted-foreground">
                                {new Date(
                                  person.checkedInAt,
                                ).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <div className="h-2 w-2 rounded-full bg-gray-300" />
                          Registered
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {person.buyerName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(person.totalPaid)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No attendees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data?.meta && (
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────

export default function AttendeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Attendees & Buyers
        </h1>
        <p className="text-muted-foreground">
          Manage buyer transactions and attendee check-in status.
        </p>
      </div>

      <Tabs defaultValue="buyers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buyers" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Buyers
          </TabsTrigger>
          <TabsTrigger value="attendees" className="gap-2">
            <Users className="h-4 w-4" />
            Attendees
          </TabsTrigger>
        </TabsList>
        <TabsContent value="buyers">
          <BuyersTab />
        </TabsContent>
        <TabsContent value="attendees">
          <AttendeesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
