import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EvaluationLandingPage() {
    const teams = [
        { id: "core", name: "Core (Event Planning)", desc: "Common evaluation domain for all candidates", color: "border-gray-400 text-gray-700 bg-gray-50 hover:bg-gray-100" },
        { id: "technical", name: "Technical Team", desc: "Evaluate technical aptitude and skills", color: "border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100" },
        { id: "social", name: "Social Media Team", desc: "Evaluate online presence and platform expertise", color: "border-pink-400 text-pink-700 bg-pink-50 hover:bg-pink-100" },
        { id: "content", name: "Content Creation Team", desc: "Evaluate creativity and tools familiarity", color: "border-purple-400 text-purple-700 bg-purple-50 hover:bg-purple-100" },
        { id: "outreach", name: "Outreach Team", desc: "Evaluate communication and sponsorship strategy", color: "border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" },
    ];

    return (
        <div className="min-h-screen bg-[#f0ebf8] flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-[#673ab7] p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">DevCatalyst Evaluation Portal</h1>
                    <p className="opacity-90">Select your evaluation domain to proceed.</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team) => (
                            <Link
                                href={`/evaluation/${team.id}`}
                                key={team.id}
                                className={`flex flex-col p-6 rounded-xl border-2 transition-all cursor-pointer ${team.color}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-bold">{team.name}</h2>
                                    <ArrowRight className="w-6 h-6 opacity-70" />
                                </div>
                                <p className="text-sm opacity-80">{team.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
