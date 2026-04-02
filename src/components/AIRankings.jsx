// src/components/AIRankings.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  Trophy,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
  Brain,
  Sparkles,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  MessageSquare,
  Zap,
  Filter,
  ToggleLeft,
  ToggleRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  Hash,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import UpgradeModal, { checkUpgradeRequired } from "./UpgradeModal";

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

// ─── Tier Config ──────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  Excellent: {
    color: "text-green-700 dark:text-green-300",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    ring: "ring-green-500",
    barColor: "#22c55e",
  },
  Strong: {
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    ring: "ring-blue-500",
    barColor: "#3b82f6",
  },
  Moderate: {
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    ring: "ring-amber-500",
    barColor: "#f59e0b",
  },
  Weak: {
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    ring: "ring-red-500",
    barColor: "#ef4444",
  },
};

const capitalizeTier = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : "Moderate";

const getTierConfig = (tier) =>
  TIER_CONFIG[capitalizeTier(tier)] || TIER_CONFIG["Moderate"];

// ─── Score Bar ────────────────────────────────────────────────────────────────

const ScoreBar = ({ score, tier }) => {
  const cfg = getTierConfig(tier);
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(score, 100)}%`,
            backgroundColor: cfg.barColor,
          }}
        />
      </div>
      <span
        className="text-sm font-bold tabular-nums min-w-[3rem] text-right"
        style={{ color: cfg.barColor }}
      >
        {score}%
      </span>
    </div>
  );
};

// ─── Tier Badge ───────────────────────────────────────────────────────────────

const TierBadge = ({ tier: rawTier }) => {
  const tier = capitalizeTier(rawTier);
  const cfg = getTierConfig(tier);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
    >
      {tier === "Excellent" && <Trophy className="w-3.5 h-3.5" />}
      {tier === "Strong" && <Star className="w-3.5 h-3.5" />}
      {tier === "Moderate" && <Target className="w-3.5 h-3.5" />}
      {tier === "Weak" && <AlertTriangle className="w-3.5 h-3.5" />}
      {tier}
    </span>
  );
};

// ─── Candidate Card ───────────────────────────────────────────────────────────

const CandidateRankingCard = ({ candidate, rank, index }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    candidateName,
    candidateEmail,
    overallScore,
    tier,
    hireRecommendation,
    skillMatch,
    plagiarismDetected,
    cheatingDetected,
    redFlags,
    greenFlags,
    skillGapAnalysis,
    interviewTalkingPoints,
    recruiterSummary,
  } = candidate;

  // candidate prop is a ranking item; nested .candidate has name/email
  const nested = candidate.candidate || {};
  const name = candidateName || nested.name || candidate.name || "Unknown Candidate";
  const email = candidateEmail || nested.email || candidate.email || "";
  const score = overallScore ?? candidate.scores?.overall ?? candidate.score ?? 0;
  const candidateTier = capitalizeTier(tier || candidate.tier || "Moderate");
  const recommendation = hireRecommendation ?? candidate.recommendation ?? candidate.hireRecommendation;
  const matched = skillMatch?.matched ?? candidate.skillGap?.matchedCount ?? candidate.matchedSkills ?? 0;
  const missing = skillMatch?.missing ?? candidate.skillGap?.missingCount ?? candidate.missingSkills ?? 0;
  const hasPlagiarism = plagiarismDetected || cheatingDetected || (candidate.plagiarism?.flags?.length > 0) || false;
  const redFlagsList = redFlags || candidate.redFlags || [];
  const greenFlagsList = greenFlags || candidate.greenFlags || [];
  const skillGap = skillGapAnalysis || candidate.skillGapAnalysis || candidate.skillGap || {};
  const talkingPoints = interviewTalkingPoints || candidate.interviewTalkingPoints || [];
  const summary = recruiterSummary || candidate.recruiterSummary || "";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const tierCfg = getTierConfig(candidateTier);

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300`}
      style={{
        animation: "fadeUp 0.35s ease both",
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                rank <= 3
                  ? "bg-teal-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              #{rank}
            </div>
          </div>

          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-theme_color/20 flex items-center justify-center text-theme_color font-bold text-sm flex-shrink-0">
            {initials}
          </div>

          {/* Name + info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {name}
              </h3>
              <TierBadge tier={candidateTier} />
              {hasPlagiarism && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold border border-red-200 dark:border-red-800">
                  <ShieldAlert className="w-3 h-3" />
                  Integrity Warning
                </span>
              )}
            </div>
            {email && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {email}
              </p>
            )}

            {/* Score bar */}
            <div className="mt-3">
              <ScoreBar score={score} tier={candidateTier} />
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-3">
              {/* Hire recommendation */}
              {recommendation !== undefined && recommendation !== null && (
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      recommendation === true ||
                      recommendation === "Yes" ||
                      recommendation === "HIRE"
                        ? "bg-green-50 dark:bg-green-900/20"
                        : recommendation === false ||
                          recommendation === "No" ||
                          recommendation === "REJECT"
                        ? "bg-red-50 dark:bg-red-900/20"
                        : "bg-amber-50 dark:bg-amber-900/20"
                    }`}
                  >
                    {recommendation === true ||
                    recommendation === "Yes" ||
                    recommendation === "HIRE" ? (
                      <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                    ) : recommendation === false ||
                      recommendation === "No" ||
                      recommendation === "REJECT" ? (
                      <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Target className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {typeof recommendation === "boolean"
                      ? recommendation
                        ? "Recommend Hire"
                        : "Not Recommended"
                      : recommendation}
                  </span>
                </div>
              )}

              {/* Skill match */}
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {matched}
                  </span>
                  <span className="text-[10px] text-gray-400"> matched</span>
                </div>
              </div>

              {missing > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {missing}
                    </span>
                    <span className="text-[10px] text-gray-400"> missing</span>
                  </div>
                </div>
              )}

              {/* Red flags */}
              {redFlagsList.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <Flag className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                      {redFlagsList.length}
                    </span>
                    <span className="text-[10px] text-gray-400"> red flag{redFlagsList.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              )}

              {/* Green flags */}
              {greenFlagsList.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                      {greenFlagsList.length}
                    </span>
                    <span className="text-[10px] text-gray-400"> green flag{greenFlagsList.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-theme_color hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
        >
          <span>{expanded ? "Hide Details" : "View Full Analysis"}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Expanded detail section */}
        {expanded && (
          <div className="px-5 pb-5 space-y-5 border-t border-gray-100 dark:border-gray-800 pt-4">
            {/* Recruiter Summary */}
            {summary && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Recruiter Summary
                </h4>
                <div className="p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/40 rounded-xl">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>
            )}

            {/* Skill Gap Analysis */}
            {(skillGap.matchedSkills ||
              skillGap.missingRequired ||
              skillGap.missingPreferred ||
              skillGap.transferable) && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  Skill Gap Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Matched */}
                  {skillGap.matchedSkills?.length > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/40 rounded-xl">
                      <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">
                        Matched Skills ({skillGap.matchedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillGap.matchedSkills.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[11px] font-semibold"
                          >
                            {typeof s === "string" ? s : s.name || s.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Required */}
                  {skillGap.missingRequired?.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/40 rounded-xl">
                      <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">
                        Missing Required ({skillGap.missingRequired.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillGap.missingRequired.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-[11px] font-semibold"
                          >
                            {typeof s === "string" ? s : s.name || s.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Preferred */}
                  {skillGap.missingPreferred?.length > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/40 rounded-xl">
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">
                        Missing Preferred ({skillGap.missingPreferred.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillGap.missingPreferred.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-[11px] font-semibold"
                          >
                            {typeof s === "string" ? s : s.name || s.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transferable */}
                  {skillGap.transferable?.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/40 rounded-xl">
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                        Transferable Skills ({skillGap.transferable.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillGap.transferable.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[11px] font-semibold"
                          >
                            {typeof s === "string" ? s : s.name || s.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {redFlagsList.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" />
                  Red Flags ({redFlagsList.length})
                </h4>
                <div className="space-y-2">
                  {redFlagsList.map((flag, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/40 rounded-xl"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {typeof flag === "string" ? flag : flag.message || flag.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Green Flags */}
            {greenFlagsList.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-green-500 dark:text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Green Flags ({greenFlagsList.length})
                </h4>
                <div className="space-y-2">
                  {greenFlagsList.map((flag, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/40 rounded-xl"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {typeof flag === "string" ? flag : flag.message || flag.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Talking Points */}
            {talkingPoints.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Interview Talking Points
                </h4>
                <div className="space-y-2">
                  {talkingPoints.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/40 rounded-xl"
                    >
                      <Zap className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        {typeof point === "string" ? point : point.question || point.topic}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AIRankings = ({ subscription }) => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useAI, setUseAI] = useState(true);
  const [tierFilter, setTierFilter] = useState("All");
  const [upgradeModal, setUpgradeModal] = useState({ open: false, message: "" });
  const [cached, setCached] = useState(false);

  const fetchRankings = useCallback(async (forceRefresh = false) => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    setCached(false);
    try {
      const params = new URLSearchParams({ useAI: String(useAI) });
      if (forceRefresh) params.set("refresh", "true");
      const res = await fetch(
        `${BASE_URL}/recruiter/jobs/${jobId}/ai-rankings?${params}`,
        { headers: authHeaders() }
      );
      const upgrade = await checkUpgradeRequired(res);
      if (upgrade.blocked) {
        setUpgradeModal({ open: true, message: upgrade.message });
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to load AI rankings");
      }
      const json = await res.json();
      const result = json.data || json.message || json;
      setData(result);
      setCached(result?.meta?.cached || false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [jobId, useAI]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Extract candidates array from response, normalize tier casing
  const allCandidates = (data?.candidates || data?.rankings || data?.results || []).map(c => ({
    ...c,
    tier: capitalizeTier(c.tier),
  }));
  const jobTitle = data?.jobTitle || data?.job?.title || "";

  // Apply tier filter
  const candidates =
    tierFilter === "All"
      ? allCandidates
      : allCandidates.filter(
          (c) => (c.tier || "Moderate") === tierFilter
        );

  // Count by tier
  const tierCounts = {
    All: allCandidates.length,
    Excellent: allCandidates.filter((c) => c.tier === "Excellent").length,
    Strong: allCandidates.filter((c) => c.tier === "Strong").length,
    Moderate: allCandidates.filter((c) => c.tier === "Moderate").length,
    Weak: allCandidates.filter((c) => c.tier === "Weak").length,
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="md:px-4 lg:px-14 py-4 space-y-5">
        {/* Back button + Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-theme_color transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Candidate Rankings
              </h1>
            </div>
            {jobTitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Rankings for: <span className="font-semibold text-gray-700 dark:text-gray-300">{jobTitle}</span>
              </p>
            )}
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              AI-powered candidate analysis and ranking based on skills, experience, and profile match.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* AI toggle */}
            <button
              onClick={() => setUseAI((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                useAI
                  ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              {useAI ? (
                <ToggleRight className="w-5 h-5 text-violet-500" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
              AI {useAI ? "On" : "Off"}
            </button>

            {/* Refresh (uses cache) */}
            <button
              onClick={() => fetchRankings(false)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-theme_color text-white rounded-xl disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              {cached ? "Cached" : "Refresh"}
            </button>

            {/* Re-compute (force fresh) */}
            <button
              onClick={() => fetchRankings(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl disabled:opacity-50 transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5`} />
              Re-compute
            </button>
          </div>
        </div>

        {/* Tier filter tabs */}
        {!loading && !error && allCandidates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {["All", "Excellent", "Strong", "Moderate", "Weak"].map((t) => {
              const isActive = tierFilter === t;
              const cfg = t === "All" ? null : getTierConfig(t);
              return (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isActive
                      ? t === "All"
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                        : `${cfg.bg} ${cfg.color} ${cfg.border}`
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  {t}{" "}
                  <span className="ml-1 opacity-70">
                    ({tierCounts[t]})
                  </span>
                </button>
              );
            })}
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
                AI is analyzing candidates...
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Ranking by skills, experience, and profile fit
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
              onClick={fetchRankings}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && allCandidates.length === 0 && data && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-violet-300 dark:text-violet-700" />
            </div>
            <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
              No Rankings Available
            </p>
            <p className="text-xs text-gray-400 max-w-xs">
              There are no candidate applications for this job yet, or the AI analysis has not been completed. Try again after candidates apply.
            </p>
          </div>
        )}

        {/* No results for filter */}
        {!loading && !error && allCandidates.length > 0 && candidates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <Filter className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              No candidates in "{tierFilter}" tier
            </p>
            <button
              onClick={() => setTierFilter("All")}
              className="mt-3 text-xs font-semibold text-theme_color hover:underline"
            >
              Show all candidates
            </button>
          </div>
        )}

        {/* Candidate ranking cards */}
        {!loading && !error && candidates.length > 0 && (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {allCandidates.length}
                </span>{" "}
                candidates ranked
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI mode:{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {useAI ? "Enabled" : "Disabled"}
                </span>
              </span>
            </div>

            {/* Cards */}
            {candidates.map((candidate, i) => {
              // Determine rank in the full list
              const globalIndex = allCandidates.indexOf(candidate);
              return (
                <CandidateRankingCard
                  key={candidate.id || candidate.candidateId || i}
                  candidate={candidate}
                  rank={globalIndex + 1}
                  index={i}
                />
              );
            })}
          </div>
        )}
      </div>

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, message: "" })}
        feature="AI Rankings"
        message={upgradeModal.message}
      />
    </>
  );
};

export default AIRankings;
