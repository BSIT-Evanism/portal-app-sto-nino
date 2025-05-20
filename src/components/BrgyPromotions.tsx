import useSWR from "swr";
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "./ui/table";
import type { BrgyPromotionType, BrgyPromotionCategoryType } from "@/db/schema";
import { Button } from "./ui/button";
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { UFSImageUrl } from "@/lib/utils";
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from "./ui/select";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { X } from "lucide-react";

export default function BrgyPromotions() {
    const [open, setOpen] = useState(false);
    const { data: promotionsData, isLoading, mutate } = useSWR<{ success: boolean, promotions: BrgyPromotionType[] }>(
        `/api/promotions`,
        (url: string) => fetch(url).then(res => res.json())
    );

    const promotions = promotionsData?.promotions || [];

    async function deletePromotion(id: number) {
        const { data, error } = await actions.admin.deletePromotion({ id });
        if (data) {
            toast.success("Promotion deleted successfully");
            mutate();
        } else {
            toast.error("Failed to delete promotion");
        }
    }

    return (

        <>
            <AddPromotionButton onAdded={mutate} />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
                    ) : promotions.length > 0 ? (
                        promotions.map((promo) => (
                            <TableRow key={promo.id}>
                                <TableCell>{promo.imageIdCarousel && promo.imageIdCarousel.length > 0 ?
                                    <div className="flex gap-2">
                                        {promo.imageIdCarousel.map((image) => (
                                            <img src={UFSImageUrl(image)} alt="Promotion" className="w-16 h-16 object-cover" />
                                        ))}
                                    </div>
                                    : 'No image'}</TableCell>
                                <TableCell>{promo.address}</TableCell>
                                <TableCell>{promo.description}</TableCell>
                                <TableCell>{promo.category}</TableCell>
                                <TableCell>
                                    <Button variant="destructive" onClick={() => deletePromotion(promo.id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={5}>No promotions found</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </>

    );
}

function AddPromotionButton({ onAdded }: { onAdded: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...newImages]);
            // Reset the input value to allow selecting the same file again
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    async function addPromotion(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);

        // Remove the existing imageId from formData
        formData.delete('imageId');

        // Append each selected image
        selectedImages.forEach(image => {
            formData.append('imageId', image);
        });

        const { data, error } = await actions.admin.addPromotion(formData);
        if (data) {
            toast.success("Promotion added successfully");
            onAdded();
            setOpen(false);
            setSelectedImages([]); // Clear selected images
        } else {
            toast.error("Failed to add promotion");
        }
        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mb-4">Add Promotion</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-w-full w-full p-2 sm:p-6 max-sm:scale-[0.92] max-sm:!max-w-[98vw] max-sm:!w-[98vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Promotion</DialogTitle>
                    <DialogDescription>Fill in the details to add a new promotion.</DialogDescription>
                </DialogHeader>
                <form className="flex flex-col gap-4" onSubmit={addPromotion}>
                    <div className="space-y-2">
                        <Label htmlFor="imageId">Images</Label>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                            onClick={() => document.getElementById('imageId')?.click()}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                <span className="text-sm text-gray-600">
                                    Click to upload images or drag and drop
                                </span>
                                <span className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                </span>
                            </div>
                        </div>
                        <Input
                            id="imageId"
                            name="imageId"
                            type="file"
                            multiple
                            required={selectedImages.length === 0}
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        {selectedImages.length === 0 && (
                            <p className="text-sm text-red-500">Please select at least one image</p>
                        )}
                    </div>

                    {/* Image Preview Section */}
                    {selectedImages.length > 0 && (
                        <div className="space-y-2">
                            <Label>Selected Images</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {selectedImages.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="Name" />
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Properties">Properties</SelectItem>
                            <SelectItem value="Resorts">Resorts</SelectItem>
                            <SelectItem value="Churches">Churches</SelectItem>
                            <SelectItem value="Farms">Farms</SelectItem>
                            <SelectItem value="Nature">Nature</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" placeholder="Address" />
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" placeholder="Description" />
                    <Label htmlFor="coordinates">Coordinates (separated by comma)</Label>
                    <Input
                        id="coordinates"
                        name="coordinates"
                        placeholder="Coordinates"
                        value={coordinates.join(",")}
                        onChange={(e) => {
                            const parts = e.target.value.split(",").map((v) => Number(v.trim()));
                            if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
                                setCoordinates([parts[0], parts[1]]);
                            } else {
                                setCoordinates([0, 0]);
                            }
                        }}
                    />
                    <MapContainer className="rounded-md overflow-hidden" style={{ height: "200px", width: "100%" }} center={coordinates} zoom={13} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={coordinates}>
                            <Popup>
                                {coordinates.join(",")}
                            </Popup>
                        </Marker>
                        <RecenterAutomatically lat={coordinates[0]} lng={coordinates[1]} />
                    </MapContainer>
                    <Button className="w-full mt-4" type="submit" disabled={isLoading}>Add</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const RecenterAutomatically = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng]);
    return null;
}