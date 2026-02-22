"use client";

import { useEffect, useState } from 'react';
import {
    Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import PasswordGate from '../components/PasswordGate';

export default function DashboardPage() {
    return (
        <PasswordGate>
            <Dashboard />
        </PasswordGate>
    );
}

function Dashboard() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Overview");
    const [candidateStatuses, setCandidateStatuses] = useState<Record<string, 'pending' | 'viewed' | 'accepted' | 'rejected'>>({});
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    // Load candidate statuses from local storage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('candidate_statuses');
            if (saved) {
                setCandidateStatuses(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load statuses from local storage", e);
        }
    }, []);

    const updateCandidateStatus = (id: string | number, status: 'pending' | 'viewed' | 'accepted' | 'rejected') => {
        setCandidateStatuses(prev => {
            const newStatuses = { ...prev, [id]: status };
            localStorage.setItem('candidate_statuses', JSON.stringify(newStatuses));
            return newStatuses;
        });
    };

    const handleRowClick = (sub: any) => {
        setSelectedCandidate(sub);
        if (!candidateStatuses[sub.timestamp] || candidateStatuses[sub.timestamp] === 'pending') {
            updateCandidateStatus(sub.timestamp, 'viewed');
        }
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig?.key !== columnKey) return <span className="ml-1 text-gray-300">↕</span>;
        if (sortConfig.direction === 'asc') return <span className="ml-1 text-gray-800">↑</span>;
        return <span className="ml-1 text-gray-800">↓</span>;
    };

    // Load data from Google Sheets API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/responses');
                const result = await response.json();
                if (result.success) {
                    setSubmissions(result.data.reverse()); // Newest first
                } else {
                    console.error("Failed to fetch dashboard data");
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Tabs Configuration
    const TABS = ["Overview", "All Responses", "Technical Team", "Social Media Team", "Content Creation Team", "Outreach Team", "Shortlisted Candidates"];

    const COLORS = ['#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ff9800', '#ff5722'];

    // --- Helper Functions for Data Processing ---

    const getFrequencyData = (data: any[], key: string, splitByComma = false) => {
        const counts: Record<string, number> = {};
        data.forEach(item => {
            let value = item[key];
            if (!value) return;

            if (splitByComma && typeof value === 'string') {
                // Split "React, Node.js" -> ["React", "Node.js"]
                const parts = value.split(',').map((v: string) => v.trim());
                parts.forEach((part: string) => {
                    if (part) counts[part] = (counts[part] || 0) + 1;
                });
            } else {
                counts[value] = (counts[value] || 0) + 1;
            }
        });

        return Object.keys(counts)
            .map(name => ({ name, value: counts[name] }))
            .sort((a, b) => b.value - a.value); // Sort by scales
    };

    // --- Charts Data Preparation ---

    // 1. Overview: Branch Distribution (Pie) & Track Distribution (Pie)
    const branchData = getFrequencyData(submissions, 'branch');
    const trackData = getFrequencyData(submissions, 'selected_track');

    // 2. Tech: Top Skills (Bar)
    const techSubmissions = submissions.filter(s => s.selected_track === 'Technical Team');
    const techSkillsData = getFrequencyData(techSubmissions, 'tech_skills', true).slice(0, 8); // Top 8 skills

    // 3. Social: Platform Expertise (Pie)
    const socialSubmissions = submissions.filter(s => s.selected_track === 'Social Media Team');
    const socialPlatformData = getFrequencyData(socialSubmissions, 'social_platforms', true);

    // 4. Content: Content Types (Pie)
    const contentSubmissions = submissions.filter(s => s.selected_track === 'Content Creation Team');
    const contentTypeData = getFrequencyData(contentSubmissions, 'content_type', true);

    // 5. Outreach: Comfort Level (Bar)
    const outreachSubmissions = submissions.filter(s => s.selected_track === 'Outreach Team');
    const comfortData = getFrequencyData(outreachSubmissions, 'outreach_comfort').sort((a, b) => parseInt(a.name) - parseInt(b.name));


    // Filter Logic for Table
    const getFilteredSubmissions = () => {
        let result = [...submissions];

        if (activeTab === "Shortlisted Candidates") {
            result = result.filter(sub => candidateStatuses[sub.timestamp] === 'accepted');
        } else if (activeTab !== "Overview" && activeTab !== "All Responses") {
            result = result.filter(sub => sub.selected_track === activeTab);
        }

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(sub =>
                Object.values(sub).some(val =>
                    String(val).toLowerCase().includes(query)
                )
            );
        }

        if (sortConfig !== null) {
            result.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'status') {
                    aVal = candidateStatuses[a.timestamp] || 'pending';
                    bVal = candidateStatuses[b.timestamp] || 'pending';
                }

                if (aVal == null) aVal = '';
                if (bVal == null) bVal = '';

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    };

    const filteredData = getFilteredSubmissions();
    const totalResponses = submissions.length;

    const downloadCSV = () => {
        const shortlisted = submissions.filter(sub => candidateStatuses[sub.timestamp] === 'accepted');
        if (shortlisted.length === 0) return alert("No shortlisted candidates to download.");

        const headers = ["Name", "Email", "Phone", "Roll Number", "Department", "Section", "Track"];

        const csvRows = [
            headers.join(','),
            ...shortlisted.map(sub => {
                return [
                    `"${(sub.full_name || '').replace(/"/g, '""')}"`,
                    `"${(sub.email || '').replace(/"/g, '""')}"`,
                    `"${(sub.phone || '').replace(/"/g, '""')}"`,
                    `"${(sub.roll_number || '').replace(/"/g, '""')}"`,
                    `"${(sub.branch || '').replace(/"/g, '""')}"`,
                    `"${(sub.section || '').replace(/"/g, '""')}"`,
                    `"${(sub.selected_track || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Shortlisted_Candidates_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f0ebf8]">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#f0ebf8] p-4 sm:p-8 font-sans text-[#202124]">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-normal">Recruitment Dashboard</h1>
                    <p className="text-sm text-gray-600">DevCatalyst • Response Summary</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 shadow-sm"
                    >
                        Refresh Data
                    </button>
                    <button
                        onClick={() => {
                            sessionStorage.removeItem("dashboard_auth");
                            window.location.reload();
                        }}
                        className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm hover:bg-red-100 shadow-sm transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setSearchQuery("");
                                setSortConfig(null);
                            }}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                ? 'border-[#673ab7] text-[#673ab7]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content: Overview */}
            {activeTab === "Overview" && (
                <div className="max-w-6xl mx-auto mb-8">
                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-t-[#673ab7]">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Responses</h3>
                            <p className="text-4xl font-normal mt-2">{totalResponses}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-t-[#3f51b5]">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Latest Response</h3>
                            <p className="text-lg mt-2 truncate">
                                {submissions.length > 0 ? new Date(submissions[0].timestamp).toLocaleString() : "N/A"}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-t-[#2196f3]">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Status</h3>
                            <p className="text-lg mt-2 text-green-600">Active • Accepting</p>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Branch Distribution (Pie) */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-normal mb-6">Branch Distribution</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={branchData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: { name?: string, percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {branchData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Track Distribution (Pie) */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-normal mb-6">Track Preferences</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={trackData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }: { name?: string, percent?: number }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                                        >
                                            {trackData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Specific Charts */}
            {activeTab === "Technical Team" && techSkillsData.length > 0 && (
                <div className="max-w-6xl mx-auto mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-normal mb-6">Top 8 Technical Skills</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={techSkillsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#673ab7" radius={[0, 4, 4, 0]}>
                                    {techSkillsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === "Social Media Team" && socialPlatformData.length > 0 && (
                <div className="max-w-6xl mx-auto mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-normal mb-6">Platform Expertise</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={socialPlatformData}
                                    cx="50%"
                                    cy="50%"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {socialPlatformData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === "Content Creation Team" && contentTypeData.length > 0 && (
                <div className="max-w-6xl mx-auto mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-normal mb-6">Preferred Content Types</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={contentTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    label={({ name }) => name}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {contentTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === "Outreach Team" && comfortData.length > 0 && (
                <div className="max-w-6xl mx-auto mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-normal mb-6">Cold Outreach Comfort Level (1-5)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comfortData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#3f51b5" radius={[4, 4, 0, 0]}>
                                    {comfortData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}


            {/* Content: Tables */}
            {(activeTab !== "Overview") && (
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4 bg-gray-50/50">
                            <h3 className="text-lg font-normal">{activeTab} ({filteredData.length})</h3>
                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:min-w-[300px]">
                                {activeTab === "Shortlisted Candidates" && (
                                    <button
                                        onClick={downloadCSV}
                                        className="bg-[#673ab7] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5e35b1] transition-colors flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Download CSV
                                    </button>
                                )}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search candidate answers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#673ab7] focus:border-transparent text-sm"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-500 font-medium border-y border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('full_name')}>
                                            Name <SortIcon columnKey="full_name" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('roll_number')}>
                                            Roll Number <SortIcon columnKey="roll_number" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('branch')}>
                                            Department <SortIcon columnKey="branch" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('section')}>
                                            Section <SortIcon columnKey="section" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('email')}>
                                            Email <SortIcon columnKey="email" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('phone')}>
                                            Phone <SortIcon columnKey="phone" />
                                        </th>
                                        {activeTab === "Technical Team" && <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('tech_skills')}>Tech Skills <SortIcon columnKey="tech_skills" /></th>}
                                        {activeTab === "Technical Team" && <th className="px-6 py-4 whitespace-nowrap select-none">Links</th>}

                                        {activeTab === "Social Media Team" && <th className="px-6 py-4 whitespace-nowrap select-none">Handles</th>}
                                        {activeTab === "Social Media Team" && <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('social_analysis')}>Analysis <SortIcon columnKey="social_analysis" /></th>}

                                        {activeTab === "Content Creation Team" && <th className="px-6 py-4 whitespace-nowrap select-none">Portfolio & Socials</th>}

                                        {activeTab === "Outreach Team" && <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('sponsorship_strategy')}>Strategy <SortIcon columnKey="sponsorship_strategy" /></th>}

                                        {(activeTab === "All Responses" || activeTab === "Shortlisted Candidates") && <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('selected_track')}>Track <SortIcon columnKey="selected_track" /></th>}
                                        <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('timestamp')}>
                                            Timestamp <SortIcon columnKey="timestamp" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap" onClick={() => requestSort('status')}>
                                            Status <SortIcon columnKey="status" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No submissions found for this track.</td></tr>
                                    ) : (
                                        filteredData.map((sub, idx) => (
                                            <tr
                                                key={idx}
                                                onClick={() => handleRowClick(sub)}
                                                className={`cursor-pointer transition-colors ${candidateStatuses[sub.timestamp] === 'accepted' ? 'bg-green-50 hover:bg-green-100' :
                                                    candidateStatuses[sub.timestamp] === 'rejected' ? 'bg-red-50 hover:bg-red-100' :
                                                        'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-[#202124]">{sub.full_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-gray-900 font-mono uppercase text-xs">{sub.roll_number}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap max-w-[200px] truncate" title={sub.branch}>
                                                    <div className="text-gray-900 text-xs">{sub.branch}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-gray-900 font-semibold">{sub.section || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-gray-900">{sub.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-gray-900">{sub.phone}</div>
                                                </td>

                                                {/* Tech Specific */}
                                                {activeTab === "Technical Team" && (
                                                    <>
                                                        <td className="px-6 py-4 max-w-xs truncate" title={sub.tech_skills}>{sub.tech_skills}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col space-y-2 items-start">
                                                                {sub.github_link && <a href={sub.github_link} target="_blank" className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit">GitHub</a>}
                                                                {sub.portfolio_link_tech && <a href={sub.portfolio_link_tech} target="_blank" className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit">Portfolio</a>}
                                                                {sub.linkedin_link && <a href={sub.linkedin_link} target="_blank" className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit">LinkedIn</a>}
                                                            </div>
                                                        </td>
                                                    </>
                                                )}

                                                {/* Social Specific */}
                                                {activeTab === "Social Media Team" && (
                                                    <>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col space-y-2 items-start">
                                                                {sub.instagram_handle && (
                                                                    <a
                                                                        href={sub.instagram_handle.startsWith('http') ? sub.instagram_handle : `https://instagram.com/${sub.instagram_handle.replace('@', '')}`}
                                                                        target="_blank"
                                                                        className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit"
                                                                    >
                                                                        IG
                                                                    </a>
                                                                )}
                                                                {sub.twitter_handle && (
                                                                    <a
                                                                        href={sub.twitter_handle.startsWith('http') ? sub.twitter_handle : `https://x.com/${sub.twitter_handle.replace('@', '')}`}
                                                                        target="_blank"
                                                                        className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit"
                                                                    >
                                                                        X
                                                                    </a>
                                                                )}
                                                                {sub.linkedin_handle_social && (
                                                                    <a
                                                                        href={sub.linkedin_handle_social.startsWith('http') ? sub.linkedin_handle_social : `https://${sub.linkedin_handle_social}`}
                                                                        target="_blank"
                                                                        className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit"
                                                                    >
                                                                        LinkedIn
                                                                    </a>
                                                                )}
                                                                {sub.other_socials && <div className="text-[11px] px-2 py-1 bg-gray-100 text-gray-700 rounded truncate max-w-[150px]" title={sub.other_socials}>{sub.other_socials}</div>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 max-w-xs truncate" title={sub.social_analysis}>{sub.social_analysis}</td>
                                                    </>
                                                )}

                                                {/* Content Specific */}
                                                {activeTab === "Content Creation Team" && (
                                                    <td className="px-6 py-4">
                                                        {sub.content_portfolio && <div className="mb-2"><a href={sub.content_portfolio} target="_blank" className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit">Portfolio</a></div>}
                                                        <div className="flex flex-col space-y-2 items-start mt-1">
                                                            {sub.content_ig && (
                                                                <a
                                                                    href={sub.content_ig.startsWith('http') ? sub.content_ig : `https://instagram.com/${sub.content_ig.replace('@', '')}`}
                                                                    target="_blank"
                                                                    className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit"
                                                                >
                                                                    IG
                                                                </a>
                                                            )}
                                                            {sub.content_yt && (
                                                                <a
                                                                    href={sub.content_yt.startsWith('http') ? sub.content_yt : `https://youtube.com/${sub.content_yt.replace('@', '')}`}
                                                                    target="_blank"
                                                                    className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit"
                                                                >
                                                                    YT
                                                                </a>
                                                            )}
                                                            {sub.content_other && (
                                                                <a
                                                                    href={sub.content_other.startsWith('http') ? sub.content_other : `https://${sub.content_other}`}
                                                                    target="_blank"
                                                                    className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-[#673ab7] hover:bg-purple-200 hover:text-purple-800 rounded text-[11px] font-semibold transition-colors w-fit"
                                                                    title={sub.content_other}
                                                                >
                                                                    Other
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mt-2"><span className="font-semibold">Tools:</span> {sub.tools_familiarity}</div>
                                                    </td>
                                                )}

                                                {/* Outreach Specific */}
                                                {activeTab === "Outreach Team" && (
                                                    <td className="px-6 py-4 max-w-xs truncate" title={sub.sponsorship_strategy}>{sub.sponsorship_strategy}</td>
                                                )}

                                                {(activeTab === "All Responses" || activeTab === "Shortlisted Candidates") && (
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {sub.selected_track}
                                                        </span>
                                                    </td>
                                                )}

                                                <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs">
                                                    {new Date(sub.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-bold ${candidateStatuses[sub.timestamp] === 'accepted' ? 'bg-green-100 text-green-800' :
                                                        candidateStatuses[sub.timestamp] === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            candidateStatuses[sub.timestamp] === 'viewed' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {candidateStatuses[sub.timestamp] ? candidateStatuses[sub.timestamp].charAt(0).toUpperCase() + candidateStatuses[sub.timestamp].slice(1) : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Details */}
            {selectedCandidate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedCandidate(null)}
                >
                    <div
                        className={`w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl border ${candidateStatuses[selectedCandidate.timestamp] === 'accepted' ? 'bg-green-50 border-green-200' :
                            candidateStatuses[selectedCandidate.timestamp] === 'rejected' ? 'bg-red-50 border-red-200' :
                                'bg-white border-gray-200'
                            }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`px-6 py-4 flex justify-between items-center border-b ${candidateStatuses[selectedCandidate.timestamp] === 'accepted' ? 'border-green-200 bg-green-100/50' :
                            candidateStatuses[selectedCandidate.timestamp] === 'rejected' ? 'border-red-200 bg-red-100/50' :
                                'border-gray-100 bg-gray-50'
                            }`}>
                            <div>
                                <h2 className="text-xl font-bold text-[#202124]">{selectedCandidate.full_name}</h2>
                                <p className="text-sm text-gray-500">{selectedCandidate.selected_track}</p>
                            </div>
                            <button onClick={() => setSelectedCandidate(null)} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-black/5 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Detailed Info Loop */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/50 p-4 rounded-lg border border-black/5 shadow-sm">
                                <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</p><p className="font-medium mt-1">{selectedCandidate.email}</p></div>
                                <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Phone</p><p className="font-medium mt-1">{selectedCandidate.phone}</p></div>
                                <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Roll/USN</p><p className="font-medium mt-1 uppercase">{selectedCandidate.roll_number}</p></div>
                                <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Branch & Semester</p><p className="font-medium mt-1">{selectedCandidate.branch}</p></div>
                                <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Section</p><p className="font-medium mt-1">{selectedCandidate.section || 'N/A'}</p></div>
                            </div>

                            <hr className={candidateStatuses[selectedCandidate.timestamp] === 'accepted' ? 'border-green-200' : candidateStatuses[selectedCandidate.timestamp] === 'rejected' ? 'border-red-200' : 'border-gray-200'} />

                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-[#202124]">Application Answers</h3>
                                {Object.entries(selectedCandidate).filter(([k]) => !['timestamp', 'full_name', 'email', 'phone', 'roll_number', 'branch', 'section', 'selected_track'].includes(k)).map(([key, value]) => {
                                    if (!value) return null;

                                    const strVal = String(value);
                                    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.(?:com|org|net|in|co|io|dev|app)\b(?:\/[^\s]*)?)/g;
                                    const isHandleKey = key.toLowerCase().includes('handle') || key.toLowerCase().includes('ig') || key.toLowerCase().includes('yt') || key.toLowerCase().includes('x_') || key.toLowerCase().includes('twitter') || key.toLowerCase().includes('linkedin');
                                    let content;

                                    if (isHandleKey && !strVal.includes(' ') && !strVal.startsWith('http') && !strVal.includes('.com') && !strVal.includes('.in')) {
                                        let href = '';
                                        const cleanVal = strVal.replace('@', '');
                                        if (key.toLowerCase().includes('instagram') || key.toLowerCase().includes('ig')) href = `https://instagram.com/${cleanVal}`;
                                        else if (key.toLowerCase().includes('twitter') || key.toLowerCase().includes('x_') || key.toLowerCase().includes('x handle')) href = `https://x.com/${cleanVal}`;
                                        else if (key.toLowerCase().includes('yt') || key.toLowerCase().includes('youtube')) href = `https://youtube.com/${cleanVal}`;
                                        else if (key.toLowerCase().includes('linkedin')) href = `https://linkedin.com/in/${cleanVal}`;
                                        else href = `https://${cleanVal}`;

                                        content = <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#673ab7] hover:underline break-words font-medium">{strVal}</a>;
                                    } else {
                                        const parts = strVal.split(urlRegex);
                                        content = parts.map((part, i) => {
                                            if (part.match(urlRegex)) {
                                                const href = part.startsWith('http') ? part : `https://${part}`;
                                                return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-[#673ab7] hover:underline break-words font-medium">{part}</a>;
                                            }
                                            return <span key={i}>{part}</span>;
                                        });
                                        content = <p className="whitespace-pre-wrap text-gray-800">{content}</p>;
                                    }

                                    return (
                                        <div key={key} className="bg-white p-4 rounded-lg border border-black/5 shadow-sm">
                                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wide mb-2">{key.replace(/_/g, ' ')}</p>
                                            {content}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className={`px-6 py-4 flex justify-between items-center border-t ${candidateStatuses[selectedCandidate.timestamp] === 'accepted' ? 'border-green-200 bg-green-100/50' :
                            candidateStatuses[selectedCandidate.timestamp] === 'rejected' ? 'border-red-200 bg-red-100/50' :
                                'border-gray-100 bg-gray-50'
                            }`}>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 font-medium">Status:</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${candidateStatuses[selectedCandidate.timestamp] === 'accepted' ? 'bg-green-500 text-white' :
                                    candidateStatuses[selectedCandidate.timestamp] === 'rejected' ? 'bg-red-500 text-white' :
                                        candidateStatuses[selectedCandidate.timestamp] === 'viewed' ? 'bg-blue-500 text-white' :
                                            'bg-gray-500 text-white'
                                    }`}>
                                    {candidateStatuses[selectedCandidate.timestamp] || 'Pending'}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => updateCandidateStatus(selectedCandidate.timestamp, 'rejected')}
                                    className={`px-6 py-2 rounded-md font-bold transition-all shadow-sm ${candidateStatuses[selectedCandidate.timestamp] === 'rejected'
                                        ? 'bg-red-600 text-white outline outline-2 outline-offset-2 outline-red-600'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                        }`}
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => updateCandidateStatus(selectedCandidate.timestamp, 'accepted')}
                                    className={`px-6 py-2 rounded-md font-bold transition-all shadow-sm ${candidateStatuses[selectedCandidate.timestamp] === 'accepted'
                                        ? 'bg-green-600 text-white outline outline-2 outline-offset-2 outline-green-600'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
