import useSWR from "swr";
import { Tree, TreeNode } from "react-organizational-chart";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const POSITIONS = [
    "chairman",
    "secretary",
    "treasurer",
    "councilor"
] as const;

type Officer = { id?: number; name?: string; position: string; description?: string };

function groupOfficials(officials: Officer[]): { chairman?: Officer; secretary?: Officer; treasurer?: Officer; councilors: Officer[] } {
    // Returns { chairman, secretary, treasurer, councilors: [] }
    const chairman = officials.find((o: Officer) => o.position === "chairman");
    const secretary = officials.find((o: Officer) => o.position === "secretary");
    const treasurer = officials.find((o: Officer) => o.position === "treasurer");
    const councilors = officials.filter((o: Officer) => o.position === "councilor");
    return { chairman, secretary, treasurer, councilors };
}

function OfficialCard({ name, position, description }: { name?: string; position: string; description?: string }) {
    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 w-full max-w-xs mx-auto flex flex-col items-center font-sans p-4 shadow-sm">
            {/* Placeholder for photo */}
            {/* <div className="w-16 h-16 bg-gray-300 rounded-full mb-3 flex items-center justify-center">
                <span className="text-gray-600 text-xs">Photo</span>
            </div> */}
            <div className="font-bold text-base md:text-lg text-green-700 mb-1 text-center">{name || <span className="italic text-slate-400">-</span>}</div>
            <div className="font-semibold text-sm md:text-base text-green-700 mb-1 text-center">{position}</div>
            {description && (
                <div className="text-xs md:text-sm text-gray-600 text-center mb-2">{description}</div>
            )}
            <div className="w-full h-1 bg-green-700 rounded" />
        </div>
    );
}

// Helper function to assign committees based on councilor index
function getCouncilorCommittees(index: number): string {
    const committees = [
        "Education & Senior Citizen",
        "Budget and Appropriation; Family, Women and Children",
        "Agriculture & Social Services",
        "Health & Environment",
        "Peace & Order",
        "Public Works",
        "Transportation & Communications",
        "Cooperative; SK - Chairman; Youth & Sports Development"
    ];
    return committees[index] || "";
}

// Helper function to get position display name
function getPositionDisplayName(position: string, isSK: boolean = false): string {
    const prefix = isSK ? "SK " : "Barangay ";

    switch (position) {
        case "chairman":
            return `${prefix}Chairman`;
        case "secretary":
            return `${prefix}Secretary`;
        case "treasurer":
            return `${prefix}Treasurer`;
        case "councilor":
            return `${prefix}Councilor`;
        default:
            return position.charAt(0).toUpperCase() + position.slice(1);
    }
}

export default function OfficersDisplay() {
    const { data, error, isLoading } = useSWR("/api/feed/officers", fetcher);

    if (isLoading) return <div>Loading officers...</div>;
    if (error) return <div className="text-red-600">Failed to load officers.</div>;

    const mainOfficials = (data?.officials || []) as Officer[];
    const skOfficials = (data?.skOfficers || []) as Officer[];

    // Separate officials by position for main officials
    const mainChairman = mainOfficials.find(o => o.position === "chairman");
    const mainCouncilors = mainOfficials.filter(o => o.position === "councilor");
    const mainOtherOfficials = mainOfficials.filter(o => o.position !== "chairman" && o.position !== "councilor");

    // Separate officials by position for SK officials
    const skChairman = skOfficials.find(o => o.position === "chairman");
    const skCouncilors = skOfficials.filter(o => o.position === "councilor");
    const skOtherOfficials = skOfficials.filter(o => o.position !== "chairman" && o.position !== "councilor");

    return (
        <div className="min-h-screen w-full bg-white p-4 sm:p-6 md:p-8">
            {/* Header with Logo */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    {/* <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white text-xs font-bold text-center">BARANGAY<br />STO. NIÑO<br />SAGISAG</span>
                    </div> */}
                    <h1 className="text-3xl md:text-4xl font-bold text-green-700">Barangay Sto. Niño Officials</h1>
                </div>
            </div>

            {/* Main Officials Organizational Chart */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-8 text-green-700">Main Officials</h2>
                <div className="flex justify-center">
                    <Tree
                        lineWidth="2px"
                        lineColor="#15803d"
                        lineBorderRadius="5px"
                        nodePadding="20px"
                        label={<OfficialCard name={mainChairman?.name} position={getPositionDisplayName(mainChairman?.position || "")} />}
                    >
                        {/* Second Row - All Councilors */}
                        {mainCouncilors.map((councilor, idx) => (
                            <TreeNode
                                key={councilor.id}
                                label={<OfficialCard
                                    name={councilor.name}
                                    position={getPositionDisplayName(councilor.position)}
                                    description={councilor.description}
                                />}
                            />
                        ))}
                    </Tree>
                </div>

                {/* Third Row - All Other Officials (not chairman or councilor) - Separated from tree */}
                {mainOtherOfficials.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex gap-4 justify-center">
                            {mainOtherOfficials.map((official) => (
                                <OfficialCard
                                    key={official.id}
                                    name={official.name}
                                    position={getPositionDisplayName(official.position)}
                                    description={official.description}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SK Officials Organizational Chart */}
            <div className="mt-20">
                <h2 className="text-2xl font-bold text-center mb-8 text-green-700">SK Officials</h2>
                <div className="flex justify-center">
                    <Tree
                        lineWidth="2px"
                        lineColor="#15803d"
                        lineBorderRadius="5px"
                        nodePadding="20px"
                        label={<OfficialCard name={skChairman?.name} position={getPositionDisplayName(skChairman?.position || "", true)} />}
                    >
                        {/* Second Row - All SK Councilors */}
                        {skCouncilors.map((councilor, idx) => (
                            <TreeNode
                                key={councilor.id}
                                label={<OfficialCard
                                    name={councilor.name}
                                    position={getPositionDisplayName(councilor.position, true)}
                                    description={councilor.description}
                                />}
                            />
                        ))}
                    </Tree>
                </div>

                {/* Third Row - All SK Other Officials (not chairman or councilor) - Separated from tree */}
                {skOtherOfficials.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex gap-4 justify-center">
                            {skOtherOfficials.map((official) => (
                                <OfficialCard
                                    key={official.id}
                                    name={official.name}
                                    position={getPositionDisplayName(official.position, true)}
                                    description={official.description}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 