"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

interface EvaluationClientProps {
    team: string;
    teamName: string;
    parameters: {
        common: string[];
        specific: string[];
        interview: string[];
    };
}

export default function EvaluationClient({ team, teamName, parameters }: EvaluationClientProps) {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Form states
    const [scores, setScores] = useState<Record<string, number>>({});
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await fetch('/api/responses');
                const result = await response.json();

                if (result.success) {
                    // Filter candidates by the selected track
                    let targetTrack = "";
                    if (team.includes("tech")) targetTrack = "Technical Team";
                    else if (team.includes("social")) targetTrack = "Social Media Team";
                    else if (team.includes("content")) targetTrack = "Content Creation Team";
                    else if (team.includes("outreach")) targetTrack = "Outreach Team";

                    let filtered = result.data;
                    if (targetTrack) {
                        filtered = result.data.filter((c: any) => c.selected_track === targetTrack);
                    }

                    // Sort by timestamp (newest first by default)
                    filtered.sort((a: any, b: any) => {
                        const dateA = new Date(a.timestamp).getTime();
                        const dateB = new Date(b.timestamp).getTime();
                        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                    });

                    setCandidates(filtered);
                    if (filtered.length > 0) {
                        setSelectedCandidate(filtered[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to load candidates", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [team, sortOrder]);

    const handleScoreSelect = (param: string, score: number) => {
        setScores(prev => ({
            ...prev,
            [param]: score
        }));
    };

    const toggleSort = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f0ebf8] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-[#673ab7]/30 border-t-[#673ab7] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0ebf8] font-sans text-[#202124]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/evaluation" className="text-gray-500 hover:text-[#673ab7] transition-colors mr-4">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#673ab7] to-[#3f51b5]">
                                    {teamName} Team Evaluation
                                </h1>
                                <p className="text-xs text-gray-500 opacity-80">Unified Scoring Domain</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                                Evaluator Mode
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

                    {/* Sidebar: Candidate List */}
                    <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg">Candidates</h2>
                                <p className="text-xs text-gray-500">Waitlist ({candidates.length})</p>
                            </div>
                            <button onClick={toggleSort} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                            {candidates.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No candidates found for this track.</p>
                            ) : (
                                candidates.map((candidate, i) => (
                                    <button
                                        key={candidate.timestamp || i}
                                        onClick={() => setSelectedCandidate(candidate)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedCandidate?.timestamp === candidate.timestamp ? 'bg-purple-50 border-purple-200' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="font-bold text-sm text-[#202124] truncate">{candidate.full_name}</div>
                                                {candidate.core_response_score && (
                                                    <span className="shrink-0 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded border border-emerald-200">
                                                        {candidate.core_response_score}/10
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${selectedCandidate?.timestamp === candidate.timestamp ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                        </div>
                                        <div className="text-[11px] text-gray-500 uppercase tracking-wider font-mono truncate">{candidate.roll_number} • {candidate.branch}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Interaction Area: Evaluation Form */}
                    <div className="lg:col-span-5 flex flex-col h-[calc(100vh-8rem)]">
                        {selectedCandidate ? (
                            <div className="bg-white rounded-xl shadow-sm border border-black/5 flex-1 overflow-hidden flex flex-col relative">

                                {/* Header of evaluation area */}
                                <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-white to-purple-50/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-black text-[#202124]">{selectedCandidate.full_name}</h2>
                                                {selectedCandidate.core_response_score && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                        <span className="text-xs font-black uppercase tracking-wider">Core Score: {selectedCandidate.core_response_score}/10</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-semibold tracking-wide uppercase border border-gray-200/50">{selectedCandidate.roll_number}</span>
                                                <span className="text-xs px-2 py-1 bg-purple-100 text-[#673ab7] rounded font-semibold tracking-wide border border-purple-200/50">{selectedCandidate.branch}</span>
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold tracking-wide border border-blue-200/50">{selectedCandidate.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Evaluation Form Body */}
                                <div className="p-6 overflow-y-auto flex-1 space-y-8">

                                    {/* 1. Response Score */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">1</div>
                                            <h3 className="text-lg font-bold text-[#202124]">Response Score</h3>
                                            <span className="text-xs text-emerald-500 font-medium ml-2">— Overall Application Rating</span>
                                        </div>
                                        <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50">
                                            <div className="flex justify-between items-center gap-1 sm:gap-2">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                                                    <button
                                                        key={score}
                                                        onClick={() => handleScoreSelect("Response Score", score)}
                                                        className={`flex-1 h-10 rounded-lg font-bold text-sm sm:text-base transition-all shadow-sm ${scores["Response Score"] === score
                                                            ? 'bg-[#673ab7] text-white border-[#673ab7]'
                                                            : 'bg-white border border-emerald-200 text-gray-600 hover:border-[#673ab7] hover:text-[#673ab7]'
                                                            }`}
                                                    >
                                                        {score}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    {/* 2. Common Domain */}
                                    {team !== 'core' && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">2</div>
                                                <h3 className="text-lg font-bold text-[#202124]">Common Domain</h3>
                                                <span className="text-xs text-gray-400 font-medium ml-2">— All candidates</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {parameters.common.map(param => (
                                                    <div key={param} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{param}</label>
                                                        <div className="flex justify-between items-center gap-2">
                                                            {[1, 2, 3, 4, 5].map(score => (
                                                                <button
                                                                    key={score}
                                                                    onClick={() => handleScoreSelect(param, score)}
                                                                    className={`w-9 h-9 rounded-full font-bold text-sm transition-all shadow-sm ${scores[param] === score
                                                                        ? 'bg-[#673ab7] text-white border-[#673ab7]'
                                                                        : 'bg-white border border-gray-300 text-gray-600 hover:border-[#673ab7] hover:text-[#673ab7]'
                                                                        }`}
                                                                >
                                                                    {score}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* 3. Team-Specific Domain */}
                                    {team !== 'core' && parameters.specific.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-[#673ab7] font-bold text-xs">3</div>
                                                <h3 className="text-lg font-bold text-[#202124]">Specialization Domain</h3>
                                                <span className="text-xs text-purple-400 font-medium ml-2">— {teamName}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {parameters.specific.map(param => (
                                                    <div key={param} className="bg-purple-50/30 p-4 rounded-xl border border-purple-100/50">
                                                        <label className="block text-sm font-semibold text-gray-800 mb-2">{param}</label>
                                                        <div className="flex justify-between items-center gap-2">
                                                            {[1, 2, 3, 4, 5].map(score => (
                                                                <button
                                                                    key={score}
                                                                    onClick={() => handleScoreSelect(param, score)}
                                                                    className={`w-9 h-9 rounded-full font-bold text-sm transition-all shadow-sm ${scores[param] === score
                                                                        ? 'bg-[#673ab7] text-white border-[#673ab7]'
                                                                        : 'bg-white border border-purple-200 text-gray-600 hover:border-[#673ab7] hover:text-[#673ab7]'
                                                                        }`}
                                                                >
                                                                    {score}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                    {/* 4. Interview Criteria */}
                                    {team !== 'core' && parameters.interview.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">4</div>
                                                <h3 className="text-lg font-bold text-[#202124]">Interview Evaluation</h3>
                                                <span className="text-xs text-blue-400 font-medium ml-2">— Live Interaction</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {parameters.interview.map(param => (
                                                    <div key={param} className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                                                        <label className="block text-sm font-semibold text-gray-800 mb-2">{param}</label>
                                                        <div className="flex justify-between items-center gap-2">
                                                            {[1, 2, 3, 4, 5].map(score => (
                                                                <button
                                                                    key={score}
                                                                    onClick={() => handleScoreSelect(param, score)}
                                                                    className={`w-9 h-9 rounded-full font-bold text-sm transition-all shadow-sm ${scores[param] === score
                                                                        ? 'bg-[#673ab7] text-white border-[#673ab7]'
                                                                        : 'bg-white border border-blue-200 text-gray-600 hover:border-[#673ab7] hover:text-[#673ab7]'
                                                                        }`}
                                                                >
                                                                    {score}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* 5. Remarks */}
                                    {team !== 'core' && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">5</div>
                                                <h3 className="text-lg font-bold text-[#202124]">Remarks & Signals</h3>
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#673ab7]/50 transition-all">
                                                <textarea
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    className="w-full p-4 min-h-[120px] outline-none text-sm resize-y"
                                                    placeholder="Enter free-text remarks, red flags, strong positives, or contextual notes..."
                                                ></textarea>
                                            </div>
                                        </section>
                                    )}

                                </div>

                                {/* Footer Action */}
                                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10 w-full">
                                    <button
                                        onClick={() => {
                                            setScores({});
                                            setRemarks("");
                                        }}
                                        className="px-5 py-2.5 rounded-lg font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm"
                                    >
                                        Reset Draft
                                    </button>
                                    <button
                                        disabled={isSubmitting}
                                        onClick={async () => {
                                            if (!selectedCandidate) {
                                                alert("Please select a candidate first.");
                                                return;
                                            }

                                            const isConfirmed = window.confirm(`Submit evaluation for ${selectedCandidate.full_name}?`);
                                            if (!isConfirmed) return;

                                            setIsSubmitting(true);
                                            try {
                                                const res = await fetch('/api/evaluation/submit', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        candidate: selectedCandidate,
                                                        team: team,
                                                        scores: scores,
                                                        remarks: remarks
                                                    })
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    alert("Successfully submitted the evaluation!");

                                                    // If core team submitted, update the local candidate list to show the score immediately
                                                    if (team.toLowerCase().includes('core') && scores["Response Score"]) {
                                                        setCandidates(prev => prev.map(c =>
                                                            c.roll_number === selectedCandidate.roll_number
                                                                ? { ...c, core_response_score: scores["Response Score"] }
                                                                : c
                                                        ));
                                                    }

                                                    setScores({});
                                                    setRemarks("");
                                                } else {
                                                    alert("Failed to submit: " + data.error);
                                                }
                                            } catch (error) {
                                                alert("An error occurred connecting to the submission server.");
                                            } finally {
                                                setIsSubmitting(false);
                                            }
                                        }}
                                        className={`px-5 py-2.5 rounded-lg font-bold text-white shadow-[0_4px_14px_0_rgba(103,58,183,0.39)] transition-all transform hover:-translate-y-0.5 text-sm ${isSubmitting ? 'bg-gray-400 cursor-not-allowed transform-none' : 'bg-[#673ab7] hover:bg-[#5e35b1]'}`}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-black/5 flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                </svg>
                                <p className="text-lg font-medium text-gray-500">Select a candidate to begin evaluation</p>
                                <p className="text-sm mt-2 max-w-sm">Evaluations are synchronized and unified under a single candidate schema.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar: Application Data */}
                    <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-bold text-lg">Application Details</h2>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4 space-y-4">
                            {selectedCandidate ? (
                                Object.entries(selectedCandidate)
                                    .map(([key, value]) => {
                                        if (!value) return null;
                                        const displayValue = key === 'timestamp' ? new Date(String(value)).toLocaleString() : String(value);

                                        const renderWithLinks = (text: string) => {
                                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                                            const parts = text.split(urlRegex);
                                            return parts.map((part, i) => {
                                                if (part.match(urlRegex)) {
                                                    return (
                                                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                                                            {part}
                                                        </a>
                                                    );
                                                }
                                                return part;
                                            });
                                        };

                                        return (
                                            <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <span className="font-bold text-gray-700 capitalize break-words block text-[11px] tracking-wider mb-1 uppercase text-[#673ab7]">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-gray-800 break-words text-sm font-medium whitespace-pre-wrap">{renderWithLinks(displayValue)}</span>
                                            </div>
                                        )
                                    })
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic text-center">
                                    Select a candidate to view their application details.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
