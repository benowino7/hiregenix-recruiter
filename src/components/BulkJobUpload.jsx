import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Eye,
  Send,
  ChevronDown,
  ChevronUp,
  Edit2,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import successMessage from "../utilities/successMessage";
import ErrorMessage from "../utilities/ErrorMessage";
import UpgradeModal, { checkUpgradeRequired } from "./UpgradeModal";

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "INTERNSHIP", label: "Internship" },
];

const EXPERIENCE_LEVELS = ["Entry-Level", "Mid-Level", "Senior-Level", "Executive"];

const CSV_HEADERS = [
  "title",
  "description",
  "vacancies",
  "employmentType",
  "experienceLevel",
  "locationName",
  "isRemote",
  "minSalary",
  "maxSalary",
  "currency",
];

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || "";
    });
    if (obj.title) rows.push(obj);
  }
  return rows;
}

function downloadCSVTemplate() {
  const header = CSV_HEADERS.join(",");
  const example = [
    '"Software Engineer"',
    '"We are looking for a skilled software engineer to join our team. Requirements include 3+ years experience with React and Node.js."',
    "2",
    "FULL_TIME",
    "Mid-Level",
    '"Dubai, UAE"',
    "false",
    "8000",
    "15000",
    "AED",
  ].join(",");
  const example2 = [
    '"Marketing Manager"',
    '"Lead our marketing team and develop strategies for brand growth in the MENA region."',
    "1",
    "FULL_TIME",
    "Senior-Level",
    '"Abu Dhabi, UAE"',
    "false",
    "12000",
    "20000",
    "AED",
  ].join(",");
  const csv = [header, example, example2].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk_jobs_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkJobUpload({ subscription }) {
  const token = JSON.parse(sessionStorage?.getItem("accessToken"));
  const fileRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [autoPublish, setAutoPublish] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ open: false, message: "" });

  useEffect(() => {
    fetchSkillsAndIndustries();
  }, []);

  const fetchSkillsAndIndustries = async () => {
    try {
      const [skillsRes, industriesRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/skills`),
        fetch(`${BASE_URL}/public/industries/taxonomy`),
      ]);
      if (skillsRes.ok) {
        const d = await skillsRes.json();
        setSkills(d.data || d || []);
      }
      if (industriesRes.ok) {
        const d = await industriesRes.json();
        if (!d.error && d.result) {
          const items = [];
          for (const group of d.result) {
            for (const ind of group.industries || []) {
              items.push({ id: ind.id, name: ind.name });
            }
          }
          items.sort((a, b) => a.name.localeCompare(b.name));
          setIndustries(items);
        }
      }
    } catch {
      /* ignore */
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        let parsed;
        if (file.name.endsWith(".json")) {
          const json = JSON.parse(text);
          parsed = Array.isArray(json) ? json : json.jobs || [];
        } else {
          parsed = parseCSV(text);
        }
        const mapped = parsed.map((row) => ({
          title: row.title || "",
          description: row.description || "",
          vacancies: Number(row.vacancies) || 1,
          employmentType: row.employmentType || "FULL_TIME",
          experienceLevel: row.experienceLevel || "Mid-Level",
          locationName: row.locationName || "",
          isRemote: row.isRemote === "true" || row.isRemote === true,
          minSalary: row.minSalary ? Number(row.minSalary) : "",
          maxSalary: row.maxSalary ? Number(row.maxSalary) : "",
          currency: row.currency || "AED",
          showSalary: row.showSalary === "true" || row.showSalary === true,
          industries: row.industries || [],
          skills: row.skills || [],
        }));
        setJobs(mapped);
        successMessage(`Loaded ${mapped.length} jobs from file`);
      } catch (err) {
        ErrorMessage("Failed to parse file: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const addEmptyJob = () => {
    setJobs((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        vacancies: 1,
        employmentType: "FULL_TIME",
        experienceLevel: "Mid-Level",
        locationName: "",
        isRemote: false,
        minSalary: "",
        maxSalary: "",
        currency: "AED",
        showSalary: false,
        industries: [],
        skills: [],
      },
    ]);
    setExpandedRow(jobs.length);
  };

  const updateJob = (idx, field, value) => {
    setJobs((prev) => prev.map((j, i) => (i === idx ? { ...j, [field]: value } : j)));
  };

  const removeJob = (idx) => {
    setJobs((prev) => prev.filter((_, i) => i !== idx));
    if (expandedRow === idx) setExpandedRow(null);
    else if (expandedRow > idx) setExpandedRow(expandedRow - 1);
  };

  const toggleIndustry = (idx, indId) => {
    setJobs((prev) =>
      prev.map((j, i) => {
        if (i !== idx) return j;
        const arr = j.industries.includes(indId)
          ? j.industries.filter((x) => x !== indId)
          : [...j.industries, indId];
        return { ...j, industries: arr };
      }),
    );
  };

  const toggleSkill = (idx, skillId) => {
    setJobs((prev) =>
      prev.map((j, i) => {
        if (i !== idx) return j;
        const arr = j.skills.includes(skillId)
          ? j.skills.filter((x) => x !== skillId)
          : [...j.skills, skillId];
        return { ...j, skills: arr };
      }),
    );
  };

  const handleSubmit = async () => {
    if (jobs.length === 0) {
      ErrorMessage("No jobs to upload");
      return;
    }
    const invalid = jobs.filter((j) => !j.title.trim() || !j.description.trim());
    if (invalid.length > 0) {
      ErrorMessage(`${invalid.length} job(s) missing title or description`);
      return;
    }
    setSubmitting(true);
    setResults(null);
    try {
      const payload = jobs.map((j) => ({
        ...j,
        minSalary: j.minSalary || null,
        maxSalary: j.maxSalary || null,
        autoPublish,
      }));
      const res = await fetch(`${BASE_URL}/recruiter/jobs/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobs: payload }),
      });
      const upgrade = await checkUpgradeRequired(res);
      if (upgrade.blocked) {
        setUpgradeModal({ open: true, message: upgrade.message });
        return;
      }
      const data = await res.json();
      if (res.ok && data.status === "SUCCESS") {
        setResults(data.data);
        successMessage(data.message);
      } else {
        ErrorMessage(data.message || "Bulk upload failed");
      }
    } catch (err) {
      ErrorMessage("Network error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Job Upload</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload multiple job postings at once via CSV, JSON, or add them manually.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadCSVTemplate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Download size={16} />
            CSV Template
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-theme_color dark:bg-dark-theme_color rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload File
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload Drop Zone (when no jobs) */}
      {jobs.length === 0 && !results && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-theme_color dark:hover:border-dark-theme_color transition-colors"
        >
          <FileSpreadsheet size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Upload a CSV or JSON file
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Or click "Add Job Manually" below to add jobs one by one
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supports .csv and .json files (max 50 jobs per upload)
          </p>
        </div>
      )}

      {/* Job List */}
      {jobs.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {jobs.length} job(s) ready to upload
            </span>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="w-4 h-4 text-theme_color dark:text-dark-theme_color rounded"
              />
              Auto-publish all jobs
            </label>
          </div>

          {jobs.map((job, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              {/* Summary Row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-theme_color/10 dark:bg-dark-theme_color/10 text-theme_color dark:text-dark-theme_color rounded-full text-sm font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {job.title || "(Untitled Job)"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {EMPLOYMENT_TYPES.find((t) => t.value === job.employmentType)?.label || job.employmentType}{" "}
                    &bull; {job.experienceLevel} &bull; {job.isRemote ? "Remote" : job.locationName || "No location"}{" "}
                    &bull; {job.vacancies} vacancy(ies)
                  </p>
                </div>
                {results?.results?.[idx] && (
                  <span className="flex-shrink-0">
                    {results.results[idx].status === "SUCCESS" ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <XCircle size={18} className="text-red-500" />
                    )}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeJob(idx);
                  }}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 size={16} />
                </button>
                {expandedRow === idx ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>

              {/* Expanded Edit Form */}
              {expandedRow === idx && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50 dark:bg-gray-800/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={job.title}
                        onChange={(e) => updateJob(idx, "title", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent"
                        placeholder="e.g., Software Engineer"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Vacancies
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={job.vacancies}
                          onChange={(e) => updateJob(idx, "vacancies", Number(e.target.value) || 1)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-theme_color"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Type
                        </label>
                        <select
                          value={job.employmentType}
                          onChange={(e) => updateJob(idx, "employmentType", e.target.value)}
                          className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {EMPLOYMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Level
                        </label>
                        <select
                          value={job.experienceLevel}
                          onChange={(e) => updateJob(idx, "experienceLevel", e.target.value)}
                          className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {EXPERIENCE_LEVELS.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={job.description}
                      onChange={(e) => updateJob(idx, "description", e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-theme_color resize-y"
                      placeholder="Job description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={job.locationName}
                        onChange={(e) => updateJob(idx, "locationName", e.target.value)}
                        disabled={job.isRemote}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                        placeholder="e.g., Dubai, UAE"
                      />
                      <label className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={job.isRemote}
                          onChange={(e) => updateJob(idx, "isRemote", e.target.checked)}
                          className="w-3.5 h-3.5 text-theme_color rounded"
                        />
                        Remote position
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Min Salary
                        </label>
                        <input
                          type="number"
                          value={job.minSalary}
                          onChange={(e) => updateJob(idx, "minSalary", e.target.value ? Number(e.target.value) : "")}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Min"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Max Salary
                        </label>
                        <input
                          type="number"
                          value={job.maxSalary}
                          onChange={(e) => updateJob(idx, "maxSalary", e.target.value ? Number(e.target.value) : "")}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Max"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Currency
                        </label>
                        <select
                          value={job.currency}
                          onChange={(e) => updateJob(idx, "currency", e.target.value)}
                          className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="AED">AED</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Industries */}
                  {industries.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Industries ({job.industries.length} selected)
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {industries.map((ind) => (
                          <button
                            key={ind.id}
                            type="button"
                            onClick={() => toggleIndustry(idx, ind.id)}
                            className={`px-2 py-1 text-xs rounded-full border transition ${
                              job.industries.includes(ind.id)
                                ? "bg-theme_color/10 dark:bg-dark-theme_color/10 border-theme_color dark:border-dark-theme_color text-theme_color dark:text-dark-theme_color font-medium"
                                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                            }`}
                          >
                            {ind.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Skills ({job.skills.length} selected)
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {skills.map((sk) => (
                          <button
                            key={sk.id}
                            type="button"
                            onClick={() => toggleSkill(idx, sk.id)}
                            className={`px-2 py-1 text-xs rounded-full border transition ${
                              job.skills.includes(sk.id)
                                ? "bg-theme_color/10 dark:bg-dark-theme_color/10 border-theme_color dark:border-dark-theme_color text-theme_color dark:text-dark-theme_color font-medium"
                                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                            }`}
                          >
                            {sk.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Per-job result */}
                  {results?.results?.[idx] && (
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                        results.results[idx].status === "SUCCESS"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {results.results[idx].status === "SUCCESS" ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      {results.results[idx].status === "SUCCESS"
                        ? `Created as ${results.results[idx].jobStatus}`
                        : results.results[idx].message}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Job + Submit */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={addEmptyJob}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <Plus size={16} />
          Add Job Manually
        </button>
        {jobs.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-theme_color dark:bg-dark-theme_color rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {submitting ? "Uploading..." : `Upload ${jobs.length} Job(s)`}
          </button>
        )}
        {jobs.length > 0 && (
          <button
            onClick={() => {
              setJobs([]);
              setResults(null);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>

      {/* Results Summary */}
      {results && (
        <div className="mt-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Results</h3>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <CheckCircle size={16} /> {results.successCount} succeeded
            </span>
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <XCircle size={16} /> {results.failCount} failed
            </span>
          </div>
          {results.failCount > 0 && (
            <div className="mt-3 space-y-1">
              {results.results
                .filter((r) => r.status !== "SUCCESS")
                .map((r) => (
                  <p key={r.index} className="text-xs text-red-600 dark:text-red-400">
                    Row {r.index + 1} "{r.title}": {r.message}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, message: "" })}
        feature="Bulk Job Upload"
        message={upgradeModal.message}
      />
    </div>
  );
}
