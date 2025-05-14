import useSWR from "swr";
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "./ui/table";
import type { BrgyPromotionCategoryType } from "@/db/schema";
import { Button } from "./ui/button";
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import BrgyPromotions from "./BrgyPromotions";

export default function BrgyPromotionCategories() {
    const { data, isLoading, mutate } = useSWR<{ success: boolean, categories: BrgyPromotionCategoryType[] }>(
        "/api/promotion-categories",
        (url: string) => fetch(url).then(res => res.json())
    );
    const categories = data?.categories || [];

    async function deleteCategory(id: number) {
        const { data, error } = await actions.admin.deletePromotionCategory({ id });
        if (data) {
            toast.success("Category deleted successfully");
            mutate();
        } else {
            toast.error("Failed to delete category");
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Promotion Categories</h1>
            <AddCategoryButton onAdded={mutate} />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                    ) : categories.length > 0 ? (
                        categories.map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell>{cat.id} - {cat.name}</TableCell>
                                <TableCell>{new Date(cat.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    <BrgyPromotions categoryId={cat.id} />
                                    <Button variant="destructive" onClick={() => deleteCategory(cat.id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={3}>No categories found</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function AddCategoryButton({ onAdded }: { onAdded: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    async function addCategory(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get("name") as string;
        const { data, error } = await actions.admin.addPromotionCategory({ name });
        if (data) {
            toast.success("Category added successfully");
            onAdded();
            setOpen(false);
        } else {
            toast.error("Failed to add category");
        }
        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mb-4">Add Category</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Promotion Category</DialogTitle>
                    <DialogDescription>Enter a name for the new promotion category.</DialogDescription>
                </DialogHeader>
                <form className="flex flex-col gap-4" onSubmit={addCategory}>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="Category Name" required />
                    <Button className="w-full mt-4" type="submit" disabled={isLoading}>Add</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
} 