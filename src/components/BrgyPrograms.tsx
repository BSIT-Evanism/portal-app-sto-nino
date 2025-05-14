import useSWR, { useSWRConfig } from "swr"
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "./ui/table"
import type { BrgyProgramType } from "@/db/schema"
import { Button } from "./ui/button"
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogDescription } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useState } from "react"
import { actions } from "astro:actions"
import { toast } from "sonner"
import { UFSImageUrl } from "@/lib/utils"

export default function BrgyPrograms() {
    const { data: programs, isLoading, mutate } = useSWR<BrgyProgramType[]>("/api/brgy-programs", (url: string) => fetch(url).then(res => res.json()))

    async function deleteProgram(programId: number) {
        const { data, error } = await actions.admin.deleteBrgyProgram({ programId })
        if (data) {
            toast.success("Program deleted successfully")
            mutate()
        } else {
            toast.error("Failed to delete program")
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Brgy Programs</h1>
            <AddProgramButton onAdded={mutate} />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow> :
                        programs && programs.length > 0 ? programs.map((program) => (
                            <TableRow key={program.id}>
                                <TableCell>{program.name}</TableCell>
                                <TableCell>{program.description}</TableCell>
                                <TableCell>{program.imageId ? <img src={UFSImageUrl(program.imageId)} alt="Program" className="w-16 h-16 object-cover" /> : 'No image'}</TableCell>
                                <TableCell>
                                    <Button variant="destructive" onClick={() => deleteProgram(program.id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={4}>No programs found</TableCell></TableRow>
                    }
                </TableBody>
            </Table>
        </div>
    )
}

function AddProgramButton({ onAdded }: { onAdded: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    async function addProgram(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.target as HTMLFormElement)
        const { data, error } = await actions.admin.addBrgyProgram(formData)
        if (data) {
            toast.success("Program added successfully")
            onAdded()
            setOpen(false)
        } else {
            toast.error("Failed to add program")
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mb-4">Add Program</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Barangay Program</DialogTitle>
                    <DialogDescription>Fill in the details to add a new barangay program.</DialogDescription>
                </DialogHeader>
                <form className="flex flex-col gap-4" onSubmit={addProgram}>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="Program Name" required />
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" placeholder="Description" required />
                    <Label htmlFor="image">Image (optional)</Label>
                    <Input id="image" name="image" type="file" accept="image/*" />
                    <Button className="w-full mt-4" type="submit" disabled={isLoading}>Add</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}