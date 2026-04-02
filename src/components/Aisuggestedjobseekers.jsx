// src/pages/recruiter/AISuggestedJobSeekers.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Users,
  FileText,
  Mail,
  Phone,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Star,
  Zap,
  Target,
  Brain,
  RefreshCw,
  BadgeCheck,
  Hash,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import CvPreviewModal from "./CvPreviewModal";

// ─── Auth ─────────────────────────────────────────────────────────────────────

const getToken = () => {
  try {
    return JSON.parse(sessionStorage.getItem("accessToken") || "{}");
  } catch {
    return "";
  }
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (first, last) =>
  `${(first || "?")[0]}${(last || "?")[0]}`.toUpperCase();

const avatarColor = (str) => {
  const colors = [
    "from-violet-500 to-indigo-600",
    "from-teal-400 to-rose-500",
    "from-teal-400 to-cyan-600",
    "from-amber-400 to-teal-500",
    "from-green-400 to-emerald-600",
    "from-pink-400 to-fuchsia-600",
  ];
  let h = 0;
  for (let i = 0; i < (str || "").length; i++)
    h = str.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const formatBytes = (b) => {
  if (!b) return "";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso) =>
  iso
    ? new Date(iso).toDateString() + ", " + new Date(iso).toLocaleTimeString()
    : "—";

// ─── Score Ring ───────────────────────────────────────────────────────────────

const ScoreRing = ({ score }) => {
  const clamped = Math.min(100, Math.max(0, score));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const filled = (clamped / 100) * circumference;
  const color =
    clamped >= 70 ? "#22c55e" : clamped >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-14 h-14 flex-shrink-0">
      <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>
        {clamped}%
      </span>
    </div>
  );
};

// ─── Proficiency badge ────────────────────────────────────────────────────────

const PROFICIENCY_CFG = {
  EXPERT: {
    label: "Expert",
    cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  ADVANCED: {
    label: "Advanced",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  BEGINNER: {
    label: "Beginner",
    cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
};

const ProficiencyBadge = ({ proficiency }) => {
  const cfg = PROFICIENCY_CFG[proficiency] || {
    label: proficiency,
    cls: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
}) => {
  const from = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);

  const pages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (currentPage >= totalPages - 3)
      return [
        1,
        "…",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "…",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "…",
      totalPages,
    ];
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      {/* Range + per-page */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Showing{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {from}–{to}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {total}
          </span>
        </span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <div className="flex items-center gap-1.5">
          <span>Per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium outline-none focus:border-theme_color"
          >
            {limitOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:border-theme_color hover:text-theme_color transition-colors"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:border-theme_color hover:text-theme_color transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {pages().map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-1 text-gray-400 text-xs select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[30px] h-[30px] rounded-lg text-xs font-semibold border transition-colors ${
                p === currentPage
                  ? "bg-theme_color border-theme_color text-white"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-theme_color hover:text-theme_color"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:border-theme_color hover:text-theme_color transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:border-theme_color hover:text-theme_color transition-colors"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── Candidate Card ───────────────────────────────────────────────────────────

const CandidateCard = ({ item, jobSkills, onPreviewCv, index }) => {
  const { jobSeeker, recommendation } = item;
  const { user, skills, cvUsed } = jobSeeker;
  const [expanded, setExpanded] = useState(false);

  const matchedSet = new Set(
    (recommendation?.matchedSkills || []).map((s) => s.toLowerCase()),
  );

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
      style={{
        animation: "fadeUp 0.3s ease both",
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Top bar */}
      <div className="px-5 py-4 flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-full bg-theme_color/20  ${avatarColor(user.firstName + user.lastName)} flex items-center justify-center text-theme_color font-bold text-sm flex-shrink-0`}
        >
          {initials(user.firstName, user.lastName)}
        </div>

        {/* Name + contact */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h3>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
            <a
              href={`mailto:${user.email}`}
              className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-theme_color transition-colors"
            >
              <Mail className="w-3 h-3" />
              {user.email}
            </a>
            {user.phoneNumber && (
              <a
                href={`tel:${user.countryCode}${user.phoneNumber}`}
                className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-theme_color transition-colors"
              >
                <Phone className="w-3 h-3" />
                {user.countryCode} {user.phoneNumber}
              </a>
            )}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
            Joined {formatDate(jobSeeker.createdAt)}
          </p>
        </div>

        {/* Score ring */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <ScoreRing
            score={
              jobSkills?.length > 0
                ? Math.round(
                    (recommendation?.matchedSkills?.length / jobSkills.length) * 100,
                  )
                : 0
            }
          />
          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Match
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 pb-3 flex flex-wrap gap-4">
        {/* Matched skills */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-green-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
              Matched Skills
            </p>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
              {recommendation?.matchedSkills?.length ?? 0}
            </p>
          </div>
        </div>

        {/* Keyword hits */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Hash className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
              Keyword Hits
            </p>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
              {recommendation?.keywordHits ?? 0}
            </p>
          </div>
        </div>

        {/* Skills count */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-violet-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
              Total Skills
            </p>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
              {skills?.length ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Matched skill pills */}
      {recommendation?.matchedSkills?.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {recommendation.matchedSkills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-[10px] font-semibold border border-green-200 dark:border-green-800"
            >
              <BadgeCheck className="w-2.5 h-2.5" />
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Divider + expand */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-theme_color hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
        >
          <span>
            {expanded ? "Hide" : "Show"} all skills ({skills?.length ?? 0})
          </span>
          <span
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        {expanded && (
          <div className="px-5 pb-4 flex flex-wrap gap-1.5">
            {skills?.map((s) => {
              const isMatch = matchedSet.has(s.skill.name.toLowerCase());
              return (
                <span
                  key={s.id}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${
                    isMatch
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {isMatch && <BadgeCheck className="w-3 h-3" />}
                  {s.skill.name}
                  <ProficiencyBadge proficiency={s.proficiency} />
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* CV row */}
      {cvUsed && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3 flex items-center gap-3">
          <div className="w-7 h-7 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
              {cvUsed.fileName}
            </p>
            <p className="text-[10px] text-gray-400">
              Uploaded {formatDate(cvUsed.createdAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AISuggestedJobSeekers = ({ jobId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [cvPreview, setCvPreview] = useState({
    open: false,
    cvId: jobId,
    cvFileName: null,
  });

  const fetchSuggestions = useCallback(
    async (p = page, l = limit) => {
      if (!jobId) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: p, limit: l });
        const res = await fetch(
          `${BASE_URL}/recruiter/jobs/${jobId}/suggested-job-seekers?${params}`,
          { headers: authHeaders() },
        );
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message || "Failed to load suggestions");
        }
        const json = await res.json();
        setData(json.message);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [jobId],
  );

  useEffect(() => {
    fetchSuggestions(1, limit);
    setPage(1);
  }, [jobId]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchSuggestions(p, limit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (l) => {
    setLimit(l);
    setPage(1);
    fetchSuggestions(1, l);
  };

  const pagination = data?.pagination;
  const jobSkills = data?.jobSkills || [];
  const jobSeekers = data?.jobSeekers || [];
  const meta = data?.meta;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Matched Candidates
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Candidates ranked by AI based on skills and keyword alignment with
              this job.
            </p>
          </div>
          <button
            onClick={() => fetchSuggestions(page, limit)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-theme_color dark:bg-dark-theme_color text-white rounded-md disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Job skills used */}
        {data?.jobSkills?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap p-3 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/40 rounded-xl">
            <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest flex-shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Job Skills
            </span>
            {data.jobSkills.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-[11px] font-semibold"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Meta info */}
        {meta && !loading && (
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {pagination?.total ?? meta.returned}
              </span>{" "}
              candidates found
            </span>
            {meta.keywordsUsed?.length > 0 && (
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {meta.keywordsUsed.length}
                </span>{" "}
                keywords analysed
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-2xl bg-violet-100 dark:bg-violet-900/30 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-violet-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                AI is matching candidates…
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Analysing skills and keywords
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 flex-1">
              {error}
            </p>
            <button
              onClick={() => fetchSuggestions(page, limit)}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && jobSeekers.length === 0 && data && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-violet-300 dark:text-violet-700" />
            </div>
            <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
              No Matches Found
            </p>
            <p className="text-xs text-gray-400 max-w-xs">
              No candidates matched this job's skills and requirements yet. Try
              again later as more job seekers register.
            </p>
          </div>
        )}

        {/* Candidate cards */}
        {!loading && !error && jobSeekers.length > 0 && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {jobSeekers.map((item, i) => (
                <CandidateCard
                  key={item.jobSeeker.id}
                  item={item}
                  jobSkills={data?.jobSkills || []}
                  index={i}
                  onPreviewCv={(jobId, cvFileName) =>
                    setCvPreview({ open: true, cvId: jobId, cvFileName })
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-5 py-3.5">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  limitOptions={[10, 20, 50]}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AISuggestedJobSeekers;
