import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const POSITIONS = [
    "chairman",
    "secretary",
    "treasurer",
    "councilor"
] as const;

type Officer = { id?: number; name?: string; position: string };

function groupOfficials(officials: Officer[]): { chairman?: Officer; secretary?: Officer; treasurer?: Officer; councilors: Officer[] } {
    // Returns { chairman, secretary, treasurer, councilors: [] }
    const chairman = officials.find((o: Officer) => o.position === "chairman");
    const secretary = officials.find((o: Officer) => o.position === "secretary");
    const treasurer = officials.find((o: Officer) => o.position === "treasurer");
    const councilors = officials.filter((o: Officer) => o.position === "councilor");
    return { chairman, secretary, treasurer, councilors };
}

function OfficialCard({ name, position }: { name?: string; position: string }) {
    return (
        <div className="bg-white rounded shadow-sm border w-full max-w-xs mx-auto mb-4 flex flex-col items-center font-sans">
            <div className="font-bold text-lg md:text-xl pt-3 pb-1">Name</div>
            <div className="font-semibold text-base md:text-lg pb-2">{name || <span className="italic text-slate-400">-</span>}</div>
            <div className="text-gray-700 pb-3 text-sm md:text-base">{position}</div>
            <div className="w-full h-2 bg-green-700 rounded-b" />
        </div>
    );
}

export default function OfficersDisplay() {
    const { data, error, isLoading } = useSWR("/api/feed/officers", fetcher);

    if (isLoading) return <div>Loading officers...</div>;
    if (error) return <div className="text-red-600">Failed to load officers.</div>;

    const main = groupOfficials((data?.officials || []) as Officer[]);
    const sk = groupOfficials((data?.skOfficers || []) as Officer[]);

    // Helper to render councilors in rows of 4 (responsive)
    function renderCouncilors(councilors: Officer[]) {
        const rows = [];
        for (let i = 0; i < councilors.length; i += 4) {
            rows.push(
                <div key={i} className="flex flex-wrap sm:flex-nowrap justify-center gap-4 sm:gap-8 mb-4">
                    {councilors.slice(i, i + 4).map((c: Officer, idx: number) => (
                        <OfficialCard key={c.id || idx} name={c.name} position={c.position === "councilor" ? (c.position.charAt(0).toUpperCase() + c.position.slice(1)) : c.position} />
                    ))}
                </div>
            );
        }
        return rows;
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-100 to-gray-700 p-4 sm:p-6 md:p-8">
            {/* Main Officials */}
            <div className="rounded-lg p-4 sm:p-6 mb-8 ">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">List of Brgy. Officials</h2>
                <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mb-4 md:mb-6">
                    <div className="flex-1 flex justify-center mb-4 md:mb-0">
                        <OfficialCard name={main.secretary?.name} position="Brgy. Secretary" />
                    </div>
                    <div className="flex-1 flex justify-center mb-4 md:mb-0">
                        <OfficialCard name={main.chairman?.name} position="Brgy. Chairman" />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <OfficialCard name={main.treasurer?.name} position="Brgy. Treasurer" />
                    </div>
                </div>
                {renderCouncilors(main.councilors.map((c: Officer) => ({ ...c, position: "Brgy. Councilor" })))}
            </div>
            {/* SK Officials */}
            <div className="rounded-lg p-4 sm:p-6 ">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">List of SK Officials</h2>
                <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mb-4 md:mb-6">
                    <div className="flex-1 flex justify-center mb-4 md:mb-0">
                        <OfficialCard name={sk.secretary?.name} position="SK Secretary" />
                    </div>
                    <div className="flex-1 flex justify-center mb-4 md:mb-0">
                        <OfficialCard name={sk.chairman?.name} position="SK Chairman" />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <OfficialCard name={sk.treasurer?.name} position="SK Treasurer" />
                    </div>
                </div>
                {renderCouncilors(sk.councilors.map((c: Officer) => ({ ...c, position: "SK Councilor" })))}
            </div>
        </div>
    );
} 