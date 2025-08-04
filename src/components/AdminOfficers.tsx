import { useState } from "react";
import useSWR from "swr";
import { Input } from "./ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { actions } from "astro:actions";

const POSITIONS = ["chairman", "secretary", "treasurer", "councilor"] as const;
const TYPES = ["main", "sk"] as const;
type PositionType = typeof POSITIONS[number];

function fetcher(url: string) {
    return fetch(url).then((res) => res.json());
}

export default function AdminOfficers() {
    const { data, error, mutate, isLoading } = useSWR("/api/feed/officers", fetcher);
    const [editState, setEditState] = useState<{ id: number | null; type: "main" | "sk" | null }>({ id: null, type: null });
    const [form, setForm] = useState<{
        name: string;
        position: PositionType;
        type: "main" | "sk";
        description: string;
    }>({
        name: "",
        position: POSITIONS[0],
        type: "main",
        description: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // Add Officer Form State
    const [addForm, setAddForm] = useState<{
        name: string;
        position: PositionType;
        type: "main" | "sk";
        description: string;
    }>({
        name: "",
        position: POSITIONS[0],
        type: "main",
        description: "",
    });
    const [adding, setAdding] = useState(false);

    if (isLoading) return <div>Loading officers...</div>;
    if (error) return <div className="text-red-600">Failed to load officers.</div>;

    // Use API structure: { officials, skOfficers }
    const mainOfficers = data?.officials || [];
    const skOfficers = data?.skOfficers || [];
    function startEdit(officer: any, type: "main" | "sk") {
        setEditState({ id: officer.id, type });
        setForm({
            name: officer.name,
            position: officer.position,
            type,
            description: officer.description,
        });
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await actions.admin.updateOfficers({
                officerId: editState.id ?? 0,
                name: form.name,
                position: form.position,
                type: form.type,
                description: form.description,
            });
            if (res?.error) {
                toast.error(res.error.message || "Failed to update officer");
            } else {
                toast.success("Officer updated");
                setEditState({ id: null, type: null });
                mutate();
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to update officer");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(officerId: number, type: "main" | "sk") {
        try {
            const res = await actions.admin.deleteOfficer({
                officerId,
                type,
            });
            if (res?.error) {
                toast.error(res.error.message || "Failed to delete officer");
            } else {
                toast.success("Officer deleted");
                mutate();
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete officer");
        }
    }

    async function handleAddOfficer(e: React.FormEvent) {
        e.preventDefault();
        setAdding(true);
        try {
            const res = await actions.admin.addOfficers({
                name: addForm.name,
                position: addForm.position,
                type: addForm.type,
                description: addForm.description,
            });
            if (res?.error) {
                toast.error(res.error.message || "Failed to add officer");
            } else {
                toast.success("Officer added");
                setAddForm({ name: "", position: POSITIONS[0], type: "main", description: "" });
                mutate();
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to add officer");
        } finally {
            setAdding(false);
        }
    }

    return (
        <div className="space-y-10">
            <h2 className="text-xl font-bold mb-4">Barangay Officials</h2>
            {/* Add Officer Form */}
            <form onSubmit={handleAddOfficer} className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-lg shadow-sm border mb-8">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                        value={addForm.name}
                        onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                        required
                        className="w-48"
                        disabled={adding}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Position</label>
                    <Select
                        value={addForm.position}
                        onValueChange={val => setAddForm(f => ({ ...f, position: val as typeof POSITIONS[number] }))}
                        disabled={adding}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {POSITIONS.map(pos => (
                                <SelectItem key={pos} value={pos}>
                                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Type</label>
                    <Select
                        value={addForm.type}
                        onValueChange={val => setAddForm(f => ({ ...f, type: val as "main" | "sk" }))}
                        disabled={adding}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TYPES.map(type => (
                                <SelectItem key={type} value={type}>
                                    {type === "main" ? "Main" : "SK"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                        value={addForm.description}
                        onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Optional description"
                        className="w-64"
                        disabled={adding}
                    />
                </div>
                <Button type="submit" disabled={adding || !addForm.name} className="h-10">
                    {adding ? "Adding..." : "Add Officer"}
                </Button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {TYPES.map((type) => (
                    <div key={type} className="bg-slate-50 rounded-lg p-6 shadow-sm border">
                        <h3 className="font-semibold text-lg mb-4">
                            {type === "main" ? "Main Officials" : "SK Officials"}
                        </h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-600">
                                    <th className="py-2">Name</th>
                                    <th className="py-2">Position</th>
                                    <th className="py-2">Description</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(type === "main" ? mainOfficers : skOfficers).length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center text-slate-400 py-4">
                                            No officers found.
                                        </td>
                                    </tr>
                                )}
                                {(type === "main" ? mainOfficers : skOfficers).map((officer: any) => (
                                    <tr key={officer.id} className="border-b last:border-0">
                                        <td className="py-2">
                                            {editState.id === officer.id && editState.type === type ? (
                                                <Input
                                                    value={form.name}
                                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                                    className="w-full"
                                                    disabled={submitting}
                                                />
                                            ) : (
                                                officer.name
                                            )}
                                        </td>
                                        <td className="py-2">
                                            {editState.id === officer.id && editState.type === type ? (
                                                <Select
                                                    value={form.position}
                                                    onValueChange={val => setForm(f => ({ ...f, position: val as PositionType }))}
                                                    disabled={submitting}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {POSITIONS.map(pos => (
                                                            <SelectItem key={pos} value={pos}>
                                                                {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <span className="capitalize">{officer.position}</span>
                                            )}
                                        </td>
                                        <td className="py-2">
                                            {editState.id === officer.id && editState.type === type ? (
                                                <Input
                                                    value={form.description}
                                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                                    placeholder="Optional description"
                                                    className="w-full"
                                                    disabled={submitting}
                                                />
                                            ) : (
                                                <span className="text-slate-600">{officer.description || "-"}</span>
                                            )}
                                        </td>
                                        <td className="py-2 flex gap-2">
                                            {editState.id === officer.id && editState.type === type ? (
                                                <div className="flex gap-2">
                                                    <Button size="sm" type="button" variant="outline" onClick={() => setEditState({ id: null, type: null })} disabled={submitting}>
                                                        Cancel
                                                    </Button>
                                                    <Button size="sm" type="submit" onClick={handleUpdate} disabled={submitting}>
                                                        {submitting ? "Saving..." : "Save"}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => startEdit(officer, type)}>
                                                    Edit
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" onClick={() => handleDelete(officer.id, type)}>
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}
