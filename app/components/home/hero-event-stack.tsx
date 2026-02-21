import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import { Link } from "react-router";

interface Event {
  id: number;
  title: string;
  slug?: string;
  image: string;
  startDate: string;
  location: string;
  category: string;
}

interface HeroEventStackProps {
  events: Event[];
}

export function HeroEventStack({ events }: HeroEventStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4000); // Cycle every 4 seconds

    return () => clearInterval(interval);
  }, [events.length]);

  if (!events.length) return null;

  // We want to show a stack of 3 cards if possible
  const visibleEvents = [
    events[currentIndex % events.length],
    events[(currentIndex + 1) % events.length],
    events[(currentIndex + 2) % events.length],
  ].filter(Boolean);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-4/5 sm:aspect-square lg:aspect-4/5">
      <AnimatePresence mode="popLayout">
        {visibleEvents.map((event, index) => {
          // Calculate z-index and scale based on position in stack
          // index 0 is the front card
          const isFront = index === 0;

          return (
            <motion.div
              key={`${event.id}-${currentIndex + index}`} // Ensure unique key for animation
              layoutId={`card-${event.id}`}
              initial={{
                scale: 0.9 - index * 0.05,
                y: index * 20 - 40, // Start slightly higher
                opacity: 0,
                zIndex: 3 - index,
              }}
              animate={{
                scale: 1 - index * 0.05,
                y: index * 15, // Stack offset
                x: index * 10, // Slight horizontal offset for style
                opacity: 1 - index * 0.2,
                zIndex: 3 - index,
                rotate: isFront ? 0 : 2 * (index % 2 === 0 ? 1 : -1), // Subtly rotate back cards
              }}
              exit={{
                opacity: 0,
                scale: 1.1,
                x: -100,
                rotate: -10,
                transition: { duration: 0.4 },
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
              style={{
                transformOrigin: "bottom center",
              }}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-background bg-card">
                <img
                  src={
                    event.image ||
                    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80"
                  }
                  alt={event.title}
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="inline-block px-3 py-1 bg-primary/90 rounded-full text-xs font-semibold mb-3">
                    {event.category}
                  </div>
                  <h3 className="text-2xl font-bold leading-tight mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="flex flex-col gap-2 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {isFront && (
                    <div className="mt-4">
                      <Link
                        to={event.slug ? `/events/${event.slug}` : `/events/${event.id}`}
                        className="inline-flex items-center justify-center w-full py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Decorative backing elements */}
      <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl -z-10" />
    </div>
  );
}
