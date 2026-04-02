import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MoreVertical,
  XCircle,
  Users,
  MessageSquare,
  Star,
  Loader2,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  Clock,
  UserCheck,
  Ban,
  SlidersHorizontal,
  X,
  Eye,
  RefreshCw,
  Briefcase,
  MapPin,
  DollarSign,
  Download,
  ChevronDown,
  ChevronRight,
  Lock,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import CvPreviewModal from "./CvPreviewModal";
import Pagination2 from "./Pagination2";
import Modal from "./Modal";
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

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const formatBytes = (b) => {
  if (!b) return "";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d}d ago`;
  return formatDate(iso);
};

const initials = (first, last) =>
  `${(first || "?")[0]}${(last || "?")[0]}`.toUpperCase();

const checkPlatinum = (sub) =>
  sub?.subscription?.plan?.name?.toLowerCase() === "platinum" && sub?.subscription?.status === "ACTIVE";

const maskEmail = (email) => {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  if (!domain) return "***@***.com";
  return `${local[0]}${"*".repeat(Math.max(local.length - 2, 2))}${local.slice(-1)}@${domain[0]}${"*".repeat(Math.max(domain.length - 4, 2))}${domain.slice(-3)}`;
};

const maskPhone = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return "***" + digits.slice(-2);
  return digits.slice(0, 3) + "*".repeat(digits.length - 5) + digits.slice(-2);
};

const avatarColor = (str) => {
  const colors = [
    "from-teal-400 to-rose-500",
    "from-violet-500 to-indigo-600",
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

const formatSalary = (min, max, currency) => {
  if (!min && !max) return null;
  const fmt = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;
  return `${currency || "USD"} ${fmt(min)}–${fmt(max)}`;
};

// ─── Status transition rules ──────────────────────────────────────────────────

/**
 * Flow: SUBMITTED → REVIEWING → SHORTLISTED → HIRED
 *                  ↘ REJECTED   ↘ REJECTED
 * HIRED / REJECTED / WITHDRAWN are terminal.
 */
const getAllowedTransitions = (currentStatus) => {
  switch (currentStatus) {
    case "SUBMITTED":
      return ["REVIEWING"];
    case "REVIEWING":
      return ["SHORTLISTED", "REJECTED"];
    case "SHORTLISTED":
      return ["HIRED", "REJECTED"];
    default:
      return [];
  }
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Submitted",
    icon: Clock,
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  REVIEWING: {
    label: "Reviewing",
    icon: RefreshCw,
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    icon: Star,
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  HIRED: {
    label: "Hired",
    icon: UserCheck,
    badge:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    dot: "bg-green-500",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    badge: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    dot: "bg-red-400",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    icon: Ban,
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    dot: "bg-gray-400",
  },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);
const getStatus = (s) =>
  STATUS_CONFIG[s] || {
    label: s,
    icon: Clock,
    badge: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  };

// ─── Confirmation messages per target status ──────────────────────────────────

const CONFIRM_CONFIG = {
  REVIEWING: {
    title: "Move to Reviewing?",
    message:
      "This candidate will be marked as under review. The process will move forward to the evaluation stage.",
    confirmLabel: "Yes, Start Review",
    confirmCls: "bg-amber-500 hover:bg-amber-600",
    iconCls: "bg-amber-100 dark:bg-amber-900/30 text-amber-500",
  },
  SHORTLISTED: {
    title: "Shortlist Candidate?",
    message:
      "This candidate will be shortlisted and considered for the next hiring stage.",
    confirmLabel: "Yes, Shortlist",
    confirmCls: "bg-violet-600 hover:bg-violet-700",
    iconCls: "bg-violet-100 dark:bg-violet-900/30 text-violet-500",
  },
  HIRED: {
    title: "Hire This Candidate?",
    message:
      "You are about to mark this candidate as hired. This is a final decision and cannot be changed.",
    confirmLabel: "Yes, Hire",
    confirmCls: "bg-green-600 hover:bg-green-700",
    iconCls: "bg-green-100 dark:bg-green-900/30 text-green-500",
  },
  REJECTED: {
    title: "Reject Candidate?",
    message:
      "This candidate will be marked as rejected. This is a final decision and cannot be reversed.",
    confirmLabel: "Yes, Reject",
    confirmCls: "bg-red-500 hover:bg-red-600",
    iconCls: "bg-red-100 dark:bg-red-900/30 text-red-500",
  },
};

// ─── Job status pill config ───────────────────────────────────────────────────

const JOB_STATUS = {
  ACTIVE: {
    label: "Active",
    cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  PAUSED: {
    label: "Paused",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  CLOSED: {
    label: "Closed",
    cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  },
  DRAFT: {
    label: "Draft",
    cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
};
const getJobStatus = (s) =>
  JOB_STATUS[s] || { label: s, cls: "bg-gray-100 text-gray-500" };

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Status Update Confirmation Modal ────────────────────────────────────────

const StatusConfirmModal = ({
  app,
  targetStatus,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!app || !targetStatus) return null;

  const cfg = CONFIRM_CONFIG[targetStatus] || {
    title: `Change to ${targetStatus}?`,
    message: `Move this candidate's status to ${targetStatus}.`,
    confirmLabel: "Confirm",
    confirmCls: "bg-theme_color hover:bg-theme_color/90",
    iconCls: "bg-gray-100 dark:bg-gray-800 text-gray-500",
  };

  const { user } = app.jobSeeker;
  const fromCfg = getStatus(app.status);
  const toCfg = getStatus(targetStatus);

  return ReactDOM.createPortal(
    <Modal
      isOpen={open}
      onClose={onCancel}
      title={"Confirm Update of the Aplication Status"}
      subtitle="This will update all eligible selected candidates."
      size="md"
    >
      {" "}
      <div
        className="relative w-full  overflow-hidden"
        style={{ animation: "fadeSlideUp 0.22s ease both" }}
      >
        {/* Header */}
        <div className="px-0 md:px-4 pt-6 pb-4 flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconCls}`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {cfg.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {cfg.message}
            </p>
          </div>
        </div>

        {/* Candidate card + transition arrow */}
        <div className="mx-6 mb-5 p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(user.firstName + user.lastName)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
            >
              {initials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          {/* From → To */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${fromCfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${fromCfg.dot}`} />
              {fromCfg.label}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${toCfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${toCfg.dot}`} />
              {toCfg.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6 mt-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60 bg-theme_color hover:bg-theme_color/90`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {cfg.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>,
    document.body,
  );
};

// ─── Inline Status Changer ────────────────────────────────────────────────────

const StatusChanger = ({ app, onUpdate, loading }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  // pendingStatus: chosen from dropdown, held until modal confirms
  const [pendingStatus, setPendingStatus] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const allowed = getAllowedTransitions(app.status);
  const isTerminal = allowed.length === 0;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    if (isTerminal || loading) return;
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({
        top: r.bottom + window.scrollY + 4,
        left: r.left + window.scrollX,
      });
    }
    setOpen((v) => !v);
  };

  // Step 1: pick target → show confirm modal
  const handleSelect = (status) => {
    setOpen(false);
    setPendingStatus(status);
  };

  // Step 2: confirmed → call parent handler; onDone closes modal
  const handleConfirm = () => {
    onUpdate(app.id, pendingStatus, () => setPendingStatus(null));
  };

  const cfg = getStatus(app.status);

  const dropdown = open
    ? ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[9999] min-w-[160px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
        >
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Move to
          </p>
          {allowed.map((s) => {
            const c = getStatus(s);
            const Icon = c.icon;
            return (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`}
                />
                <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                {c.label}
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={loading || isTerminal}
        title={
          isTerminal
            ? `${cfg.label} is a final status`
            : `Change status (current: ${cfg.label})`
        }
        className={`inline-flex items-center gap-1 group ${
          isTerminal || loading ? "cursor-default" : "cursor-pointer"
        }`}
      >
        {loading ? (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            Updating…
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge} ${
              !isTerminal
                ? "group-hover:ring-2 group-hover:ring-offset-1 group-hover:ring-current/30 transition-all"
                : ""
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}
            />
            {cfg.label}
            {isTerminal ? (
              <Lock className="w-2.5 h-2.5 opacity-50 ml-0.5" />
            ) : (
              <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
            )}
          </span>
        )}
      </button>

      {dropdown}

      {pendingStatus && (
        <StatusConfirmModal
          app={app}
          targetStatus={pendingStatus}
          onConfirm={handleConfirm}
          onCancel={() => setPendingStatus(null)}
          loading={loading}
        />
      )}
    </>
  );
};

// ─── Cover Letter Drawer ──────────────────────────────────────────────────────

const CoverLetterDrawer = ({ app, onClose, setCvPreview, isPlatinum, onUpgrade }) => {
  if (!app) return null;
  const { user } = app.jobSeeker;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.25s ease both" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(user.firstName + user.lastName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
            >
              {initials(user.firstName, user.lastName)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isPlatinum ? user.email : maskEmail(user.email)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Mail className="w-3.5 h-3.5 text-theme_color flex-shrink-0" />
              {isPlatinum ? (
                <a
                  href={`mailto:${user.email}`}
                  className="hover:text-theme_color hover:underline truncate"
                >
                  {user.email}
                </a>
              ) : (
                <button onClick={onUpgrade} className="flex items-center gap-1 hover:text-theme_color">
                  <span>{maskEmail(user.email)}</span>
                  <Lock className="w-3 h-3 text-teal-400" />
                </button>
              )}
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Phone className="w-3.5 h-3.5 text-theme_color flex-shrink-0" />
                {isPlatinum ? (
                  <span>{user.phoneNumber}</span>
                ) : (
                  <button onClick={onUpgrade} className="flex items-center gap-1 hover:text-theme_color">
                    <span>{maskPhone(user.phoneNumber)}</span>
                    <Lock className="w-3 h-3 text-teal-400" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 p-3 bg-theme_color/5 dark:bg-theme_color/10 border border-theme_color/15 rounded-xl">
            <div className="w-8 h-8 bg-theme_color/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-theme_color" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-theme_color/70 uppercase tracking-wider mb-0.5">
                CV Submitted
              </p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                {app.cv.fileName}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {isPlatinum ? (
                <Download
                  onClick={() =>
                    setCvPreview({
                      open: true,
                      cvId: app.id,
                      cvFileName: app.cv.fileName,
                    })
                  }
                  className="text-theme_color dark:text-dark-theme_color cursor-pointer w-4 h-4"
                />
              ) : (
                <button onClick={onUpgrade} className="flex items-center gap-1" title="Upgrade to Platinum to preview CV">
                  <Download className="text-gray-400 w-4 h-4" />
                  <Lock className="w-3 h-3 text-teal-400" />
                </button>
              )}
              <span className="text-xs text-gray-400">
                {formatBytes(app.cv.fileSize)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs border-b border-gray-100 dark:border-gray-800 pb-2">
            <span className="text-gray-400">Applied</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatDate(app.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Status</span>
            <StatusBadge status={app.status} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              Cover Letter
            </p>
            {app.coverLetter ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {app.coverLetter}
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <p className="text-xs text-gray-400 italic">
                  No cover letter submitted
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Row menu ─────────────────────────────────────────────────────────────────

const RowMenu = ({ app, onView, isPlatinum, onUpgrade }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 176,
      });
    }
    setOpen((v) => !v);
  };

  const menu = open
    ? ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{ top: menuPos.top, left: menuPos.left }}
          className="fixed z-[9999] w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
        >
          <button
            onClick={() => {
              onView(app);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Eye className="w-3.5 h-3.5 text-theme_color" /> View Profile
          </button>
          {isPlatinum ? (
            <a
              href={`mailto:${app.jobSeeker.user.email}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Mail className="w-3.5 h-3.5 text-blue-500" /> Send Email
            </a>
          ) : (
            <button
              onClick={() => { setOpen(false); onUpgrade(); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Mail className="w-3.5 h-3.5 text-gray-400" /> Send Email <Lock className="w-3 h-3 text-teal-400 ml-auto" />
            </button>
          )}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 text-gray-400 hover:text-theme_color rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {menu}
    </>
  );
};

// ─── Stat tile ────────────────────────────────────────────────────────────────

const StatTile = ({ label, value, color, delay }) => (
  <div
    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 text-center"
    style={{ animation: "fadeUp 0.35s ease both", animationDelay: delay }}
  >
    <p className={`text-2xl font-black ${color} leading-none mb-0.5`}>
      {value}
    </p>
    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
      {label}
    </p>
  </div>
);

// ─── Job Card (sidebar) ───────────────────────────────────────────────────────

const JobCard = ({ job, selected, onClick }) => {
  const jsCfg = getJobStatus(job.status);
  const salary = job.showSalary
    ? formatSalary(job.minSalary, job.maxSalary, job.currency)
    : null;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 transition-colors ${
        selected
          ? "bg-theme_color/5 dark:bg-theme_color/10 border-l-2 border-l-theme_color"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p
          className={`text-sm font-bold leading-snug ${selected ? "text-theme_color" : "text-gray-900 dark:text-white"}`}
        >
          {job.title}
        </p>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${jsCfg.cls}`}
        >
          {jsCfg.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {job.locationName && (
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[120px]">
              {job.isRemote ? "Remote" : job.locationName}
            </span>
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-1">
        <p className="text-[10px] text-gray-400 dark:text-gray-600">
          {timeAgo(job.createdAt)}
        </p>
        {job._count?.jobApplications > 0 && (
          <span className="text-[10px] font-bold text-theme_color bg-theme_color/10 px-1.5 py-0.5 rounded-full">
            {job._count.jobApplications} app{job._count.jobApplications !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </button>
  );
};

// ─── Bulk action configs ──────────────────────────────────────────────────────

const BULK_ACTIONS = [
  {
    status: "REVIEWING",
    label: "Reviewing",
    icon: RefreshCw,
    cls: "bg-amber-500 hover:bg-amber-600",
  },
  {
    status: "SHORTLISTED",
    label: "Shortlist",
    icon: Star,
    cls: "bg-violet-600 hover:bg-violet-700",
  },
  {
    status: "REJECTED",
    label: "Reject",
    icon: XCircle,
    cls: "bg-red-500 hover:bg-red-600",
  },
  {
    status: "HIRED",
    label: "Hire",
    icon: UserCheck,
    cls: "bg-green-600 hover:bg-green-700",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function JobApplications({ companyId, subscription }) {
  const navigate = useNavigate();
  const isPlatinum = checkPlatinum(subscription);
  const showUpgrade = (feature) => setUpgradeModal({ open: true, message: "", feature: feature || "Contact Details & CV Access" });
  // ── Jobs state ──
  const [jobs, setJobs] = useState([]);
  const [upgradeModal, setUpgradeModal] = useState({ open: false, message: "", feature: "" });
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobStatusFilter, setJobStatusFilter] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [jobPage, setJobPage] = useState(1);
  const [jobLimit, setJobLimit] = useState(10);

  // ── Applications state ──
  const [applications, setApplications] = useState([]);
  // Server-driven pagination object
  const [appPagination, setAppPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Application filters (all sent to server) ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // ── Selection ──
  const [selectedIds, setSelectedIds] = useState([]);

  // ── Drawer ──
  const [drawerApp, setDrawerApp] = useState(null);

  // ── Per-row update loading ──
  const [updatingId, setUpdatingId] = useState(null);

  // ── Bulk loading & confirm ──
  const [bulkLoadingStatus, setBulkLoadingStatus] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(null); // { status }

  const [cvPreview, setCvPreview] = useState({
    open: false,
    cvId: null,
    cvFileName: null,
  });

  // ── Fetch jobs ──────────────────────────────────────────────────────────────

  const loadJobs = async () => {
    setJobsLoading(true);
    setJobsError("");
    try {
      const qs = jobStatusFilter ? `&status=${jobStatusFilter}` : "";
      const res = await fetch(
        `${BASE_URL}/recruiter/jobs?hasApplications=true&companyId=${companyId}${qs}`,
        { headers: authHeaders() },
      );
      if (!res.ok) throw new Error("Failed to load jobs");
      const json = await res.json();
      const list = json?.data || [];
      setJobs(list);
      setJobPage(1);
      if (list.length > 0) setSelectedJob((prev) => prev ?? list[0]);
    } catch (e) {
      setJobsError(e.message);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadJobs();
    }
  }, [jobStatusFilter, companyId]);

  // ── Fetch applications — all filtering is server-side ──────────────────────

  const loadApplications = async (overrides = {}) => {
    if (!selectedJob) return;
    setLoading(true);
    setError("");
    setSelectedIds([]);

    const page = overrides.page ?? appPagination.page;
    const limit = overrides.limit ?? appPagination.limit;
    const status = overrides.statusFilter ?? statusFilter;
    const sort = overrides.sortBy ?? sortBy;
    const q = overrides.search ?? search;

    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
      if (status !== "ALL") params.set("status", status); // e.g. status=SHORTLISTED
      if (q.trim()) params.set("search", q.trim());
      if (sort) params.set("sort", sort);

      const res = await fetch(
        `${BASE_URL}/recruiter/jobs/${selectedJob.id}/applications?${params.toString()}`,
        { headers: authHeaders() },
      );
      if (!res.ok) throw new Error("Failed to load applications");
      const json = await res.json();
      setApplications(json.message?.applications || []);
      if (json.message?.pagination) {
        setAppPagination(json.message.pagination);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJob) {
      // Reset all filters when switching jobs
      setSearch("");
      setStatusFilter("ALL");
      setSortBy("newest");
      setAppPagination((p) => ({ ...p, page: 1 }));
      loadApplications({
        page: 1,
        statusFilter: "ALL",
        search: "",
        sortBy: "newest",
      });
    }
  }, [selectedJob?.id]);

  /**
   * Central helper — updates any filter/sort/page value and immediately
   * re-fetches from the server with the combined updated params.
   */
  const applyFilters = (updates = {}) => {
    const newStatus = updates.statusFilter ?? statusFilter;
    const newSearch = updates.search ?? search;
    const newSort = updates.sortBy ?? sortBy;
    const newPage = updates.page ?? 1; // filter changes always reset to page 1

    if ("statusFilter" in updates) setStatusFilter(newStatus);
    if ("search" in updates) setSearch(newSearch);
    if ("sortBy" in updates) setSortBy(newSort);
    setAppPagination((p) => ({ ...p, page: newPage }));

    loadApplications({
      page: newPage,
      statusFilter: newStatus,
      search: newSearch,
      sortBy: newSort,
    });
  };

  // ── Status update (single row) ──────────────────────────────────────────────

  const updateStatus = async (appId, newStatus, onDone) => {
    setUpdatingId(appId);
    try {
      const res = await fetch(`${BASE_URL}/recruiter/jobs/${appId}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          status: newStatus,
          note: `Status changed to ${newStatus}`,
        }),
      });
      if (res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        if (errData.result?.requiresUpgrade) {
          setUpgradeModal({ open: true, message: errData.message || "" });
          return;
        }
      }
      if (!res.ok) throw new Error();
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)),
      );
    } catch {
      /* add toast here */
    } finally {
      setUpdatingId(null);
      onDone?.();
    }
  };

  // ── Bulk update ─────────────────────────────────────────────────────────────

  const bulkUpdate = async (newStatus) => {
    const eligible = selectedIds.filter((id) => {
      const app = applications.find((a) => a.id === id);
      return app && getAllowedTransitions(app.status).includes(newStatus);
    });

    setBulkConfirm(null);
    if (eligible.length === 0) {
      setSelectedIds([]);
      return;
    }

    setBulkLoadingStatus(newStatus);
    await Promise.allSettled(
      eligible.map((id) =>
        fetch(`${BASE_URL}/recruiter/jobs/${id}/status`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({
            status: newStatus,
            note: `Bulk status update to ${newStatus}`,
          }),
        }).then((res) => {
          if (res.ok)
            setApplications((prev) =>
              prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
            );
        }),
      ),
    );
    setSelectedIds([]);
    setBulkLoadingStatus(null);
  };

  // ── Sidebar jobs (client-side search + pagination only) ─────────────────────

  const filteredJobs = useMemo(() => {
    if (!jobSearch.trim()) return jobs;
    const q = jobSearch.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.locationName || "").toLowerCase().includes(q),
    );
  }, [jobs, jobSearch]);

  const jobTotalPages = Math.max(1, Math.ceil(filteredJobs.length / jobLimit));
  const paginatedJobs = filteredJobs.slice(
    (jobPage - 1) * jobLimit,
    jobPage * jobLimit,
  );

  // ── Derived ──────────────────────────────────────────────────────────────────

  const pageIds = applications.map((a) => a.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0;

  const toggleAll = () => {
    if (allPageSelected)
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    else setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
  };
  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const byStatus = useMemo(
    () =>
      applications.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {}),
    [applications],
  );

  const isFiltered = search.trim() || statusFilter !== "ALL";

  const eligibleCount = (targetStatus) =>
    selectedIds.filter((id) => {
      const app = applications.find((a) => a.id === id);
      return app && getAllowedTransitions(app.status).includes(targetStatus);
    }).length;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideInRight {
          from { transform:translateX(100%); }
          to   { transform:translateX(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="w-full">
        <div className="w-full mx-auto px-2 py-4">
          {/* ── Page header ── */}
          <div
            className="mb-6 flex items-end justify-between flex-wrap gap-4"
            style={{ animation: "fadeUp 0.3s ease both" }}
          >
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Job Applications
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select a job posting to review its candidates
              </p>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div
            className="flex gap-5"
            style={{
              animation: "fadeUp 0.35s ease both",
              animationDelay: "60ms",
            }}
          >
            {/* ── LEFT: Jobs sidebar ── */}
            <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col self-start sticky top-4">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Jobs ({filteredJobs.length})
                  </p>
                  <button
                    onClick={loadJobs}
                    disabled={jobsLoading}
                    className="text-gray-400 hover:text-theme_color transition-colors"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${jobsLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => {
                      setJobSearch(e.target.value);
                      setJobPage(1);
                    }}
                    placeholder="Search jobs…"
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-theme_color transition-colors"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { v: "", l: "All" },
                    { v: "ACTIVE", l: "Active" },
                    { v: "PAUSED", l: "Paused" },
                    { v: "CLOSED", l: "Closed" },
                  ].map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => {
                        setJobStatusFilter(v);
                        setJobPage(1);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors ${
                        jobStatusFilter === v
                          ? "bg-theme_color text-white border-theme_color"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-360px)]">
                {jobsLoading && (
                  <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-theme_color" />
                    <span className="text-xs">Loading jobs…</span>
                  </div>
                )}
                {jobsError && !jobsLoading && (
                  <div className="p-4">
                    <p className="text-xs text-red-500">{jobsError}</p>
                    <button
                      onClick={loadJobs}
                      className="mt-2 text-xs text-theme_color hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!jobsLoading && !jobsError && filteredJobs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                    <Briefcase className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-xs text-gray-400">No jobs with applications yet</p>
                  </div>
                )}
                {!jobsLoading &&
                  !jobsError &&
                  paginatedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      selected={selectedJob?.id === job.id}
                      onClick={() => setSelectedJob(job)}
                    />
                  ))}
              </div>

              {/* Jobs pagination */}
              {!jobsLoading && !jobsError && filteredJobs.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2">
                  <Pagination2
                    currentPage={jobPage}
                    totalPages={jobTotalPages}
                    total={filteredJobs.length}
                    limit={jobLimit}
                    onPageChange={setJobPage}
                    onLimitChange={(l) => {
                      setJobLimit(l);
                      setJobPage(1);
                    }}
                    limitOptions={[5, 10, 20]}
                    compact
                  />
                </div>
              )}
            </div>

            {/* ── RIGHT: Applications panel ── */}
            <div className="flex-1 min-w-0 space-y-4">
              {!selectedJob && !jobsLoading && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-theme_color/10 flex items-center justify-center mb-4">
                    <Briefcase className="w-7 h-7 text-theme_color/50" />
                  </div>
                  <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Select a job
                  </p>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Choose a job posting from the left to view its applications
                  </p>
                </div>
              )}

              {selectedJob && (
                <>
                  {/* Job context bar */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-theme_color/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-4 h-4 text-theme_color" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {selectedJob.title}
                        </p>
                        {selectedJob.locationName && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {selectedJob.isRemote
                              ? "Remote"
                              : selectedJob.locationName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${getJobStatus(selectedJob.status).cls}`}
                      >
                        {getJobStatus(selectedJob.status).label}
                      </span>
                      <button
                        onClick={() => {
                          if (!isPlatinum) {
                            showUpgrade("AI Candidate Ranking");
                            return;
                          }
                          navigate(`/dashboard/jobs/${selectedJob.id}/ai-rankings`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg transition-all shadow-sm"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        AI Rank
                        {!isPlatinum && <Lock className="w-3 h-3 ml-0.5 opacity-70" />}
                      </button>
                      <button
                        onClick={() => loadApplications()}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
                        />
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  {!loading && !error && appPagination.total > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      <StatTile
                        label="Total"
                        value={appPagination.total}
                        color="text-gray-900 dark:text-white"
                        delay="0ms"
                      />
                      <StatTile
                        label="Submitted"
                        value={byStatus.SUBMITTED || 0}
                        color="text-blue-600 dark:text-blue-400"
                        delay="30ms"
                      />
                      <StatTile
                        label="Reviewing"
                        value={byStatus.REVIEWING || 0}
                        color="text-amber-600 dark:text-amber-400"
                        delay="60ms"
                      />
                      <StatTile
                        label="Shortlisted"
                        value={byStatus.SHORTLISTED || 0}
                        color="text-violet-600 dark:text-violet-400"
                        delay="90ms"
                      />
                      <StatTile
                        label="Hired"
                        value={byStatus.HIRED || 0}
                        color="text-green-600 dark:text-green-400"
                        delay="120ms"
                      />
                      <StatTile
                        label="Rejected"
                        value={byStatus.REJECTED || 0}
                        color="text-red-500 dark:text-red-400"
                        delay="150ms"
                      />
                    </div>
                  )}

                  {/* Main table panel */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="relative w-full sm:w-72">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                              applyFilters({ search: e.target.value })
                            }
                            placeholder="Search name, email, CV…"
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-theme_color transition-colors"
                          />
                          {search && (
                            <button
                              onClick={() => applyFilters({ search: "" })}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => setShowFilters((v) => !v)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl border transition-colors ${
                            showFilters ||
                            statusFilter !== "ALL" ||
                            sortBy !== "newest"
                              ? "bg-theme_color text-white border-theme_color"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          Filters
                        </button>
                      </div>

                      {showFilters && (
                        <div
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1"
                          style={{ animation: "fadeUp 0.2s ease both" }}
                        >
                          {/* Status filter — sent to API */}
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                              Status
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() =>
                                  applyFilters({ statusFilter: "ALL" })
                                }
                                className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                                  statusFilter === "ALL"
                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                All
                              </button>
                              {ALL_STATUSES.map((s) => {
                                const cfg = STATUS_CONFIG[s];
                                return (
                                  <button
                                    key={s}
                                    onClick={() =>
                                      applyFilters({ statusFilter: s })
                                    }
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                                      statusFilter === s
                                        ? cfg.badge
                                        : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    {cfg.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          {/* Sort */}
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                              Sort by
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { v: "newest", l: "Newest" },
                                { v: "oldest", l: "Oldest" },
                                { v: "name", l: "Name A–Z" },
                              ].map(({ v, l }) => (
                                <button
                                  key={v}
                                  onClick={() => applyFilters({ sortBy: v })}
                                  className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                                    sortBy === v
                                      ? "bg-theme_color text-white border-theme_color"
                                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {l}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {isFiltered && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className="text-xs text-gray-400">Active:</span>
                          {statusFilter !== "ALL" && (
                            <button
                              onClick={() =>
                                applyFilters({ statusFilter: "ALL" })
                              }
                              className="flex items-center gap-1 px-2.5 py-0.5 bg-theme_color/10 text-theme_color text-xs font-medium rounded-full"
                            >
                              {getStatus(statusFilter).label}
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          {search && (
                            <button
                              onClick={() => applyFilters({ search: "" })}
                              className="flex items-center gap-1 px-2.5 py-0.5 bg-theme_color/10 text-theme_color text-xs font-medium rounded-full"
                            >
                              "{search}" <X className="w-3 h-3" />
                            </button>
                          )}
                          <span className="text-xs text-gray-400">
                            {appPagination.total} result
                            {appPagination.total !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ── Bulk action bar ── */}
                    {someSelected && (
                      <div
                        className="px-5 py-3 bg-theme_color/5 dark:bg-theme_color/10 border-b border-theme_color/20 flex flex-wrap items-center gap-3"
                        style={{ animation: "fadeUp 0.2s ease both" }}
                      >
                        <span className="text-sm font-semibold text-theme_color">
                          {selectedIds.length} selected
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          {BULK_ACTIONS.map(
                            ({ status, label, icon: Icon, cls }) => {
                              const count = eligibleCount(status);
                              const isThisLoading =
                                bulkLoadingStatus === status;
                              const anyLoading = bulkLoadingStatus !== null;
                              return (
                                <button
                                  key={status}
                                  onClick={() => setBulkConfirm({ status })}
                                  disabled={anyLoading || count === 0}
                                  title={
                                    count === 0
                                      ? `No selected candidates can transition to ${label}`
                                      : `Apply to ${count} eligible candidate${count !== 1 ? "s" : ""}`
                                  }
                                  className={`flex items-center gap-1.5 px-3 py-1.5 ${cls} text-white text-xs font-semibold rounded-lg disabled:opacity-40 transition-colors`}
                                >
                                  {isThisLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Icon className="w-3.5 h-3.5" />
                                  )}
                                  {label}
                                  {count > 0 && !isThisLoading && (
                                    <span className="bg-white/25 text-white rounded-full text-[10px] font-bold px-1.5 py-0 leading-4">
                                      {count}
                                    </span>
                                  )}
                                </button>
                              );
                            },
                          )}
                          <button
                            onClick={() => setSelectedIds([])}
                            disabled={bulkLoadingStatus !== null}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" /> Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Loading */}
                    {loading && (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 rounded-2xl bg-theme_color/10 animate-pulse" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-theme_color animate-spin" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          Loading applications…
                        </p>
                      </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                      <div className="m-5 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300 flex-1">
                          {error}
                        </p>
                        <button
                          onClick={() => loadApplications()}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && applications.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-theme_color/10 flex items-center justify-center mb-4">
                          <Users className="w-7 h-7 text-theme_color/50" />
                        </div>
                        <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
                          {isFiltered
                            ? "No matching candidates"
                            : "No applications yet"}
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs">
                          {isFiltered
                            ? "Try adjusting your search or filters."
                            : "Share this job posting to start receiving candidates."}
                        </p>
                      </div>
                    )}

                    {/* Table */}
                    {!loading && !error && applications.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <th className="pl-5 pr-3 py-3 text-left w-10">
                                <input
                                  type="checkbox"
                                  checked={allPageSelected}
                                  onChange={toggleAll}
                                  className="rounded border-gray-300 dark:border-gray-600 accent-theme_color"
                                />
                              </th>
                              {[
                                "Candidate",
                                "Contact",
                                "CV",
                                "Applied",
                                "Status",
                                "Actions",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {applications.map((app, i) => {
                              const { user } = app.jobSeeker;
                              const isSelected = selectedIds.includes(app.id);
                              const isUpdating = updatingId === app.id;
                              return (
                                <tr
                                  key={app.id}
                                  className={`transition-colors ${
                                    isSelected
                                      ? "bg-theme_color/5 dark:bg-theme_color/10"
                                      : "hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                                  }`}
                                  style={{
                                    animation: "fadeUp 0.3s ease both",
                                    animationDelay: `${i * 25}ms`,
                                  }}
                                >
                                  <td className="pl-5 pr-3 py-4">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleOne(app.id)}
                                      className="rounded border-gray-300 dark:border-gray-600 accent-theme_color"
                                    />
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(user.firstName + user.lastName)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
                                      >
                                        {initials(
                                          user.firstName,
                                          user.lastName,
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {user.firstName} {user.lastName}
                                        </p>
                                        <div className="flex gap-1.5 mt-1">
                                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${app.jobSeeker.hasVisa ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                            {app.jobSeeker.hasVisa ? '✓' : '✗'} Visa
                                          </span>
                                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${app.jobSeeker.hasWorkPermit ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                            {app.jobSeeker.hasWorkPermit ? '✓' : '✗'} Permit
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    {isPlatinum ? (
                                      <>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[160px]">
                                          {user.email}
                                        </p>
                                        {user.phoneNumber && (
                                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            {user.phoneNumber}
                                          </p>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <button onClick={() => showUpgrade("Candidate Email")} className="flex items-center gap-1 text-xs text-gray-400 truncate max-w-[160px] hover:text-theme_color">
                                          {maskEmail(user.email)} <Lock className="w-3 h-3 text-teal-400 flex-shrink-0" />
                                        </button>
                                        {user.phoneNumber && (
                                          <button onClick={() => showUpgrade("Candidate Phone")} className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 hover:text-theme_color">
                                            {maskPhone(user.phoneNumber)} <Lock className="w-3 h-3 text-teal-400 flex-shrink-0" />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-theme_color flex-shrink-0" />
                                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                                        {app.cv.fileName}
                                      </span>
                                    </div>
                                    <div className="flex gap-4 mt-1">
                                      <p className="text-xs text-gray-400 mt-0.5 pl-5">
                                        {formatBytes(app.cv.fileSize)}
                                      </p>
                                      {isPlatinum ? (
                                        <Download
                                          onClick={() =>
                                            setCvPreview({
                                              open: true,
                                              cvId: app.id,
                                              cvFileName: app.cv.fileName,
                                            })
                                          }
                                          className="text-theme_color dark:text-dark-theme_color cursor-pointer w-[18px] h-[18px]"
                                        />
                                      ) : (
                                        <button onClick={() => showUpgrade("CV Preview & Download")} className="flex items-center gap-0.5" title="Upgrade to Platinum">
                                          <Download className="text-gray-400 w-[18px] h-[18px]" />
                                          <Lock className="w-3 h-3 text-teal-400" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {formatDate(app.createdAt)}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                      {timeAgo(app.createdAt)}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <StatusChanger
                                      app={app}
                                      onUpdate={updateStatus}
                                      loading={isUpdating}
                                    />
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setDrawerApp(app)}
                                        className="p-1.5 text-gray-400 hover:text-theme_color rounded-lg transition-colors"
                                        title="View cover letter"
                                      >
                                        <MessageSquare className="w-4 h-4" />
                                      </button>
                                      <RowMenu
                                        app={app}
                                        onView={setDrawerApp}
                                        isPlatinum={isPlatinum}
                                        onUpgrade={() => showUpgrade("Candidate Email")}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Applications pagination */}
                    {!loading && !error && appPagination.total > 0 && (
                      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                        <Pagination2
                          currentPage={appPagination.page}
                          totalPages={appPagination.totalPages}
                          total={appPagination.total}
                          limit={appPagination.limit}
                          onPageChange={(p) => {
                            setAppPagination((prev) => ({
                              ...prev,
                              page: p,
                            }));
                            loadApplications({ page: p });
                          }}
                          onLimitChange={(l) => {
                            setAppPagination((prev) => ({
                              ...prev,
                              limit: l,
                              page: 1,
                            }));
                            loadApplications({ page: 1, limit: l });
                          }}
                          limitOptions={[10, 25, 50]}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Drawer ── */}
      {drawerApp && (
        <CoverLetterDrawer
          app={drawerApp}
          onClose={() => setDrawerApp(null)}
          setCvPreview={setCvPreview}
          isPlatinum={isPlatinum}
          onUpgrade={() => showUpgrade("Contact Details & CV Access")}
        />
      )}

      {/* ── CV preview ── */}
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

      {/* ── Bulk confirm modal ── */}
      {bulkConfirm &&
        (() => {
          const cfg = CONFIRM_CONFIG[bulkConfirm.status] || {
            title: `Bulk update to ${bulkConfirm.status}?`,
            message: "This will update all eligible selected candidates.",
            confirmLabel: "Confirm",
            confirmCls: "bg-theme_color hover:bg-theme_color/90",
            iconCls: "bg-gray-100 dark:bg-gray-800 text-gray-500",
          };
          const count = eligibleCount(bulkConfirm.status);
          const toCfg = getStatus(bulkConfirm.status);
          return ReactDOM.createPortal(
            <Modal
              isOpen={bulkConfirm}
              onClose={() => setBulkConfirm(null)}
              title={"Confirm Update of the Aplication Status"}
              subtitle="This will update all eligible selected candidates."
              size="md"
            >
              <div
                className="w-full overflow-hidden"
                style={{ animation: "fadeSlideUp 0.22s ease both" }}
              >
                <div className="px-0 md:px-4 pt-6 pb-4 flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconCls}`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      {cfg.title}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {cfg.message}
                    </p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${toCfg.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${toCfg.dot}`}
                        />
                        {toCfg.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        will apply to{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {count} candidate{count !== 1 ? "s" : ""}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 px-6 pb-6 mt-3">
                  <button
                    onClick={() => setBulkConfirm(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => bulkUpdate(bulkConfirm.status)}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors bg-theme_color hover:bg-theme_color/90`}
                  >
                    {cfg.confirmLabel}
                  </button>
                </div>
              </div>
            </Modal>,
            document.body,
          );
        })()}

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, message: "", feature: "" })}
        feature={upgradeModal.feature || "Contact Details & CV Access"}
        message={upgradeModal.message || "Upgrade to the Platinum plan to view candidate contact details, preview CVs, and download resumes."}
      />
    </>
  );
}
