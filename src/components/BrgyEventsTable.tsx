import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { actions } from 'astro:actions';
import { toast } from 'sonner';

function getStatus(startDate: string, endDate: string) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Make end date inclusive
    if (now < start) return { label: 'Upcoming', color: 'blue' };
    if (now >= start && now < end) return { label: 'Ongoing', color: 'green' };
    return { label: 'Ended', color: 'red' };
}

const fetcher = async (url: string) => {
    const res = await fetch(url)
    return res.json()
}

export const BrgyEventsTable: React.FC = () => {
    const { data, error: err, mutate, isLoading } = useSWR('/api/brgy-events', fetcher)
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleAddEvent = async (event: any) => {
        console.log(event)
        event.preventDefault()
        setLoading(true);
        const formData = new FormData(event.target);
        const title = formData.get('title');
        const description = formData.get('description');
        const startDate = formData.get('startDate');
        const endDate = formData.get('endDate');
        try {
            await actions.admin.addBrgyEvent(formData)
            toast.success('Event added successfully')
            mutate()
        } catch (err) {
            toast.error('Failed to add event')
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (eventId: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        setLoading(true);
        try {
            await actions.admin.deleteBrgyEvent({ eventId })
            mutate()
            toast.success('Event deleted successfully')
        } catch (err) {
            toast.error('Failed to delete event')
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) return <div>Loading events...</div>;
    if (err) return <div className="text-red-500">{err}</div>;

    return (
        <div>
            <div
                className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 transition-all hover:shadow-md"
            >
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                    Barangay Events
                </h2>
                <form
                    onSubmit={handleAddEvent}
                    method="post"
                    className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Title</label>
                        <input
                            name="title"
                            type="text"
                            required
                            className="mt-1 block w-full border rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700"
                        >Description</label
                        >
                        <input
                            name="description"
                            type="text"
                            required
                            className="mt-1 block w-full border rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700"
                        >Start Date</label
                        >
                        <input
                            name="startDate"
                            type="datetime-local"
                            required
                            className="mt-1 block w-full border rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700"
                        >End Date</label
                        >
                        <input
                            name="endDate"
                            type="datetime-local"
                            required
                            className="mt-1 block w-full border rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                        >Add Event</button
                        >
                    </div>
                </form>
            </div>
            <h2 className="text-xl font-semibold mb-4">Barangay Events</h2>
            <table className="min-w-full bg-white border rounded">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Title</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2">Start Date</th>
                        <th className="px-4 py-2">End Date</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((event: any) => {
                        const status = getStatus(event.startDate, event.endDate);
                        return (
                            <tr key={event.id} className="border-t">
                                <td className="px-4 py-2">{event.title}</td>
                                <td className="px-4 py-2">{event.description}</td>
                                <td className="px-4 py-2">{new Date(event.startDate).toLocaleString()}</td>
                                <td className="px-4 py-2">{new Date(event.endDate).toLocaleString()}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded text-white bg-${status.color}-500`}>
                                        {status.label}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        className="text-red-600 hover:underline"
                                        onClick={() => handleDelete(event.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BrgyEventsTable; 