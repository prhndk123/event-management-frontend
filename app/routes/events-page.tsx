import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Calendar, Loader2 } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { EventCard } from '~/components/events/event-card';
import { EmptyState } from '~/components/shared/empty-state';
import { EVENT_CATEGORIES, LOCATIONS, EventCategory } from '~/types';
import * as eventService from '~/services/event.service';

// Define filter types that include 'all' option
type CategoryFilter = EventCategory | 'all';
type PriceRangeFilter = 'all' | 'free' | 'paid';

interface EventFilters {
  category: CategoryFilter;
  location: string;
  search: string;
  priceRange: PriceRangeFilter;
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Get initial category from URL (validate it's a valid category)
  const initialCategory = searchParams.get('category');
  const validCategory: CategoryFilter = EVENT_CATEGORIES.some(c => c.value === initialCategory)
    ? (initialCategory as EventCategory)
    : 'all';

  // Filter state
  const [filters, setFiltersState] = useState<EventFilters>({
    category: validCategory,
    location: searchParams.get('location') || 'all',
    search: '',
    priceRange: 'all',
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltersState(prev => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch events from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventService.getEvents({
      category: filters.category === 'all' ? undefined : filters.category,
      location: filters.location === 'all' ? undefined : filters.location,
      search: filters.search || undefined,
      priceRange: filters.priceRange === 'all' ? undefined : filters.priceRange,
      page: 1,
      take: 100,
    }),
  });

  const events = data?.data || [];

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.location !== 'all' ||
    filters.priceRange !== 'all' ||
    filters.search;

  const handleClearFilters = () => {
    setFiltersState({
      category: 'all',
      location: 'all',
      search: '',
      priceRange: 'all',
    });
    setSearchInput('');
    setSearchParams({});
  };

  const setFilters = (newFilters: Partial<EventFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Events</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading events...' : `Discover ${events.length} amazing events near you`}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events, venues, locations..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 input-focus"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ category: value as CategoryFilter })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Categories</SelectItem>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.location}
                onValueChange={(value) => setFilters({ location: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Locations</SelectItem>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.priceRange}
                onValueChange={(value) => setFilters({ priceRange: value as PriceRangeFilter })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pt-4 border-t border-border space-y-3"
            >
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ category: value as CategoryFilter })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Categories</SelectItem>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.location}
                onValueChange={(value) => setFilters({ location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Locations</SelectItem>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.priceRange}
                onValueChange={(value) => setFilters({ priceRange: value as PriceRangeFilter })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <EmptyState
            icon={X}
            title="Failed to load events"
            description="There was an error loading events. Please try again later."
            action={{
              label: 'Retry',
              onClick: () => window.location.reload(),
            }}
          />
        ) : events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event: any, index: number) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No events found"
            description="We couldn't find any events matching your criteria. Try adjusting your filters or search terms."
            action={{
              label: 'Clear Filters',
              onClick: handleClearFilters,
            }}
          />
        )}
      </div>
    </div>
  );
}
