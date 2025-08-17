import useSWR from 'swr';
import { cn, fetcher } from '@/lib/utils';

function getStatus(startDate: string, endDate: string) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Make end date inclusive
    if (now < start) return { label: 'Upcoming', color: 'bg-green-500' };
    if (now >= start && now < end) return { label: 'Ongoing', color: 'bg-green-500' };
    return { label: 'Ended', color: 'bg-green-500' };
}

export default function BrgyEventsDisplay() {
    const { data: events, isLoading } = useSWR('/api/brgy-events', fetcher);

    return (
        <section className="min-h-screen w-full bg-white py-12 px-4 md:px-0">
            <h2 className="text-3xl font-bold text-center mb-10">Barangay Events</h2>
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {isLoading && <div className="col-span-3 text-center">Loading...</div>}
                {events && events.length === 0 && <div className="col-span-3 text-center">No events found.</div>}
                {events && events.map((event: any) => {
                    const status = getStatus(event.startDate, event.endDate);
                    return (
                        <div key={event.id} className="bg-white rounded shadow-lg flex flex-col overflow-hidden border border-gray-300">
                            <div className="flex-1 flex flex-col p-6 pb-4">
                                <h3 className="text-xl font-extrabold text-center mb-2 uppercase">{event.title}</h3>
                                <p className="text-center text-gray-800 text-base mb-2">{event.description}</p>
                                <div className="text-center text-sm text-gray-600 mb-1">
                                    <span className="font-semibold">Start:</span> {new Date(event.startDate).toLocaleString()}
                                </div>
                                <div className="text-center text-sm text-gray-600 mb-2">
                                    <span className="font-semibold">End:</span> {new Date(event.endDate).toLocaleString()}
                                </div>
                                <div className="flex justify-center mt-2">
                                    <span className={cn("px-3 py-1 rounded-full text-white font-semibold text-xs", status.color)}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>
                            <div className={cn("h-3 w-full mt-auto", status.color)} />
                        </div>
                    );
                })}
            </div>
        </section>
    );
} 