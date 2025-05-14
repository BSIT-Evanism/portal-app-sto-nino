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
                                <TableCell>{promo.imageId ? <img src={UFSImageUrl(promo.imageId)} alt="Promotion" className="w-16 h-16 object-cover" /> : 'No image'}</TableCell>
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
    async function addPromotion(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const imageId = formData.get("imageId") as string;
        const category = formData.get("category") as string;
        const address = formData.get("address") as string;
        const description = formData.get("description") as string;
        const { data, error } = await actions.admin.addPromotion(formData);
        if (data) {
            toast.success("Promotion added successfully");
            onAdded();
            setOpen(false);
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Promotion</DialogTitle>
                    <DialogDescription>Fill in the details to add a new promotion.</DialogDescription>
                </DialogHeader>
                <form className="flex flex-col gap-4" onSubmit={addPromotion}>
                    <Label htmlFor="imageId">Image</Label>
                    <Input id="imageId" name="imageId" type="file" required />
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