// src/pages/recruiter/MyPostedJobs.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Users,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  LayoutList,
  Plus,
  Loader2,
  Pause,
  Play,
  Brain,
  ChevronDown,
} from "lucide-react";
import JobPostingModal from "./JobPostingModal";
import { BASE_URL } from "../BaseUrl";
import Pagination from "./Pagination";
import PublishJob from "./PublishJob";
import SuspendJob from "./SuspendJob";
import UnSuspendJob from "./UnSuspendJob";

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────
const getStatusStyle = (status) => {
  switch (status) {
    case "PUBLISHED":
      return {
        bg: "bg-green-100 dark:bg-green-900/40",
        text: "text-green-700 dark:text-green-300",
        icon: CheckCircle,
      };
    case "CLOSED":
      return {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-300",
        icon: AlertCircle,
      };
    case "DRAFT":
      return {
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-300",
        icon: Edit,
      };
    case "SUSPENDED":
      return {
        bg: "bg-teal-100 dark:bg-teal-900/40",
        text: "text-teal-700 dark:text-teal-300",
        icon: AlertCircle,
      };
    default:
      return {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-300",
        icon: AlertCircle,
      };
  }
};

const getRelativeTime = (dateStr) => {
  const diffDays = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

// ────────────────────────────────────────────────
// SEARCHABLE DROPDOWN
// ────────────────────────────────────────────────
const SearchableDropdown = ({ label, placeholder, endpoint, token, value, onChange, isTaxonomy }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const ref = useRef(null);
  const timerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // For taxonomy endpoint: fetch once and filter client-side
  useEffect(() => {
    if (!isTaxonomy) return;
    (async () => {
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        if (!json.error && json.result) {
          const items = [];
          for (const group of json.result) {
            for (const ind of group.industries || []) {
              items.push({ id: ind.id, name: ind.name });
            }
          }
          setAllItems(items);
        }
      } catch { setAllItems([]); }
    })();
  }, [endpoint, isTaxonomy]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (isTaxonomy) {
        // Client-side filter for taxonomy
        const q = query.toLowerCase();
        setResults(q ? allItems.filter((i) => i.name.toLowerCase().includes(q)) : allItems);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${endpoint}?search=${encodeURIComponent(query)}&limit=15`,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
        );
        const json = await res.json();
        setResults(json?.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timerRef.current);
  }, [query, open, endpoint, token, isTaxonomy, allItems]);

  // Clear label when value is cleared externally
  useEffect(() => {
    if (!value) setSelectedLabel("");
  }, [value]);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-semibold mb-2 dark:text-gray-200">{label}</label>
      <div
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-theme_color transition-colors"
      >
        {value ? (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <span className="text-sm text-gray-900 dark:text-white truncate">{selectedLabel}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange("", ""); setSelectedLabel(""); setQuery(""); }}
              className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-400 flex-1">{placeholder}</span>
        )}
        <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-theme_color text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4 gap-2 text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-xs">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400">
                {query ? "No results found" : "Type to search"}
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onChange(item.id, item.name);
                    setSelectedLabel(item.name);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-theme_color/10 transition-colors ${
                    value === item.id
                      ? "bg-theme_color/5 text-theme_color font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {item.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────
function MyPostedJobs({ companyId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [layout, setLayout] = useState(
    () => localStorage.getItem("myJobsLayout") || "modern-grid",
  );
  const [open, setOpen] = useState(false);
  const [editJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [reload, setReload] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [jobData2, setJobData2] = useState(null);
  const [jobData3, setJobData3] = useState(null);
  const [openPublish, setOpenPublish] = useState(false);
  const [showPublishModal2, setShowPublishModal2] = useState(false);
  const [showPublishModal3, setShowPublishModal3] = useState(false);
  const token = JSON.parse(sessionStorage?.getItem("accessToken"));

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // API Filters
  const [apiFilters, setApiFilters] = useState({
    status: "",
    industryId: "",
    skillId: "",
    hasApplications: false,
  });

  useEffect(() => {
    localStorage.setItem("myJobsLayout", layout);
  }, [layout]);

  // Server-side search query (debounced)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
      if (apiFilters.status) params.append("status", apiFilters.status);
      if (apiFilters.industryId) params.append("industryId", apiFilters.industryId);
      if (apiFilters.skillId) params.append("skillId", apiFilters.skillId);
      if (apiFilters.hasApplications) params.append("hasApplications", "true");
      params.append("page", pagination.currentPage);
      params.append("limit", pagination.limit);
      const response = await fetch(
        `${BASE_URL}/recruiter/jobs?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response?.json();
      if (response.ok) {
        setJobs(data?.data || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: data?.meta?.totalPages || 1,
          totalItems: data?.meta?.total || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [apiFilters, debouncedSearch, pagination.currentPage, pagination.limit, token]);

  useEffect(() => {
    if (companyId) fetchJobs();
  }, [apiFilters, debouncedSearch, pagination.currentPage, pagination.limit, reload, companyId]);

  // Jobs are now server-filtered, use directly
  const filteredJobs = jobs;

  const updateFilter = useCallback((key, val) => {
    setApiFilters((prev) => ({ ...prev, [key]: val }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setApiFilters({ status: "", industryId: "", skillId: "", hasApplications: false });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const hasActiveFilters =
    apiFilters.status || apiFilters.industryId || apiFilters.skillId || apiFilters.hasApplications;

  const handleCreateJob = useCallback(() => {
    setEditingJob(null);
    setOpen(true);
  }, []);

  const handleEditJob = useCallback((job) => {
    setEditingJob(job);
    setOpen(true);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const showingFrom = (pagination.currentPage - 1) * pagination.limit + 1;
  const showingTo = Math.min(
    pagination.currentPage * pagination.limit,
    pagination.totalItems,
  );

  // ─── Status pills ───
  const STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "PUBLISHED", label: "Published" },
    { value: "DRAFT", label: "Draft" },
    { value: "SUSPENDED", label: "Suspended" },
    { value: "CLOSED", label: "Closed" },
  ];

  return (
    <div className="w-full pb-2">
      <div className="w-full">
        {/* Header */}
        <div className="pt-4 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              My Posted Jobs
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage, edit and track applications for your job postings
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleCreateJob}
              className="inline-flex items-center gap-2 px-6 py-3 bg-theme_color hover:bg-theme_color/90 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <Plus size={18} />
              Post New Job
            </button>

            <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden shadow-sm">
              <button
                onClick={() => setLayout("modern-grid")}
                className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors ${
                  layout === "modern-grid"
                    ? "bg-theme_color text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <LayoutGrid size={18} />
                Grid
              </button>
              <button
                onClick={() => setLayout("elegant-list")}
                className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors ${
                  layout === "elegant-list"
                    ? "bg-theme_color text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <LayoutList size={18} />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Search + Filters toggle */}
        <div className="mb-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by title, location or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme_color"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all shadow-sm min-w-[140px] ${
              showFilters || hasActiveFilters
                ? "bg-theme_color text-white"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <SlidersHorizontal size={20} />
            Filters{" "}
            {hasActiveFilters && <span className="ml-1 text-xs">(Active)</span>}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 lg:p-8 shadow-xl">
            {/* Quick status pills */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                Job Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateFilter("status", value)}
                    className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                      apiFilters.status === value
                        ? "bg-theme_color text-white border-theme_color shadow-md"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-theme_color/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Has Applications toggle */}
            <div className="mb-6">
              <button
                onClick={() => updateFilter("hasApplications", !apiFilters.hasApplications)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                  apiFilters.hasApplications
                    ? "bg-theme_color text-white border-theme_color shadow-md"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-theme_color/50"
                }`}
              >
                <Users size={16} />
                Has Applications
              </button>
            </div>

            {/* Industry & Skill searchable dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableDropdown
                label="Industry"
                placeholder="Search industries..."
                endpoint={`${BASE_URL}/public/industries/taxonomy`}
                token={token}
                value={apiFilters.industryId}
                onChange={(id) => updateFilter("industryId", id)}
                isTaxonomy
              />
              <SearchableDropdown
                label="Required Skill"
                placeholder="Search skills..."
                endpoint={`${BASE_URL}/admin/skills`}
                token={token}
                value={apiFilters.skillId}
                onChange={(id) => updateFilter("skillId", id)}
              />
            </div>

            <div className="mt-6 pt-4 border-t dark:border-gray-800 flex justify-end gap-4">
              <button
                onClick={() => { resetFilters(); setShowFilters(false); }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-3 bg-theme_color hover:bg-theme_color/90 text-white rounded-xl shadow-md text-sm font-medium"
              >
                Close Filters
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="mb-4 text-gray-600 dark:text-gray-400">
            Showing {filteredJobs.length} of {pagination.totalItems} posted job
            {pagination.totalItems !== 1 ? "s" : ""}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-theme_color" size={48} />
          </div>
        )}

        {/* JOBS LIST / GRID */}
        {!loading && filteredJobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
            <AlertCircle className="mx-auto mb-6 text-amber-500" size={64} />
            <h3 className="text-2xl font-bold mb-3 dark:text-white">
              No jobs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
              {searchQuery || hasActiveFilters
                ? "No jobs match your current search or filters."
                : "You haven't posted any jobs yet."}
            </p>
            <button
              onClick={handleCreateJob}
              className="px-8 py-4 bg-theme_color text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Post Your First Job
            </button>
          </div>
        ) : !loading && layout === "modern-grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobGridCard
                key={job.id}
                job={job}
                onPublish={(j) => { setJobData(j); setOpenPublish(true); }}
                onSuspend={(j) => { setJobData2(j); setShowPublishModal2(true); }}
                onUnsuspend={(j) => { setJobData3(j); setShowPublishModal3(true); }}
                onEdit={handleEditJob}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="space-y-5">
              {filteredJobs.map((job) => (
                <JobListCard
                  key={job.id}
                  job={job}
                  onSuspend={(j) => { setJobData2(j); setShowPublishModal2(true); }}
                  onEdit={handleEditJob}
                />
              ))}
            </div>
          )
        )}

        {/* Pagination */}
        {!loading && filteredJobs.length > 0 && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.limit}
            showingFrom={showingFrom}
            showingTo={showingTo}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {open && (
        <JobPostingModal
          isOpen={open}
          onClose={() => setOpen(false)}
          jobData={editJob}
          setReload={setReload}
        />
      )}
      {openPublish && (
        <PublishJob
          isOpen={openPublish}
          onClose={() => setOpenPublish(false)}
          job={jobData}
          setReload={setReload}
        />
      )}
      {showPublishModal2 && (
        <SuspendJob
          isOpen={showPublishModal2}
          onClose={() => setShowPublishModal2(false)}
          job={jobData2}
          setReload={setReload}
        />
      )}
      {showPublishModal3 && (
        <UnSuspendJob
          isOpen={showPublishModal3}
          onClose={() => setShowPublishModal3(false)}
          job={jobData3}
          setReload={setReload}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// GRID CARD (memoized)
// ────────────────────────────────────────────────
const JobGridCard = React.memo(({ job, onPublish, onSuspend, onUnsuspend, onEdit }) => {
  const statusStyle = getStatusStyle(job.status);
  const StatusIcon = statusStyle.icon;
  const companyLogo = job.company?.name?.substring(0, 2).toUpperCase() || "JB";
  const appCount = job._count?.jobApplications || 0;

  return (
    <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-theme_color/50 transition-all duration-300 flex flex-col">
      <div className="p-4 pb-4 border-b dark:border-gray-800/60">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-theme_color/90 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
              {companyLogo}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-1">
                {job.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1 truncate">
                {job.company?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <span className="flex-1">{job.isRemote ? "Remote" : job.locationName || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-gray-500" />
            {job.employmentType}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
          >
            <StatusIcon size={16} />
            {job.status}
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            <Users size={16} />
            {job.vacancies} {job.vacancies === 1 ? "vacancy" : "vacancies"}
          </div>
          {appCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-theme_color/10 text-theme_color font-medium">
              <Users size={16} />
              {appCount} application{appCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 3).map((jobSkill) => (
              <span
                key={jobSkill.id}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
              >
                {jobSkill.skill?.name}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Posted {getRelativeTime(job.createdAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 pt-2 border-t dark:border-gray-800 flex gap-3 justify-end">
        {job?.status === "DRAFT" && (
          <button
            onClick={() => onPublish(job)}
            className="p-3 rounded-xl text-white bg-theme_color/70 dark:bg-theme_color/70 hover:bg-theme_color dark:hover:bg-theme_color transition-colors"
          >
            Publish
          </button>
        )}
        <a
          href={`/dashboard/job_management/${job?.id}?status=${job?.status}`}
          className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Eye size={18} />
        </a>
        <a
          href={`/dashboard/jobs/${job?.id}/ai-rankings`}
          title="AI Rankings"
          className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
        >
          <Brain size={18} className="text-violet-600 dark:text-violet-400" />
        </a>
        {job?.status === "PUBLISHED" && (
          <button
            onClick={() => onSuspend(job)}
            title="Suspend Job"
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Pause size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}
        {job?.status === "SUSPENDED" && (
          <button
            onClick={() => onUnsuspend(job)}
            title="Unsuspend Job"
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Play size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}
        <button
          onClick={() => onEdit(job)}
          className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Edit size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <button className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors">
          <Trash2 size={20} className="text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
});

// ────────────────────────────────────────────────
// LIST CARD (memoized)
// ────────────────────────────────────────────────
const JobListCard = React.memo(({ job, onSuspend, onEdit }) => {
  const statusStyle = getStatusStyle(job.status);
  const StatusIcon = statusStyle.icon;
  const companyLogo = job.company?.name?.substring(0, 2).toUpperCase() || "JB";
  const appCount = job._count?.jobApplications || 0;

  return (
    <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6 hover:border-theme_color/50 hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
      <div className="flex items-center gap-2 flex-shrink-0 md:w-96">
        <div className="w-16 h-16 rounded-2xl bg-theme_color/90 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
          {companyLogo}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate">
            {job.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 truncate">
            {job.company?.name} • {job.isRemote ? "Remote" : job.locationName || "—"}
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Briefcase size={16} /> {job.employmentType}
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} /> {job.vacancies} vacancies
        </div>
        <div className={`flex items-center gap-2 font-medium ${statusStyle.text}`}>
          <StatusIcon size={16} />
          {job.status}
        </div>
        {appCount > 0 && (
          <div className="flex items-center gap-2 text-theme_color font-medium">
            <Users size={16} /> {appCount} apps
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={`/dashboard/job_management/${job?.id}?status=${job?.status}`}
          className="px-2 py-2.5 bg-theme_color hover:bg-theme_color/90 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Eye size={18} />
          View
        </a>
        <a
          href={`/dashboard/jobs/${job?.id}/ai-rankings`}
          title="AI Rankings"
          className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
        >
          <Brain size={20} className="text-violet-600 dark:text-violet-400" />
        </a>
        {job?.status === "PUBLISHED" && (
          <button
            onClick={() => onSuspend(job)}
            title="Suspend Job"
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Pause size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}
        <button
          onClick={() => onEdit(job)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Edit size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <button className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60">
          <Trash2 size={20} className="text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
});

export default MyPostedJobs;
