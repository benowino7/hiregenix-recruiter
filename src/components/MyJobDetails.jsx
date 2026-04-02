// src/pages/recruiter/MyJobDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  Building2,
  Globe,
  FileText,
  Mail,
  Phone,
  Loader2,
  Download,
  BarChart3,
  Pause,
  Sparkles,
  RefreshCw,
  ArrowRight,
  History,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import JobPostingModal from "./JobPostingModal";
import PublishJob from "./PublishJob";
import CvPreviewModal from "./CvPreviewModal";
import Pagination2 from "./Pagination2";
import AISuggestedJobSeekers from "./Aisuggestedjobseekers";
import SuspendJob from "./SuspendJob";
import UnSuspendJob from "./UnSuspendJob";

const checkPlatinum = (sub) =>
  sub?.subscription?.plan?.name?.toLowerCase() === "platinum" && sub?.subscription?.status === "ACTIVE";

const MyJobDetails = ({ companyId, subscription }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPublishModal2, setShowPublishModal2] = useState(false);
  const [showPublishModal3, setShowPublishModal3] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reload, setReload] = useState(false);
  const token = JSON.parse(sessionStorage.getItem("accessToken"));
  const [open, setOpen] = useState(false);

  // Applicants state
  const [applications, setApplications] = useState([]);
  const [appPagination, setAppPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [appStatusFilter, setAppStatusFilter] = useState("ALL");
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState(null);
  const [cvPreview, setCvPreview] = useState({
    open: false,
    cvId: null,
    cvFileName: null,
  });
  // ── Subscription check ──────────────────────────────────────────────────────
  const isPlatinum = checkPlatinum(subscription);
  const hasAISuggestions = isPlatinum;

  useEffect(() => {
    if (id && companyId && status) {
      fetchJobDetails();
    }
  }, [id, companyId, status]);

  useEffect(() => {
    if (id) {
      fetchApplications();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch single job directly by ID
      const response = await fetch(
        `${BASE_URL}/public/jobs/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch job details");
      }
      setJob(data.data);
    } catch (err) {
      setError(err.message || "An error occurred while fetching job details");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (overrides = {}) => {
    setApplicantsLoading(true);
    setApplicantsError(null);

    const page = overrides.page ?? appPagination.page;
    const limit = overrides.limit ?? appPagination.limit;
    const statusF = overrides.statusFilter ?? appStatusFilter;

    try {
      const params = new URLSearchParams({ page, limit });
      if (statusF !== "ALL") params.set("status", statusF);

      const response = await fetch(
        `${BASE_URL}/recruiter/jobs/${id}/applications?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch applications");
      }

      setApplications(data?.message?.applications || []);
      if (data?.message?.pagination) {
        setAppPagination(data.message.pagination);
      }
    } catch (err) {
      setApplicantsError(
        err.message || "An error occurred while fetching applications",
      );
    } finally {
      setApplicantsLoading(false);
    }
  };

  const changeAppPage = (p) => {
    setAppPagination((prev) => ({ ...prev, page: p }));
    fetchApplications({ page: p });
  };

  const changeAppLimit = (l) => {
    setAppPagination((prev) => ({ ...prev, limit: l, page: 1 }));
    fetchApplications({ page: 1, limit: l });
  };

  const changeAppStatusFilter = (s) => {
    setAppStatusFilter(s);
    setAppPagination((prev) => ({ ...prev, page: 1 }));
    fetchApplications({ page: 1, statusFilter: s });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job posting?"))
      return;

    const token = JSON.parse(sessionStorage.getItem("accessToken"));

    try {
      const response = await fetch(`${BASE_URL}/recruiter/job/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete job");
      }

      if (data.status === "SUCCESS") {
        navigate("/dashboard/job_management");
      }
    } catch (err) {
      alert(err.message || "Failed to delete job");
    }
  };

  const handleStatusChange = async (newStatus) => {
    const token = JSON.parse(sessionStorage.getItem("accessToken"));

    try {
      const response = await fetch(`${BASE_URL}/recruiter/job/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update job status");
      }

      if (data.status === "SUCCESS") {
        fetchJobDetails();
      }
    } catch (err) {
      alert(err.message || "Failed to update job status");
    }
  };

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
          icon: Pause,
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-700 dark:text-gray-300",
          icon: AlertCircle,
        };
    }
  };

  const getApplicationStatusStyle = (status) => {
    switch (status) {
      case "SUBMITTED":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/40",
          text: "text-blue-700 dark:text-blue-300",
        };
      case "REVIEWING":
        return {
          bg: "bg-amber-100 dark:bg-amber-900/40",
          text: "text-amber-700 dark:text-amber-300",
        };
      case "SHORTLISTED":
        return {
          bg: "bg-violet-100 dark:bg-violet-900/40",
          text: "text-violet-700 dark:text-violet-300",
        };
      case "HIRED":
        return {
          bg: "bg-green-100 dark:bg-green-900/40",
          text: "text-green-700 dark:text-green-300",
        };
      case "REJECTED":
        return {
          bg: "bg-red-100 dark:bg-red-900/40",
          text: "text-red-700 dark:text-red-300",
        };
      case "WITHDRAWN":
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-500 dark:text-gray-400",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-700 dark:text-gray-300",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toDateString() + ", " + date?.toLocaleTimeString();
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const diffDays = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-theme_color" size={48} />
      </div>
    );
  }

  if (error || !job || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
          <h3 className="text-2xl font-bold mb-2 dark:text-white">
            Error Loading Job
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "Job not found"}
          </p>
          <button
            onClick={() => navigate("/dashboard/job_management")}
            className="px-6 py-3 bg-theme_color text-white rounded-xl font-medium hover:bg-theme_color/90 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(job.status);
  const StatusIcon = statusStyle.icon;

  // Build tab list dynamically
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "description", label: "Description" },
    { key: "applicants", label: "Applicants" },
    ...(hasAISuggestions
      ? [{ key: "ai_suggestions", label: "AI Matched", isAI: true }]
      : []),
  ];

  return (
    <div className="w-full pb-8">
      <div className="w-full">
        {/* Header */}
        <div className="pt-4 pb-6">
          <button
            onClick={() => navigate("/dashboard/job_management")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-theme_color dark:hover:text-theme_color transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Jobs
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-theme_color/90 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                  {job.company?.name?.substring(0, 2).toUpperCase() || "JB"}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {job.title}
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {job.company?.name}
                  </p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusStyle.bg} ${statusStyle.text} font-medium`}
                    >
                      <StatusIcon size={16} />
                      {job.status}
                    </span>
                    {/* AI subscription badge */}
                    {hasAISuggestions && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold">
                        <Sparkles size={13} />
                        AI Suggestions Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {job.status === "DRAFT" && (
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="px-5 py-2.5 bg-theme_color hover:bg-theme_color/90 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                  Publish
                </button>
              )}
              {(job.status === "SUSPENDED") && (
                <button
                  onClick={() => setShowPublishModal3(true)}
                  className="px-5 py-2.5 bg-theme_color hover:bg-theme_color/90 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                  Unsuspend
                </button>
              )}
              {job.status === "PUBLISHED" && (
                <button
                  onClick={() => setShowPublishModal2(true)}
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Pause size={18} />
                  SUSPEND
                </button>
              )}
              <button
                onClick={() => navigate(`/dashboard/jobs/${id}/ai-rankings`)}
                className="px-5 py-2.5 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Sparkles size={18} />
                AI Rankings
              </button>
              <button
                onClick={() => setOpen(true)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                // onClick={handleDelete}
                className="px-5 py-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(({ key, label, isAI }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-4 px-4 font-semibold border-b-2 transition-colors capitalize whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === key
                    ? "border-theme_color text-theme_color"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {isAI && (
                  <Sparkles
                    size={14}
                    className={
                      activeTab === key ? "text-theme_color" : "text-violet-400"
                    }
                  />
                )}
                {label}
                {key === "applicants" && appPagination.total > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-theme_color text-white rounded-full">
                    {appPagination.total}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Details */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold dark:text-white mb-4">
                  Job Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <MapPin size={18} />
                      <span className="text-sm font-semibold">Location</span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {job.isRemote
                        ? "Remote"
                        : job.locationName || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Briefcase size={18} />
                      <span className="text-sm font-semibold">
                        Employment Type
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {job.employmentType}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <BarChart3 size={18} />
                      <span className="text-sm font-semibold">
                        Experience Level
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {job.experienceLevel}
                    </p>
                  </div>


                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar size={18} />
                      <span className="text-sm font-semibold">Posted Date</span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatDate(job.createdAt)} (
                      {getRelativeTime(job.createdAt)})
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Clock size={18} />
                      <span className="text-sm font-semibold">
                        Last Updated
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {getRelativeTime(job.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Industries */}
              {job.industries && job.industries.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold dark:text-white mb-4">
                    Industries
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.industries.map((jobIndustry) => (
                      <span
                        key={jobIndustry.industryId}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium"
                      >
                        {jobIndustry.industry.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold dark:text-white mb-4">
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((jobSkill) => (
                      <span
                        key={jobSkill.id}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full font-medium"
                      >
                        {jobSkill.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                  <Building2 size={20} />
                  Company Details
                </h2>
                <div className="space-y-8">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Name
                    </p>
                    <p className="font-medium dark:text-white">
                      {job.company?.name}
                    </p>
                  </div>
                  {job.company?.website && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Globe size={14} />
                        Website
                      </p>
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme_color hover:underline font-medium"
                      >
                        {job.company.website}
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Country
                    </p>
                    <p className="font-medium dark:text-white">
                      {job.company?.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upsell card for non-subscribers */}
              {!hasAISuggestions && (
                <div className="mt-4 p-5 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/40 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-violet-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      AI Candidate Matching
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Upgrade to unlock AI-powered candidate suggestions ranked by
                    skills match and keyword alignment.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard/subscriptions")}
                    className="mt-3 w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Upgrade Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "description" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 max-w-4xl">
            <h2 className="text-2xl font-bold dark:text-white mb-6">
              Job Description
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <div
                className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: job.description || "No description provided.",
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "applicants" && (
          <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-bold dark:text-white">
                Applications
                {!applicantsLoading && (
                  <span className="ml-2 text-base font-normal text-gray-500 dark:text-gray-400">
                    ({appPagination.total})
                  </span>
                )}
              </h2>
              <button
                onClick={() => fetchApplications()}
                disabled={applicantsLoading}
                className="flex items-center gap-1.5 text-sm text-theme_color hover:underline disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={applicantsLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { v: "ALL", l: "All" },
                { v: "SUBMITTED", l: "Submitted" },
                { v: "REVIEWING", l: "Reviewing" },
                { v: "SHORTLISTED", l: "Shortlisted" },
                { v: "HIRED", l: "Hired" },
                { v: "REJECTED", l: "Rejected" },
                { v: "WITHDRAWN", l: "Withdrawn" },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => changeAppStatusFilter(v)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                    appStatusFilter === v
                      ? "bg-theme_color text-white border-theme_color"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-theme_color hover:text-theme_color"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Loading state */}
            {applicantsLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-theme_color" size={36} />
              </div>
            )}

            {/* Error state */}
            {applicantsError && !applicantsLoading && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                <AlertCircle className="mx-auto mb-3 text-red-500" size={40} />
                <p className="text-gray-600 dark:text-gray-400">
                  {applicantsError}
                </p>
                <button
                  onClick={() => fetchApplications()}
                  className="mt-4 px-4 py-2 bg-theme_color text-white rounded-lg text-sm hover:bg-theme_color/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!applicantsLoading &&
              !applicantsError &&
              applications.length === 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
                  <Users className="mx-auto mb-4 text-gray-400" size={64} />
                  <h3 className="text-2xl font-bold mb-2 dark:text-white">
                    {appStatusFilter !== "ALL"
                      ? "No Matching Applications"
                      : "No Applicants Yet"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {appStatusFilter !== "ALL"
                      ? `No applications with status "${appStatusFilter}" found.`
                      : "Applicants who apply for this position will appear here."}
                  </p>
                </div>
              )}

            {/* Applications list */}
            {!applicantsLoading &&
              !applicantsError &&
              applications.length > 0 && (
                <div className="space-y-4">
                  {applications.map((application) => {
                    const appStatusStyle = getApplicationStatusStyle(
                      application.status,
                    );
                    const { firstName, lastName, email, phoneNumber } =
                      application.jobSeeker?.user || {};

                    return (
                      <div
                        key={application.id}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            {/* Applicant Info */}
                            <div className="flex items-start gap-4">
                              {/* Avatar */}
                              <div className="w-12 h-12 rounded-full bg-theme_color/10 dark:bg-theme_color/20 flex items-center justify-center text-theme_color font-bold text-lg flex-shrink-0">
                                {firstName?.charAt(0)?.toUpperCase()}
                                {lastName?.charAt(0)?.toUpperCase()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <h3 className="text-lg font-semibold dark:text-white">
                                    {firstName} {lastName}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${appStatusStyle.bg} ${appStatusStyle.text}`}
                                  >
                                    {application.status}
                                  </span>
                                </div>

                                {/* Contact */}
                                <div className="flex flex-wrap gap-4 mt-2">
                                  {email && (
                                    <a
                                      href={`mailto:${email}`}
                                      className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-theme_color dark:hover:text-theme_color transition-colors"
                                    >
                                      <Mail size={14} />
                                      {email}
                                    </a>
                                  )}
                                  {phoneNumber && (
                                    <a
                                      href={`tel:${phoneNumber}`}
                                      className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-theme_color dark:hover:text-theme_color transition-colors"
                                    >
                                      <Phone size={14} />
                                      {phoneNumber}
                                    </a>
                                  )}
                                </div>

                                {/* Applied at */}
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                  Applied{" "}
                                  {getRelativeTime(application.createdAt)} ·{" "}
                                  {formatDate(application.createdAt)}
                                </p>

                                {/* Cover Letter */}
                                {application.coverLetter && (
                                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                                      Cover Letter
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                      {application.coverLetter}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* CV / Actions */}
                            {application.cv && (
                              <div className="flex-shrink-0">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl min-w-[180px]">
                                  <div className="w-9 h-9 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText
                                      size={18}
                                      className="text-red-600 dark:text-red-400"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-sm font-medium dark:text-white truncate max-w-[140px]"
                                      title={application.cv.fileName}
                                    >
                                      {application.cv.fileName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {formatFileSize(application.cv.fileSize)}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setCvPreview({
                                        open: true,
                                        cvId: application.id,
                                        cvFileName: application.cv.fileName,
                                      })
                                    }
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-theme_color dark:hover:text-theme_color"
                                    title="CV Preview"
                                  >
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status History Timeline */}
                        {application.statusLogs?.length > 0 && (
                          <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 bg-gray-50/60 dark:bg-gray-800/30">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <History size={11} />
                              Status History
                            </p>
                            <div className="flex flex-wrap gap-2 items-center">
                              {[...application.statusLogs]
                                .reverse()
                                .map((log, idx, arr) => {
                                  const toStyle = getApplicationStatusStyle(
                                    log.toStatus,
                                  );
                                  return (
                                    <React.Fragment key={log.id}>
                                      <div className="flex flex-col items-start gap-0.5">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${toStyle.bg} ${toStyle.text}`}
                                        >
                                          {log.toStatus}
                                        </span>
                                        <span className="text-[9px] text-gray-400 dark:text-gray-600 pl-1">
                                          {getRelativeTime(log.createdAt)}
                                        </span>
                                      </div>
                                      {idx < arr.length - 1 && (
                                        <ArrowRight
                                          size={12}
                                          className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-[-6px]"
                                        />
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                            </div>
                            {/* Last action by */}
                            {application.statusLogs[0] && (
                              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2">
                                Last updated by{" "}
                                <span className="font-semibold text-gray-500 dark:text-gray-500">
                                  {
                                    application.statusLogs[0].changedByUser
                                      ?.firstName
                                  }{" "}
                                  {
                                    application.statusLogs[0].changedByUser
                                      ?.lastName
                                  }
                                </span>
                                {application.statusLogs[0].note && (
                                  <> · "{application.statusLogs[0].note}"</>
                                )}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Pagination */}
            {!applicantsLoading &&
              !applicantsError &&
              appPagination.total > 1 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4">
                  <Pagination2
                    currentPage={appPagination.page}
                    totalPages={appPagination.totalPages}
                    total={appPagination.total}
                    limit={appPagination.limit}
                    onPageChange={changeAppPage}
                    onLimitChange={changeAppLimit}
                    limitOptions={[10, 20, 50]}
                  />
                </div>
              )}
          </div>
        )}

        {/* ── AI Suggestions Tab ── */}
        {activeTab === "ai_suggestions" && hasAISuggestions && (
          <AISuggestedJobSeekers jobId={id} />
        )}
      </div>

      {open && (
        <JobPostingModal
          isOpen={open}
          onClose={() => setOpen(false)}
          jobData={job}
          setReload={setReload}
        />
      )}
      {showPublishModal && (
        <PublishJob
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          job={job}
          setReload={setReload}
        />
      )}
      {showPublishModal2 && (
        <SuspendJob
          isOpen={showPublishModal2}
          onClose={() => setShowPublishModal2(false)}
          job={job}
          setReload={setReload}
        />
      )}
      {showPublishModal3 && (
        <UnSuspendJob
          isOpen={showPublishModal3}
          onClose={() => setShowPublishModal3(false)}
          job={job}
          setReload={setReload}
        />
      )}
      {cvPreview?.open && (
        <CvPreviewModal
          isOpen={cvPreview.open}
          onClose={() =>
            setCvPreview({ open: false, cvId: null, cvFileName: null })
          }
          cvId={cvPreview.cvId}
          cvFileName={cvPreview.cvFileName}
        />
      )}
    </div>
  );
};

export default MyJobDetails;
