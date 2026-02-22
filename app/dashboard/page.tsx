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
    const TABS = ["Overview", "All Responses", "Technical Team", "Social Media Team", "Content Creation Team", "Outreach Team"];

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
        if (activeTab === "Overview" || activeTab === "All Responses") return submissions;
        return submissions.filter(sub => sub.selected_track === activeTab);
    };

    const filteredData = getFilteredSubmissions();
    const totalResponses = submissions.length;

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
                            onClick={() => setActiveTab(tab)}
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
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-normal">{activeTab} ({filteredData.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Details</th>
                                        <th className="px-6 py-3">Contact</th>
                                        {activeTab === "Technical Team" && <th className="px-6 py-3">Tech Skills</th>}
                                        {activeTab === "Technical Team" && <th className="px-6 py-3">Links</th>}

                                        {activeTab === "Social Media Team" && <th className="px-6 py-3">Handles</th>}
                                        {activeTab === "Social Media Team" && <th className="px-6 py-3">Analysis</th>}

                                        {activeTab === "Content Creation Team" && <th className="px-6 py-3">Portfolio & Socials</th>}

                                        {activeTab === "Outreach Team" && <th className="px-6 py-3">Strategy</th>}

                                        {(activeTab === "All Responses") && <th className="px-6 py-3">Track</th>}
                                        <th className="px-6 py-3">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No submissions found for this track.</td></tr>
                                    ) : (
                                        filteredData.map((sub, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-[#202124]">{sub.full_name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{sub.roll_number} • {sub.branch}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900">{sub.email}</div>
                                                    <div className="text-gray-500 text-xs">{sub.phone}</div>
                                                </td>

                                                {/* Tech Specific */}
                                                {activeTab === "Technical Team" && (
                                                    <>
                                                        <td className="px-6 py-4 max-w-xs truncate" title={sub.tech_skills}>{sub.tech_skills}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col space-y-1">
                                                                {sub.github_link && <a href={sub.github_link} target="_blank" className="text-[#673ab7] hover:underline text-xs">GitHub</a>}
                                                                {sub.portfolio_link_tech && <a href={sub.portfolio_link_tech} target="_blank" className="text-[#673ab7] hover:underline text-xs">Portfolio</a>}
                                                                {sub.linkedin_link && <a href={sub.linkedin_link} target="_blank" className="text-[#673ab7] hover:underline text-xs">LinkedIn</a>}
                                                            </div>
                                                        </td>
                                                    </>
                                                )}

                                                {/* Social Specific */}
                                                {activeTab === "Social Media Team" && (
                                                    <>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col space-y-1">
                                                                {sub.instagram_handle && (
                                                                    <a
                                                                        href={sub.instagram_handle.startsWith('http') ? sub.instagram_handle : `https://instagram.com/${sub.instagram_handle.replace('@', '')}`}
                                                                        target="_blank"
                                                                        className="text-[#673ab7] hover:underline text-xs block"
                                                                    >
                                                                        IG: {sub.instagram_handle}
                                                                    </a>
                                                                )}
                                                                {sub.twitter_handle && (
                                                                    <a
                                                                        href={sub.twitter_handle.startsWith('http') ? sub.twitter_handle : `https://x.com/${sub.twitter_handle.replace('@', '')}`}
                                                                        target="_blank"
                                                                        className="text-[#673ab7] hover:underline text-xs block"
                                                                    >
                                                                        X: {sub.twitter_handle}
                                                                    </a>
                                                                )}
                                                                {sub.linkedin_handle_social && (
                                                                    <a
                                                                        href={sub.linkedin_handle_social.startsWith('http') ? sub.linkedin_handle_social : `https://${sub.linkedin_handle_social}`}
                                                                        target="_blank"
                                                                        className="text-[#673ab7] hover:underline text-xs block"
                                                                    >
                                                                        LinkedIn
                                                                    </a>
                                                                )}
                                                                {sub.other_socials && <div className="text-xs text-gray-500 truncate max-w-[150px]" title={sub.other_socials}>{sub.other_socials}</div>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 max-w-xs truncate" title={sub.social_analysis}>{sub.social_analysis}</td>
                                                    </>
                                                )}

                                                {/* Content Specific */}
                                                {activeTab === "Content Creation Team" && (
                                                    <td className="px-6 py-4">
                                                        {sub.content_portfolio && <div className="mb-1"><a href={sub.content_portfolio} target="_blank" className="text-[#673ab7] hover:underline font-medium">Portfolio</a></div>}
                                                        <div className="flex flex-col space-y-1 mt-1">
                                                            {sub.content_ig && (
                                                                <a
                                                                    href={sub.content_ig.startsWith('http') ? sub.content_ig : `https://instagram.com/${sub.content_ig.replace('@', '')}`}
                                                                    target="_blank"
                                                                    className="text-gray-500 hover:text-[#673ab7] hover:underline text-xs block"
                                                                >
                                                                    IG: {sub.content_ig}
                                                                </a>
                                                            )}
                                                            {sub.content_yt && (
                                                                <a
                                                                    href={sub.content_yt.startsWith('http') ? sub.content_yt : `https://youtube.com/${sub.content_yt.replace('@', '')}`}
                                                                    target="_blank"
                                                                    className="text-gray-500 hover:text-[#673ab7] hover:underline text-xs block"
                                                                >
                                                                    YT: {sub.content_yt}
                                                                </a>
                                                            )}
                                                            {sub.content_other && (
                                                                <div className="text-xs text-gray-500 truncate max-w-[150px]" title={sub.content_other}>
                                                                    Other: {sub.content_other}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mt-2"><span className="font-semibold">Tools:</span> {sub.tools_familiarity}</div>
                                                    </td>
                                                )}

                                                {/* Outreach Specific */}
                                                {activeTab === "Outreach Team" && (
                                                    <td className="px-6 py-4 max-w-xs truncate" title={sub.sponsorship_strategy}>{sub.sponsorship_strategy}</td>
                                                )}

                                                {(activeTab === "All Responses") && (
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {sub.selected_track}
                                                        </span>
                                                    </td>
                                                )}

                                                <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs">
                                                    {new Date(sub.timestamp).toLocaleString()}
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
        </div>
    );
}
