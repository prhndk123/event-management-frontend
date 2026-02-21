import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event, formatCurrency, formatDate } from '~/types';
import { Badge } from '~/components/ui/badge';

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const isFree = event.price === 0;
  const soldOut = event.availableSeats === 0;
  const hasEnded = new Date(event.endDate) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={event.slug ? `/events/${event.slug}` : `/events/${event.id}`}
        className="group block card-elevated overflow-hidden"
      >
        {/* Image */}
        <div className="relative aspect-16/10 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 overlay-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isFree && (
              <Badge className="bg-success text-success-foreground border-0">
                Free
              </Badge>
            )}
            {hasEnded ? (
              <Badge variant="destructive">
                Ended
              </Badge>
            ) : soldOut ? (
              <Badge variant="destructive">
                Sold Out
              </Badge>
            ) : null}
          </div>

          {/* Category */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="capitalize bg-background/90 backdrop-blur-sm">
              {event.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(event.startDate)}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{event.venue}, {event.location}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(event.price)}
            </span>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {hasEnded
                    ? "Event Ended"
                    : soldOut
                      ? "Sold Out"
                      : `${Math.max(event.availableSeats, 0)} seats left`}
                </span>
              </div>
              {!hasEnded && event.totalSeats > 0 && (
                <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${soldOut ? 'bg-destructive' : 'bg-primary'}`}
                    style={{ width: `${Math.min(((event.totalSeats - Math.max(event.availableSeats, 0)) / event.totalSeats) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
