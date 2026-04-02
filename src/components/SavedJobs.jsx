// SavedJobs.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    X,
    Bookmark,
    BookmarkCheck,
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Eye,
    Send,
    Trash2,
    LayoutGrid,
    LayoutList,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ────────────────────────────────────────────────
// Mock Saved Jobs Data (you can replace with real data later)
// ────────────────────────────────────────────────
const mockSavedJobs = [
    {
        id: 'sj-001',
        title: 'Senior Frontend Developer',
        company: { name: 'Innovatech Solutions', logo: 'IN' },
        location: 'Dubai, UAE',
        jobType: 'Full-time',
        salary: { min: 15000, max: 22000, currency: 'USD' },
        postedAt: '2025-01-18',
        matchScore: 92,
        status: 'Open',
        isSaved: true
    },
    {
        id: 'sj-002',
        title: 'Product Manager – FinTech',
        company: { name: 'PayFort', logo: 'PF' },
        location: 'Dubai Internet City, UAE',
        jobType: 'Full-time',
        salary: { min: 14000, max: 20000, currency: 'USD' },
        postedAt: '2025-01-15',
        matchScore: 88,
        status: 'Open',
        isSaved: true
    },
    {
        id: 'sj-003',
        title: 'DevOps Engineer',
        company: { name: 'Etisalat Digital', logo: 'ED' },
        location: 'Remote',
        jobType: 'Contract',
        salary: { min: 13000, max: 19000, currency: 'USD' },
        postedAt: '2025-01-10',
        matchScore: 85,
        status: 'Open',
        isSaved: true
    },
    {
        id: 'sj-004',
        title: 'UI/UX Designer',
        company: { name: 'Careem', logo: 'CR' },
        location: 'Dubai, UAE',
        jobType: 'Full-time',
        salary: { min: 11000, max: 16000, currency: 'USD' },
        postedAt: '2025-01-20',
        matchScore: 79,
        status: 'Closed',
        isSaved: true
    }
];

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
const getTimeAgo = (dateStr) => {
    const diffDays = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Open':
            return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
        case 'Closed':
            return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

function SavedJobs() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('savedJobsView') || 'grid');
    const [savedJobIds, setSavedJobIds] = useState(() => {
        // In real app → load from user profile / API
        return mockSavedJobs.map(j => j.id);
    });

    useEffect(() => {
        localStorage.setItem('savedJobsView', viewMode);
    }, [viewMode]);

    // Toggle save/unsave
    const toggleSave = (jobId) => {
        setSavedJobIds(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };

    // Filter saved jobs
    const displayedJobs = useMemo(() => {
        return mockSavedJobs.filter(job => {
            if (!savedJobIds.includes(job.id)) return false;
            if (!searchQuery.trim()) return true;

            const q = searchQuery.toLowerCase();
            return (
                job.title.toLowerCase().includes(q) ||
                job.company.name.toLowerCase().includes(q) ||
                job.location.toLowerCase().includes(q)
            );
        });
    }, [searchQuery, savedJobIds]);

    return (
        <div className="w-full h-full">
            <div className="w-full mx-auto ">

                {/* Header */}
                <div className="pt-10 pb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            Saved Jobs
                        </h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Jobs you've bookmarked for later
                        </p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme_color/10 dark:bg-theme_color/20 rounded-full border border-theme_color/40 text-theme_color font-medium">
                            <Bookmark size={18} className="text-theme_color" />
                            {savedJobIds.length} saved
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-5 py-2.5 text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-theme_color text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-theme_color/10'
                                    }`}
                            >
                                <LayoutGrid size={18} />
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-5 py-2.5 text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-theme_color text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-theme_color/10'
                                    }`}
                            >
                                <LayoutList size={18} />
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search saved jobs..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme_color dark:bg-gray-800 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-theme_color"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {displayedJobs.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
                        <Bookmark className="mx-auto mb-6 text-gray-400" size={64} />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            No saved jobs yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                            Start saving jobs you like from the Recommended or Search pages to keep them here.
                        </p>
                        <Link to={'/dashboard/recommandations'} className="px-8 py-4 bg-theme_color text-white rounded-xl font-medium hover:bg-theme_color/90 transition-colors">
                            Browse Recommended Jobs
                        </Link>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedJobs.map(job => (
                            <div
                                key={job.id}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-theme_color/40 transition-all duration-300"
                            >
                                <div className="p-6 pb-4 border-b dark:border-gray-800">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-theme_color/10 flex items-center justify-center text-theme_color font-bold text-xl">
                                                {job.company.logo}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {job.company.name}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleSave(job.id)}
                                            className="p-2 rounded-full hover:bg-theme_color/10 transition-colors"
                                        >
                                            <BookmarkCheck size={22} className="text-theme_color fill-theme_color" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={16} className="text-gray-500" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase size={16} className="text-gray-500" />
                                            {job.jobType}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Saved {getTimeAgo(job.postedAt)}
                                        </span>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t dark:border-gray-800">
                                        <button className="flex-1 py-2.5 bg-theme_color text-white rounded-lg hover:bg-theme_color/90 transition-colors flex items-center justify-center gap-2">
                                            <Send size={16} /> Apply Now
                                        </button>
                                        <button className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleSave(job.id)}
                                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedJobs.map(job => (
                            <div
                                key={job.id}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-theme_color/40 transition-all flex flex-col sm:flex-row sm:items-center gap-5"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-theme_color/10 flex items-center justify-center text-theme_color font-bold text-xl shrink-0">
                                        {job.company.logo}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {job.company.name} • {job.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="flex flex-col items-end gap-1 text-sm text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {getTimeAgo(job.postedAt)}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg hover:bg-theme_color/10">
                                            <Eye size={20} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => toggleSave(job.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SavedJobs;