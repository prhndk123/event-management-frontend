import { useState } from "react";
import { useForm, useFieldArray, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router";
import {
    Calendar as CalendarIcon,
    MapPin,
    Plus,
    Trash2,
    Upload,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Building2,
    Tag,
    Info
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
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";

import { EVENT_CATEGORIES, LOCATIONS } from "~/types";
import { createEvent } from "~/services/event.service";
import { settingsService } from "~/modules/settings/settings.service";

const ticketTypeSchema = z.object({
    name: z.string().min(1, "Ticket name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be at least 0"),
    totalSeat: z.coerce.number().min(1, "At least 1 seat required"),
});

const createEventSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: z.string().min(1, "Category is required"),
    location: z.string().min(1, "Location is required"),
    venue: z.string().min(1, "Venue is required"),
    startDate: z.coerce.date().refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date > today;
    }, {
        message: "Start date must be in the future",
    }),
    endDate: z.coerce.date().refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date > today;
    }, {
        message: "End date must be in the future",
    }),
    image: z.string().optional(),
    ticketMode: z.enum(["simple", "custom"]),
    // Simple Mode Fields
    simplePrice: z.coerce.number().min(0).optional(),
    simpleSeats: z.coerce.number().min(1).optional(),
    isFree: z.boolean().default(false),
    // Custom Mode Fields
    ticketTypes: z.array(ticketTypeSchema).optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [tempFormData, setTempFormData] = useState<CreateEventFormValues | null>(null);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateEventFormValues>({
        resolver: zodResolver(createEventSchema) as Resolver<CreateEventFormValues>,
        defaultValues: {
            ticketMode: "simple",
            isFree: false,
            simplePrice: 0,
            simpleSeats: 1,
            ticketTypes: [{ name: "General Admission", price: 0, totalSeat: 50, description: "Standard Entry" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "ticketTypes",
    });

    const ticketMode = watch("ticketMode");
    const isFree = watch("isFree");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image size must be less than 2MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit: SubmitHandler<CreateEventFormValues> = (data) => {
        setTempFormData(data);
        setShowConfirmDialog(true);
    };

    const handleConfirmSubmit = async () => {
        if (!tempFormData) return;

        setIsSubmitting(true);
        setShowConfirmDialog(false);

        try {
            let imageUrl = "";
            if (imageFile) {
                const response = await settingsService.uploadAvatar({ avatar: imageFile });
                imageUrl = response.fileURL;
            }

            const payload: any = {
                title: tempFormData.title,
                description: tempFormData.description,
                category: tempFormData.category,
                location: tempFormData.location,
                venue: tempFormData.venue,
                startDate: tempFormData.startDate,
                endDate: tempFormData.endDate,
                image: imageUrl || null,
                ticketTypes: [],
            };

            if (tempFormData.ticketMode === "simple") {
                payload.ticketTypes = [{
                    name: "General Admission",
                    price: tempFormData.isFree ? 0 : (tempFormData.simplePrice || 0),
                    totalSeat: tempFormData.simpleSeats || 1,
                    description: "Standard Entry",
                }];
            } else {
                payload.ticketTypes = tempFormData.ticketTypes?.map(tt => ({
                    name: tt.name,
                    price: tt.price,
                    totalSeat: tt.totalSeat,
                    description: tt.description,
                })) || [];
            }

            await createEvent(payload);
            toast.success("Event created successfully!");
            navigate("/dashboard/events");
        } catch (error: any) {
            console.error("Create event error:", error);
            toast.error(error.response?.data?.message || "Failed to create event");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Organizer Dashboard</Badge>
                <span>/</span>
                <span className="text-foreground">Create Event</span>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
                    <p className="text-muted-foreground">Fill in the details to host your next amazing event.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            <CardTitle>Basic Information</CardTitle>
                        </div>
                        <CardDescription>Give your event a name and let people know what it's about.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Jakarta Tech Conference 2024"
                                {...register("title")}
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Label htmlFor="image">Event Header Image (Optional)</Label>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-32 border-2 border-dashed rounded-md flex items-center justify-center bg-muted overflow-hidden relative group">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                        )}
                                        <input
                                            type="file"
                                            id="image-upload"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <p className="font-medium text-foreground">Click to upload</p>
                                        <p>PNG, JPG up to 2MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your event in detail..."
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
                        <CardDescription>Where and when is the magic happening?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date & Time</Label>
                                <div className="relative">
                                    <Input
                                        id="startDate"
                                        type="datetime-local"
                                        className="pl-10"
                                        {...register("startDate")}
                                    />
                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date & Time</Label>
                                <div className="relative">
                                    <Input
                                        id="endDate"
                                        type="datetime-local"
                                        className="pl-10"
                                        {...register("endDate")}
                                    />
                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
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
                                        placeholder="e.g. Grand Ballroom, Hotel Indonesia"
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="h-5 w-5 text-primary" />
                                <CardTitle>Tickets & Pricing</CardTitle>
                            </div>
                            <div className="flex items-center gap-2 bg-background p-1 rounded-lg border shadow-sm">
                                <Button
                                    type="button"
                                    variant={ticketMode === "simple" ? "default" : "ghost"}
                                    size="sm"
                                    className="h-8"
                                    onClick={() => setValue("ticketMode", "simple")}
                                >
                                    Simple
                                </Button>
                                <Button
                                    type="button"
                                    variant={ticketMode === "custom" ? "default" : "ghost"}
                                    size="sm"
                                    className="h-8"
                                    onClick={() => setValue("ticketMode", "custom")}
                                >
                                    Custom Types
                                </Button>
                            </div>
                        </div>
                        <CardDescription>
                            {ticketMode === "simple"
                                ? "Setup a single ticket type for your event quickly."
                                : "Create multiple ticket tiers (e.g. VIP, Early Bird, Regular)."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {ticketMode === "simple" ? (
                            <div className="space-y-6 bg-background p-6 rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Is this a free event?</Label>
                                        <p className="text-sm text-muted-foreground">Tickets will be issued at no cost.</p>
                                    </div>
                                    <Switch
                                        checked={isFree}
                                        onCheckedChange={(val) => {
                                            setValue("isFree", val);
                                            if (val) setValue("simplePrice", 0);
                                        }}
                                    />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="simplePrice">Ticket Price (IDR)</Label>
                                        <div className="relative">
                                            <Input
                                                id="simplePrice"
                                                type="number"
                                                placeholder="0"
                                                className="pl-12"
                                                disabled={isFree}
                                                {...register("simplePrice")}
                                            />
                                            <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">Rp</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="simpleSeats">Available Quantity</Label>
                                        <Input
                                            id="simpleSeats"
                                            type="number"
                                            placeholder="100"
                                            {...register("simpleSeats")}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="relative bg-background p-6 rounded-xl border shadow-sm space-y-4 group">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-primary">Ticket Type #{index + 1}</h4>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Name</Label>
                                                <Input placeholder="VIP, Early Bird, etc." {...register(`ticketTypes.${index}.name`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Price (IDR)</Label>
                                                <div className="relative">
                                                    <Input type="number" className="pl-12" {...register(`ticketTypes.${index}.price`)} />
                                                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">Rp</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Quantity</Label>
                                                <Input type="number" {...register(`ticketTypes.${index}.totalSeat`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Short Description</Label>
                                                <Input placeholder="What's included in this ticket?" {...register(`ticketTypes.${index}.description`)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-12 border-dashed border-2 hover:bg-primary/5 transition-colors"
                                    onClick={() => append({ name: "", price: 0, totalSeat: 10, description: "" })}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Another Ticket Type
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-primary/10 px-6 py-4 rounded-b-lg">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <p>You can edit ticket availability later, but not the price once sales begin.</p>
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
                        Create Event
                    </Button>
                </div>
            </form>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            Ready to create your event?
                        </DialogTitle>
                        <DialogDescription>
                            This will create your event as a <strong>Draft</strong>. You can publish it once you've reviewed everything.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Title</span>
                            <span className="font-medium">{tempFormData?.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium text-right">
                                {tempFormData?.startDate ? new Date(tempFormData.startDate).toLocaleDateString() : ""}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tickets</span>
                            <span className="font-medium">
                                {tempFormData?.ticketMode === "simple" ? "1 Type" : `${tempFormData?.ticketTypes?.length || 0} Types`}
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isSubmitting}>
                            Review Again
                        </Button>
                        <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm & Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
