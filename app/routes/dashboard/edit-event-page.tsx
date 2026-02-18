import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
    Calendar as CalendarIcon,
    MapPin,
    Loader2,
    CheckCircle2,
    Building2,
    Tag,
    Info,
    ChevronLeft
} from "lucide-react";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { DatePicker } from "~/components/ui/date-picker";

import { EVENT_CATEGORIES, LOCATIONS } from "~/types";
import { getEventById, updateEvent } from "~/services/event.service";

const editEventSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: z.string().min(1, "Category is required"),
    location: z.string().min(1, "Location is required"),
    venue: z.string().min(1, "Venue is required"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    price: z.coerce.number().min(0, "Price must be at least 0"),
    availableSeats: z.coerce.number().min(0, "Seats must be at least 0"),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
});

type EditEventFormValues = z.infer<typeof editEventSchema>;

export default function EditEventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [tempFormData, setTempFormData] = useState<EditEventFormValues | null>(null);

    // Fetch Event Data
    const { data: event, isLoading, error } = useQuery({
        queryKey: ["event", eventId],
        queryFn: () => getEventById(eventId!),
        enabled: !!eventId,
    });

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<EditEventFormValues>({
        resolver: zodResolver(editEventSchema) as Resolver<EditEventFormValues>,
    });

    // Pre-fill form
    useEffect(() => {
        if (event) {
            reset({
                title: event.title,
                description: event.description,
                category: event.category,
                location: event.location,
                venue: event.venue,
                startDate: new Date(event.startDate),
                endDate: new Date(event.endDate),
                price: event.price || 0,
                availableSeats: event.totalSeats || 0,
            });
        }
    }, [event, reset]);

    const onSubmit: SubmitHandler<EditEventFormValues> = (data) => {
        setTempFormData(data);
        setShowConfirmDialog(true);
    };

    const handleConfirmSubmit = async () => {
        if (!tempFormData || !eventId) return;

        setIsSubmitting(true);
        setShowConfirmDialog(false);

        try {
            const payload = {
                ...tempFormData,
                startDate: tempFormData.startDate.toISOString(),
                endDate: tempFormData.endDate.toISOString(),
            };

            await updateEvent(Number(eventId), payload);
            toast.success("Event updated successfully!");
            navigate("/dashboard/events");
        } catch (error: any) {
            console.error("Update event error:", error);
            toast.error(error.response?.data?.message || "Failed to update event");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Event not found</h1>
                <Button onClick={() => navigate("/dashboard/events")}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Organizer Dashboard</Badge>
                <span>/</span>
                <span className="text-foreground">Edit Event</span>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
                    <p className="text-muted-foreground">Update your event details and settings.</p>
                </div>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            <CardTitle>Basic Information</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input
                                id="title"
                                {...register("title")}
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={watch("category")} onValueChange={(val) => setValue("category", val, { shouldValidate: true })}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EVENT_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                className="min-h-[150px]"
                                {...register("description")}
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Date & Location */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <CardTitle>Date & Location</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value}
                                            setDate={(date) => field.onChange(date)}
                                        />
                                    )}
                                />
                                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value}
                                            setDate={(date) => field.onChange(date)}
                                        />
                                    )}
                                />
                                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">City</Label>
                                <Select value={watch("location")} onValueChange={(val) => setValue("location", val, { shouldValidate: true })}>
                                    <SelectTrigger id="location">
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LOCATIONS.map((loc) => (
                                            <SelectItem key={loc} value={loc}>
                                                {loc}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="venue">Venue Name</Label>
                                <div className="relative">
                                    <Input
                                        id="venue"
                                        className="pl-10"
                                        {...register("venue")}
                                    />
                                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                {errors.venue && <p className="text-xs text-destructive">{errors.venue.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tickets & Pricing */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary" />
                            <CardTitle>Tickets & Pricing</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background p-6 rounded-xl border shadow-sm">
                            <div className="space-y-2">
                                <Label htmlFor="price">Ticket Price (IDR)</Label>
                                <div className="relative">
                                    <Input
                                        id="price"
                                        type="number"
                                        className="pl-12"
                                        {...register("price")}
                                    />
                                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">Rp</span>
                                </div>
                                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="availableSeats">Total Capacity</Label>
                                <Input
                                    id="availableSeats"
                                    type="number"
                                    {...register("availableSeats")}
                                />
                                {errors.availableSeats && <p className="text-xs text-destructive">{errors.availableSeats.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-primary/10 px-6 py-4 rounded-b-lg">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <p>You cannot reduce capacity below the number of tickets already sold.</p>
                        </div>
                    </CardFooter>
                </Card>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={() => navigate("/dashboard/events")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="lg"
                        className="px-8"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save changes to your event?</DialogTitle>
                        <DialogDescription>
                            Confirm that you want to update the event details for <strong>{event.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm & Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const AlertCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
