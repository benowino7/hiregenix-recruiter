import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Briefcase, Award, Clock, Zap, X, ChevronDown, TrendingUp, Star, Building2, DollarSign, Moon, Sun, LayoutGrid, List, Loader, ExternalLink } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';

// Format enum like FULL_TIME → "Full Time"
const formatEnum = (val) => {
  if (!val) return "";
  return val.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

// Strip HTML tags from text
const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
};

const JobListings = () => {
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState('grid');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 24, totalPages: 1 });
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    jobType: searchParams.get('jobType') || '',
    experience: searchParams.get('experience') || '',
    salaryMin: searchParams.get('salaryMin') || '',
    salaryMax: searchParams.get('salaryMax') || '',
    remote: searchParams.get('remote') === 'true',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Server-side search — only called explicitly
  const fetchJobs = useCallback(async (currentFilters, page = 1, useAi = false) => {
    try {
      setLoading(true);
      setError(null);

      let url;
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", "24");

      if (useAi && currentFilters.search) {
        params.set("q", currentFilters.search);
        if (currentFilters.location) params.set("location", currentFilters.location);
        url = `${BASE_URL}/public/jobs/ai-search?${params.toString()}`;
      } else {
        if (currentFilters.search) params.set("search", currentFilters.search);
        if (currentFilters.location) params.set("location", currentFilters.location);
        if (currentFilters.category) params.set("industryName", currentFilters.category);
        if (currentFilters.jobType) params.set("employmentType", currentFilters.jobType);
        if (currentFilters.experience) params.set("experienceLevel", currentFilters.experience);
        if (currentFilters.salaryMin) params.set("salaryMin", currentFilters.salaryMin);
        if (currentFilters.salaryMax) params.set("salaryMax", currentFilters.salaryMax);
        if (currentFilters.remote) params.set("isRemote", "true");
        url = `${BASE_URL}/public/jobs?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch jobs");

      const result = await response.json();

      const transformedJobs = (result.data || []).map((job) => ({
        id: job.id,
        title: job.title || "Untitled",
        company: job.company?.name || "Unknown Company",
        companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company?.name || "UC")}`,
        location: job.locationName || "",
        locationType: job.isRemote ? "Remote" : "On-site",
        salary: {
          min: job.minSalary,
          max: job.maxSalary,
          currency: job.currency,
          frequency: "monthly",
        },
        matchScore: Math.floor(Math.random() * 20) + 80,
        jobType: formatEnum(job.employmentType),
        experienceLevel: job.experienceLevel,
        postedDate: job.publishedAt || job.createdAt,
        urgency: Math.random() > 0.7 ? "Fast" : null,
        category: job.industries?.[0]?.industry?.name || "General",
        subCategory: job.industries?.[0]?.industry?.slug || "",
        skills: (job.skills || []).map((s) => s.skill?.name).filter(Boolean),
        description: stripHtml(job.description || "").substring(0, 120) + "...",
        benefits: ["Health Insurance", "Flexible Hours", "Remote Work"],
        applyUrl: `/joblisting/${job.id}`,
        applicationUrl: job.applicationUrl || null,
      }));

      setJobs(transformedJobs);
      setPagination({
        total: result.meta?.total || 0,
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 24,
        totalPages: result.meta?.totalPages || 1,
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const hasSearchQuery = filters.search.trim().length > 0;
    if (hasSearchQuery) {
      setIsAiSearch(true);
      fetchJobs(filters, 1, true);
    } else {
      fetchJobs(filters, 1, false);
    }
  }, []);

  const triggerSearch = (useAi = isAiSearch) => {
    fetchJobs(filters, 1, useAi);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    const emptyFilters = { search: '', location: '', category: '', jobType: '', experience: '', salaryMin: '', salaryMax: '', remote: false };
    setFilters(emptyFilters);
    setIsAiSearch(false);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== false).length;

  // Shared Job Card for Grid Layout
  const JobCard = ({ job }) => {
    const daysAgo = Math.floor((new Date() - new Date(job.postedDate)) / (1000 * 60 * 60 * 24));

    return (
      <a href={job.applyUrl} className="group relative bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-600/0 group-hover:from-teal-500/5 group-hover:to-teal-600/5 transition-all duration-500 pointer-events-none" />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-teal-200 dark:group-hover:ring-teal-800 transition-all flex-shrink-0">
                <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-1 line-clamp-1">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Building2 size={14} />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Type */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <MapPin size={14} className="text-slate-400 dark:text-slate-500" />
              <span>{job.location || 'Not specified'}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400">{job.locationType}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.jobType && (
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg border border-blue-100 dark:border-blue-900">
                {job.jobType}
              </span>
            )}
            {job.experienceLevel && (
              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg border border-purple-100 dark:border-purple-900">
                {job.experienceLevel}
              </span>
            )}
            <span className="px-3 py-1 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-xs font-medium rounded-lg border border-green-100 dark:border-green-900">
              {job.category}
            </span>
          </div>

          {/* Skills */}
          <div className="mb-5">
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded border border-slate-200 dark:border-slate-700">
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="px-2 py-1 text-slate-500 dark:text-slate-400 text-xs">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 line-clamp-2">{job.description}</p>

          {/* View Button */}
          <span className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all group-hover:scale-[1.02] flex items-center justify-center gap-2">
            <Briefcase size={18} />
            View Job
          </span>
        </div>
      </a>
    );
  };

  // Compact List Item for List Layout
  const JobListItem = ({ job }) => {
    const daysAgo = Math.floor((new Date() - new Date(job.postedDate)) / (1000 * 60 * 60 * 24));

    return (
      <a href={job.applyUrl}
        className="group relative flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6 px-5 sm:px-6 py-5 sm:py-6 hover:bg-gradient-to-r hover:from-teal-50/40 hover:to-transparent dark:hover:from-orange-950/20 dark:hover:to-transparent transition-all duration-250 ease-out cursor-pointer bg-white dark:bg-dark-sidebar rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"
      >
        <div className="relative flex-shrink-0 self-start sm:self-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg ring-1 ring-slate-100/70 dark:ring-slate-700/50 transition-all duration-300">
            <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-base sm:text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
              {job.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
            <div className="flex items-center gap-1.5">
              <Building2 size={15} className="opacity-80" />
              <span className="font-medium truncate max-w-[180px]">{job.company}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="opacity-80" />
              <span className="truncate max-w-[160px]">{job.location || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-75">
              <Clock size={15} />
              <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3.5">
            {job.jobType && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-teal-100/80 dark:bg-teal-900/35 text-teal-800 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40">{job.jobType}</span>
            )}
            {job.experienceLevel && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{job.experienceLevel}</span>
            )}
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">{job.locationType}</span>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 6).map((skill, i) => (
                <span key={i} className="px-2.5 py-1 text-xs rounded-md bg-slate-100/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50">{skill}</span>
              ))}
              {job.skills.length > 6 && (
                <span className="px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400">+{job.skills.length - 6}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 self-start sm:self-center mt-4 sm:mt-0">
          <span className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-250 group-hover:scale-105 active:scale-95">
            View
            <Briefcase size={17} />
          </span>
        </div>
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 dark:from-dark-background dark:via-slate-900 dark:to-dark-background py-8">
      {/* Hero Section */}
      <div className="text-white pt-16 pb-24 px-4">
        <div className="max-w-[90rem] mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full px-4 py-2">
                <TrendingUp size={16} className='text-theme_color dark:text-white' />
                <span className="text-sm font-medium text-theme_color dark:text-white">Live Job Market</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-600 dark:text-slate-300">
              Find Your Dream Job in <span className="text-teal-400">Dubai</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              AI-powered matching • Verified employers • Tax-free salaries
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl shadow-2xl p-3 border border-transparent dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="text"
                    placeholder="Try: banking, remote react, finance manager..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsAiSearch(true);
                        triggerSearch(true);
                      }
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div className="relative md:w-64">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="text"
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') triggerSearch(true);
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsAiSearch(true);
                    triggerSearch(true);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap flex items-center gap-2"
                >
                  <Zap size={18} />
                  AI Search
                </button>
              </div>
            </div>

            {/* AI Search Badge */}
            {isAiSearch && filters.search && (
              <div className="mt-3 flex items-center gap-2">
                <Zap size={14} className="text-teal-500" />
                <span className="text-sm text-slate-400 dark:text-slate-500">
                  AI-powered results for <span className="font-semibold text-teal-500">"{filters.search}"</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Quick Filters */}
        <div className="bg-white dark:bg-dark-sidebar rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-sm font-semibold rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-medium flex items-center gap-1 transition"
                >
                  <X size={16} />
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-300 dark:border-slate-600 hover:border-teal-300 dark:hover:border-teal-600 rounded-lg transition"
              >
                <Filter size={16} />
                Advanced
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: '🏠 Remote', key: 'remote', value: true },
              { label: 'Full-time', key: 'jobType', value: 'Full-time' },
              { label: 'Senior Level', key: 'experience', value: 'Senior-Level' },
              { label: 'Technology', key: 'category', value: 'Software Engineering' },
              { label: 'USD 1000+', key: 'salaryMin', value: '1000' },
            ].map(({ label, key, value }) => (
              <button
                key={label}
                onClick={() => {
                  const newVal = filters[key] === value ? '' : value;
                  const newFilters = { ...filters, [key]: newVal };
                  setFilters(newFilters);
                  setIsAiSearch(false);
                  fetchJobs(newFilters, 1, false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filters[key] === value
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">All Categories</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Experience</label>
                <select
                  value={filters.experience}
                  onChange={(e) => updateFilter('experience', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">All Levels</option>
                  <option value="Mid-Level">Mid Level</option>
                  <option value="Senior-Level">Senior</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Min Salary</label>
                  <input
                    type="number"
                    placeholder="USD"
                    value={filters.salaryMin}
                    onChange={(e) => updateFilter('salaryMin', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Salary</label>
                  <input
                    type="number"
                    placeholder="USD"
                    value={filters.salaryMax}
                    onChange={(e) => updateFilter('salaryMax', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="col-span-full flex justify-end mt-4">
                <button
                  onClick={() => {
                    setIsAiSearch(false);
                    fetchJobs(filters, 1, false);
                  }}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Header with Layout Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-600 dark:text-slate-300">
              {loading ? '...' : `${pagination.total.toLocaleString()} ${pagination.total === 1 ? 'Job' : 'Jobs'} Found`}
            </h2>
            <p className="text-gray-600 dark:text-slate-300 text-sm mt-1">
              {activeFiltersCount > 0 ? "Filtered results" : "Showing latest jobs"} — Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded ${layout === 'grid' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'} hover:bg-teal-500 hover:text-white transition`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded ${layout === 'list' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'} hover:bg-teal-500 hover:text-white transition`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-teal-500" />
            <span className="ml-3 text-slate-500 dark:text-slate-400">
              {isAiSearch ? 'AI is searching...' : 'Loading jobs...'}
            </span>
          </div>
        )}

        {/* Jobs Display */}
        {!loading && layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-4">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : !loading && (
          <div className="overflow-hidden pb-4 flex flex-col gap-2">
            {jobs.map(job => (
              <JobListItem key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-10 w-10 text-theme_color" />
            </div>
            <h3 className="text-2xl font-bold text-slate-200 mb-2">No jobs found</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pb-16">
            <button
              onClick={() => { setPagination(p => ({ ...p, page: p.page - 1 })); fetchJobs(filters, pagination.page - 1, isAiSearch); }}
              disabled={pagination.page <= 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-teal-50 dark:hover:bg-slate-700 transition font-medium text-sm"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} jobs)
            </span>
            <button
              onClick={() => { setPagination(p => ({ ...p, page: p.page + 1 })); fetchJobs(filters, pagination.page + 1, isAiSearch); }}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-teal-50 dark:hover:bg-slate-700 transition font-medium text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListings;
