import { useParams, useNavigate, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Calendar,
    MapPin,
    Star,
    Users,
    ChevronLeft,
    Loader2,
    Calendar as CalendarIcon,
    Ticket,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { RatingStars } from "~/components/shared/rating-stars";
import { formatCurrency, formatDate, formatTime } from "~/types";
import { getOrganizerProfile } from "~/services/event.service";

export default function OrganizerProfilePage() {
    const { organizerId } = useParams();
    const navigate = useNavigate();

    const { data: organizer, isLoading, error } = useQuery({
        queryKey: ["organizer", organizerId],
        queryFn: () => getOrganizerProfile(organizerId!),
        enabled: !!organizerId,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !organizer) {
        return (
            <div className="container-wide py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Organizer not found</h1>
                <p className="text-muted-foreground mb-6">The organizer you are looking for does not exist.</p>
                <Button asChild>
                    <Link to="/events">Browse Events</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Cover */}
            <div className="bg-muted h-32 w-full" />

            <div className="container-wide -mt-16 pb-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Organizer Bio & Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card rounded-xl border border-border p-6 shadow-lg relative">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <Avatar className="h-24 w-24 border-4 border-card shadow-xl">
                                    <AvatarImage src={organizer.avatar || organizer.user.avatar} />
                                    <AvatarFallback>{organizer.name?.charAt(0) || organizer.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>

                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {organizer.name || organizer.user.name}
                                    </h1>
                                    <p className="text-primary font-medium text-sm mt-1">Official Organizer</p>
                                </div>

                                <div className="flex items-center gap-4 py-2">
                                    <div className="text-center">
                                        <p className="text-xl font-bold">{organizer.totalEvents}</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Events</p>
                                    </div>
                                    <Separator orientation="vertical" className="h-8" />
                                    <div className="text-center">
                                        <p className="text-xl font-bold">{organizer.totalReviews}</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Reviews</p>
                                    </div>
                                    <Separator orientation="vertical" className="h-8" />
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 justify-center">
                                            <p className="text-xl font-bold">{organizer.rating.toFixed(1)}</p>
                                            <Star className="h-4 w-4 fill-warning text-warning" />
                                        </div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Rating</p>
                                    </div>
                                </div>

                                <div className="w-full text-left pt-4">
                                    <h3 className="font-semibold text-sm mb-2 uppercase text-muted-foreground">About</h3>
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {organizer.bio || "No biography provided."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate(-1)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back to Event
                        </Button>
                    </div>

                    {/* Right Column - Events and Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Events List */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                Organizer Events
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {organizer.events.map((event: any) => (
                                    <Link
                                        key={event.id}
                                        to={`/events/${event.id}`}
                                        className="group bg-card rounded-lg border border-border overflow-hidden hover:border-primary transition-colors shadow-sm"
                                    >
                                        <div className="aspect-video relative overflow-hidden">
                                            <img
                                                src={event.image}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge className="bg-card/80 backdrop-blur-sm text-foreground border-border">
                                                    {event.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    {formatDate(event.startDate)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.location}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {organizer.events.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <p className="text-muted-foreground">No events found for this organizer.</p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Reviews List */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Star className="h-5 w-5 text-warning fill-warning" />
                                    What Attendees Say
                                </h2>
                                <div className="flex items-center gap-2">
                                    <RatingStars rating={organizer.rating} showValue />
                                    <span className="text-sm text-muted-foreground">
                                        ({organizer.totalReviews} reviews)
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {organizer.reviews.map((review: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-4 rounded-xl border border-border bg-card shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                    {review.reviewerName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{review.reviewerName}</p>
                                                    <RatingStars rating={review.rating} size="sm" />
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed mt-2 italic">
                                            "{review.comment}"
                                        </p>
                                    </motion.div>
                                ))}
                                {organizer.reviews.length === 0 && (
                                    <div className="text-center py-12 bg-muted/30 rounded-xl">
                                        <p className="text-muted-foreground">No reviews yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
