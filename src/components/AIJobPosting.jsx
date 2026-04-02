import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Edit3,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Lock,
  X,
  Plus,
  Eye,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import UpgradeModal from "./UpgradeModal";

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

const checkPlatinum = (sub) =>
  sub?.subscription?.plan?.name?.toLowerCase() === "platinum" &&
  sub?.subscription?.status === "ACTIVE";

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
];

const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior", "Lead", "Executive"];

const formatSalary = (min, max, currency) => {
  if (!min && !max) return null;
  const fmt = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;
  const c = currency || "USD";
  if (min && max) return `${c} ${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${c} ${fmt(min)}`;
  return `Up to ${c} ${fmt(max)}`;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AIJobPosting({ subscription }) {
  const isPlatinum = checkPlatinum(subscription);
  const fileInputRef = useRef(null);

  // Upload & parse state
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedJobs, setParsedJobs] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);

  // Publishing state
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState(null);

  // Edit modal
  const [editingIndex, setEditingIndex] = useState(null);

  // Selection for batch publish
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  // Expanded cards
  const [expandedIndexes, setExpandedIndexes] = useState([]);

  // Upgrade modal
  const [upgradeModal, setUpgradeModal] = useState({ open: false, message: "" });

  // ── File handling ──

  const handleFiles = useCallback(
    async (files) => {
      if (!isPlatinum) {
        setUpgradeModal({
          open: true,
          message: "Upgrade to Platinum to use AI Job Posting.",
        });
        return;
      }

      const validFiles = Array.from(files).filter((f) =>
        f.name.match(/\.(pdf|docx)$/i)
      );
      if (validFiles.length === 0) {
        setParseErrors([{ fileName: "Selection", error: "No valid PDF or DOCX files selected." }]);
        return;
      }

      setParsing(true);
      setParseErrors([]);
      setPublishResults(null);

      const formData = new FormData();
      validFiles.forEach((f) => formData.append("files", f));

      try {
        const res = await fetch(`${BASE_URL}/recruiter/ai-jobs/parse`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });

        if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          if (data.result?.requiresUpgrade || data.requiresUpgrade) {
            setUpgradeModal({ open: true, message: data.message || "" });
            setParsing(false);
            return;
          }
        }

        if (!res.ok) throw new Error("Failed to parse files");

        const json = await res.json();
        const data = json.message || json;

        setParsedJobs((prev) => [...prev, ...(data.parsed || [])]);
        setParseErrors((prev) => [...prev, ...(data.errors || [])]);

        // Auto-select all new jobs
        const newStart = parsedJobs.length;
        const newIndexes = (data.parsed || []).map((_, i) => newStart + i);
        setSelectedIndexes((prev) => [...prev, ...newIndexes]);

        // Auto-expand new jobs
        setExpandedIndexes((prev) => [...prev, ...newIndexes]);
      } catch (e) {
        setParseErrors((prev) => [...prev, { fileName: "Upload", error: e.message }]);
      } finally {
        setParsing(false);
      }
    },
    [isPlatinum, parsedJobs.length]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onFileInput = useCallback(
    (e) => {
      if (e.target.files) handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  // ── Selection ──

  const toggleSelect = (idx) =>
    setSelectedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );

  const toggleSelectAll = () => {
    if (selectedIndexes.length === parsedJobs.length) {
      setSelectedIndexes([]);
    } else {
      setSelectedIndexes(parsedJobs.map((_, i) => i));
    }
  };

  const toggleExpand = (idx) =>
    setExpandedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );

  // ── Edit job field ──

  const updateJobField = (idx, field, value) => {
    setParsedJobs((prev) =>
      prev.map((job, i) =>
        i === idx
          ? { ...job, parsed: { ...job.parsed, [field]: value } }
          : job
      )
    );
  };

  const removeSkill = (jobIdx, skillIdx) => {
    setParsedJobs((prev) =>
      prev.map((job, i) =>
        i === jobIdx
          ? {
              ...job,
              matchedSkills: job.matchedSkills.filter((_, si) => si !== skillIdx),
            }
          : job
      )
    );
  };

  const removeIndustry = (jobIdx, indIdx) => {
    setParsedJobs((prev) =>
      prev.map((job, i) =>
        i === jobIdx
          ? {
              ...job,
              matchedIndustries: job.matchedIndustries.filter(
                (_, ii) => ii !== indIdx
              ),
            }
          : job
      )
    );
  };

  const removeJob = (idx) => {
    setParsedJobs((prev) => prev.filter((_, i) => i !== idx));
    setSelectedIndexes((prev) =>
      prev
        .filter((i) => i !== idx)
        .map((i) => (i > idx ? i - 1 : i))
    );
    setExpandedIndexes((prev) =>
      prev
        .filter((i) => i !== idx)
        .map((i) => (i > idx ? i - 1 : i))
    );
  };

  // ── Publish selected jobs ──

  const publishSelected = async (publishImmediately = false) => {
    if (selectedIndexes.length === 0) return;

    setPublishing(true);
    setPublishResults(null);

    const jobsToPublish = selectedIndexes.map((idx) => {
      const job = parsedJobs[idx];
      return {
        title: job.parsed.title,
        description: job.parsed.description,
        employmentType: job.parsed.employmentType,
        experienceLevel: job.parsed.experienceLevel,
        isRemote: job.parsed.isRemote,
        locationName: job.parsed.locationName,
        minSalary: job.parsed.minSalary,
        maxSalary: job.parsed.maxSalary,
        currency: job.parsed.currency,
        vacancies: job.parsed.vacancies,
        skills: job.matchedSkills.map((s) => s.id),
        industries: job.matchedIndustries.map((i) => i.id),
      };
    });

    try {
      const res = await fetch(`${BASE_URL}/recruiter/ai-jobs/publish`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ jobs: jobsToPublish, publishImmediately }),
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        if (data.result?.requiresUpgrade || data.requiresUpgrade) {
          setUpgradeModal({ open: true, message: data.message || "" });
          setPublishing(false);
          return;
        }
      }

      if (!res.ok) throw new Error("Failed to publish");

      const json = await res.json();
      const data = json.message || json;
      setPublishResults(data);

      // Remove successfully published jobs
      if (data.successCount > 0) {
        const successTitles = new Set(
          (data.created || []).map((j) => j.title)
        );
        setParsedJobs((prev) =>
          prev.filter(
            (job, idx) =>
              !selectedIndexes.includes(idx) ||
              !successTitles.has(job.parsed.title)
          )
        );
        setSelectedIndexes([]);
        setExpandedIndexes([]);
      }
    } catch (e) {
      setPublishResults({ error: e.message });
    } finally {
      setPublishing(false);
    }
  };

  // ── Platinum gate ──

  if (!isPlatinum) {
    return (
      <>
        <div className="w-full md:px-4 lg:px-14 py-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-violet-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              AI Job Posting
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Upload job description PDFs or DOCX files and let AI extract, match,
              and pre-fill your job postings automatically. Available exclusively
              for Platinum subscribers.
            </p>
            <button
              onClick={() =>
                setUpgradeModal({
                  open: true,
                  message: "Upgrade to Platinum to access AI Job Posting.",
                })
              }
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25"
            >
              Upgrade to Platinum
            </button>
          </div>
        </div>
        <UpgradeModal
          open={upgradeModal.open}
          onClose={() => setUpgradeModal({ open: false, message: "" })}
          feature="AI Job Posting"
          message={upgradeModal.message}
        />
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="w-full md:px-4 lg:px-14 py-4 space-y-5">
        {/* Header */}
        <div
          className="flex items-end justify-between flex-wrap gap-4"
          style={{ animation: "fadeUp 0.3s ease both" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Job Posting
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload job descriptions (PDF/DOCX) and AI will extract &
              pre-fill your job postings.
            </p>
          </div>

          {parsedJobs.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {selectedIndexes.length} of {parsedJobs.length} selected
              </span>
              <button
                onClick={() => publishSelected(false)}
                disabled={publishing || selectedIndexes.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                Save as Draft
              </button>
              <button
                onClick={() => publishSelected(true)}
                disabled={publishing || selectedIndexes.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-theme_color hover:bg-theme_color/90 rounded-xl transition-all disabled:opacity-50 shadow-sm"
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Publish Selected
              </button>
            </div>
          )}
        </div>

        {/* Upload zone */}
        <div
          className={`bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            dragOver
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/10"
              : "border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ animation: "fadeUp 0.35s ease both", animationDelay: "60ms" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={onFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            {parsing ? (
              <>
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-3" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Analyzing job descriptions with AI...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Extracting titles, skills, requirements, and more
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-violet-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Drop job description files here or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PDF and DOCX — upload up to 20 files at once
                </p>
              </>
            )}
          </div>
        </div>

        {/* Parse errors */}
        {parseErrors.length > 0 && (
          <div className="space-y-2">
            {parseErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-red-700 dark:text-red-300">
                    {err.fileName}
                  </span>
                  <span className="text-xs text-red-600 dark:text-red-400 ml-2">
                    {err.error}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setParseErrors((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Publish results */}
        {publishResults && (
          <div
            className={`px-4 py-3 rounded-xl border ${
              publishResults.error
                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            }`}
          >
            {publishResults.error ? (
              <p className="text-sm text-red-700 dark:text-red-300">
                {publishResults.error}
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Successfully created {publishResults.successCount} job
                  {publishResults.successCount !== 1 ? "s" : ""}.
                  {publishResults.errorCount > 0 &&
                    ` ${publishResults.errorCount} failed.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Select all bar */}
        {parsedJobs.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  selectedIndexes.length === parsedJobs.length &&
                  parsedJobs.length > 0
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-theme_color focus:ring-theme_color"
              />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Select all ({parsedJobs.length})
              </span>
            </label>
            <button
              onClick={() => {
                setParsedJobs([]);
                setSelectedIndexes([]);
                setExpandedIndexes([]);
                setParseErrors([]);
                setPublishResults(null);
              }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Parsed job cards */}
        <div className="space-y-3">
          {parsedJobs.map((job, idx) => {
            const isSelected = selectedIndexes.includes(idx);
            const isExpanded = expandedIndexes.includes(idx);
            const isEditing = editingIndex === idx;
            const p = job.parsed;
            const salary = formatSalary(p.minSalary, p.maxSalary, p.currency);

            return (
              <div
                key={idx}
                className={`bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden transition-all ${
                  isSelected
                    ? "border-theme_color/50 shadow-sm"
                    : "border-gray-100 dark:border-gray-800"
                }`}
                style={{
                  animation: "fadeUp 0.3s ease both",
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                {/* Card header */}
                <div className="px-5 py-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(idx)}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-theme_color focus:ring-theme_color flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {p.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                        {p.employmentType?.replace("_", " ")}
                      </span>
                      {p.isRemote && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          Remote
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      {p.locationName && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {p.locationName}
                        </span>
                      )}
                      {p.experienceLevel && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {p.experienceLevel}
                        </span>
                      )}
                      <span className="text-xs text-gray-300 dark:text-gray-600">
                        from {job.fileName}
                      </span>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.matchedSkills.slice(0, isExpanded ? 50 : 6).map((s, si) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                        >
                          {s.name}
                          {isExpanded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSkill(idx, si);
                              }}
                              className="hover:text-red-500"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </span>
                      ))}
                      {!isExpanded && job.matchedSkills.length > 6 && (
                        <span className="text-[10px] text-gray-400 self-center">
                          +{job.matchedSkills.length - 6} more
                        </span>
                      )}
                    </div>

                    {/* Industries pills */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {job.matchedIndustries.map((ind, ii) => (
                        <span
                          key={ind.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800"
                        >
                          {ind.name}
                          {isExpanded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeIndustry(idx, ii);
                              }}
                              className="hover:text-red-500"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeJob(idx)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded edit area */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) =>
                          updateJobField(idx, "title", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-theme_color"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Employment Type */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Employment Type
                        </label>
                        <select
                          value={p.employmentType}
                          onChange={(e) =>
                            updateJobField(idx, "employmentType", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-theme_color"
                        >
                          {EMPLOYMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Experience Level */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Experience Level
                        </label>
                        <select
                          value={p.experienceLevel || ""}
                          onChange={(e) =>
                            updateJobField(
                              idx,
                              "experienceLevel",
                              e.target.value || null
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-theme_color"
                        >
                          <option value="">Not specified</option>
                          {EXPERIENCE_LEVELS.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Vacancies */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Vacancies
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={p.vacancies}
                          onChange={(e) =>
                            updateJobField(
                              idx,
                              "vacancies",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-theme_color"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          <input
                            type="checkbox"
                            checked={p.isRemote}
                            onChange={(e) =>
                              updateJobField(idx, "isRemote", e.target.checked)
                            }
                            className="w-3.5 h-3.5 rounded border-gray-300 text-theme_color focus:ring-theme_color"
                          />
                          Remote
                        </label>
                        {!p.isRemote && (
                          <input
                            type="text"
                            value={p.locationName || ""}
                            onChange={(e) =>
                              updateJobField(idx, "locationName", e.target.value)
                            }
                            placeholder="City, Country"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-theme_color"
                          />
                        )}
                      </div>

                      {/* Salary */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Salary Range (Annual)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={p.minSalary || ""}
                            onChange={(e) =>
                              updateJobField(
                                idx,
                                "minSalary",
                                parseInt(e.target.value) || null
                              )
                            }
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-theme_color"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={p.maxSalary || ""}
                            onChange={(e) =>
                              updateJobField(
                                idx,
                                "maxSalary",
                                parseInt(e.target.value) || null
                              )
                            }
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-theme_color"
                          />
                          <input
                            type="text"
                            placeholder="USD"
                            value={p.currency || ""}
                            onChange={(e) =>
                              updateJobField(idx, "currency", e.target.value)
                            }
                            className="w-20 flex-shrink-0 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-theme_color"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Job Description
                      </label>
                      <textarea
                        value={p.description}
                        onChange={(e) =>
                          updateJobField(idx, "description", e.target.value)
                        }
                        rows={8}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-theme_color resize-y"
                      />
                    </div>

                    {/* Validation warnings */}
                    {job.matchedSkills.length === 0 && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        No matched skills — at least 1 skill is required to publish.
                      </div>
                    )}
                    {job.matchedIndustries.length === 0 && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        No matched industries — at least 1 industry is required to publish.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {parsedJobs.length === 0 && !parsing && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No jobs parsed yet. Upload job description files to get started.
            </p>
          </div>
        )}
      </div>

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, message: "" })}
        feature="AI Job Posting"
        message={
          upgradeModal.message ||
          "Upgrade to the Platinum plan to use AI-powered job posting."
        }
      />
    </>
  );
}
