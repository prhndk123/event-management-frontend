import { Link } from 'react-router';
import { Plus, Search, MoreHorizontal, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { formatCurrency, formatDateTime } from '~/types';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as eventService from '~/services/event.service';
import { toast } from 'sonner';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: events, isLoading } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: () => eventService.getOrganizerEvents(),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (eventId: number) => eventService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      toast.success("Event deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete event");
    },
  });

  const handleDelete = (eventId: number, eventTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      deleteMutation.mutate(eventId);
    }
  };

  const filteredEvents = events?.filter((event: any) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage your events, track sales, and view performance.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/events/create">
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            A list of all your events including their title, date, location, and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Event Details</TableHead>
                  <TableHead>Date & Location</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredEvents && filteredEvents.length > 0 ? (
                  filteredEvents.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10 rounded-lg">
                          <AvatarImage src={event.image} alt={event.title} className="object-cover" />
                          <AvatarFallback className="rounded-lg">EV</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{event.category}</div>
                        <div className="text-xs font-semibold mt-1">
                          {event.ticketTypes?.length > 0 ? formatCurrency(event.ticketTypes[0].price) : "Free"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(event.startDate)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {event._count?.attendees || 0} / {event.ticketTypes?.reduce((acc: number, tt: any) => acc + tt.totalSeat, 0) || 0}
                        </div>
                        <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${((event._count?.attendees || 0) / (event.ticketTypes?.reduce((acc: number, tt: any) => acc + tt.totalSeat, 0) || 1)) * 100}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          event.status === 'PUBLISHED' ? 'default' :
                            event.status === 'COMPLETED' ? 'secondary' : 'outline'
                        } className="capitalize">
                          {event.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={event.slug ? `/events/${event.slug}` : `/events/${event.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/events/edit/${event.id}`}>Edit Event</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleDelete(event.id, event.title)}
                            >
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No events found. Create your first event!
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
