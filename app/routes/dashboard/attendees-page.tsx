import { Search, Mail, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as eventService from '~/services/event.service';

export default function AttendeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: attendees, isLoading } = useQuery({
    queryKey: ['organizer-attendees'],
    queryFn: () => eventService.getOrganizerAttendees(),
  });

  const { data: events } = useQuery({
    queryKey: ['organizer-events-list'],
    queryFn: () => eventService.getOrganizerEvents(),
  });

  const filteredAttendees = attendees?.filter((person: any) => {
    const matchesSearch =
      person.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEvent =
      eventFilter === "all" || person.event.id.toString() === eventFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "checked_in" && person.checkedIn) ||
      (statusFilter === "registered" && !person.checkedIn);

    return matchesSearch && matchesEvent && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendees</h1>
          <p className="text-muted-foreground">
            Manage attendee lists and check-in status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" /> Email All
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Attendee List</CardTitle>
          <CardDescription>
            List of all registered attendees across your events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events?.map((event: any) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Check-in Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredAttendees && filteredAttendees.length > 0 ? (
                  filteredAttendees.map((person: any) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={person.user.avatar} />
                            <AvatarFallback>{person.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{person.user.name}</span>
                            <span className="text-xs text-muted-foreground">{person.user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{person.event.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{person.ticketType.name}</Badge>
                      </TableCell>
                      <TableCell>
                        {person.checkedIn ? (
                          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Checked In
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <div className="h-2 w-2 rounded-full bg-gray-300" />
                            Registered
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Details</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No attendees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
