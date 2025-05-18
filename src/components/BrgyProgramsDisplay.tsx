import useSWR from 'swr';
import type { BrgyProgramType } from '@/db/schema';
import { UFSImageUrl } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BrgyProgramsDisplay() {
    const { data: programs, isLoading } = useSWR<BrgyProgramType[]>('/api/brgy-programs', fetcher);

    return (
        <section className="bg-gradient-to-b from-gray-100 to-gray-700 py-12 min-h-screen px-4 md:px-0">
            <h2 className="text-3xl font-bold text-center mb-10">Community Programs</h2>
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {isLoading && <div className="col-span-3 text-center">Loading...</div>}
                {programs && programs.length === 0 && <div className="col-span-3 text-center">No programs found.</div>}
                {programs && programs.map(program => (
                    <div key={program.id} className="bg-white rounded shadow-lg flex flex-col overflow-hidden border border-gray-300">
                        {program.imageId && (
                            <img
                                src={UFSImageUrl(program.imageId)}
                                alt={program.name}
                                className="w-full h-56 object-cover"
                                style={{ objectPosition: 'center' }}
                            />
                        )}
                        <div className="flex-1 flex flex-col p-6 pb-4">
                            <h3 className="text-xl font-extrabold text-center mb-2 uppercase">{program.name}</h3>
                            <p className="text-center text-gray-800 text-base">{program.description}</p>
                        </div>
                        <div className="h-3 bg-green-600 w-full mt-auto" />
                    </div>
                ))}
            </div>
        </section>
    );
} 