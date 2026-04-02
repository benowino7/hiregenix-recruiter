import { X, Crown, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Reusable upgrade prompt modal shown when a feature requires a higher subscription plan.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - feature: string (e.g., "AI Rankings", "Bulk Upload", "Job Posting")
 * - message: string (optional custom message from server)
 */
export default function UpgradeModal({ open, onClose, feature = "", message = "" }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-teal-600 p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Upgrade Required</h2>
          <p className="text-sm opacity-90 mt-1">
            {feature ? `${feature} is` : "This feature is"} not available on your current plan
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
            {message || "Upgrade your subscription to unlock this feature and take your recruitment to the next level."}
          </p>

          <div className="space-y-3 mb-6">
            {[
              "View full candidate contact details",
              "Preview and download candidate CVs",
              "AI-powered candidate rankings",
              "Send emails directly to candidates",
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <Zap className="w-4 h-4 text-teal-500 flex-shrink-0" />
                {feat}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Maybe Later
            </button>
            <button
              onClick={() => { onClose(); navigate("/dashboard/subscriptions"); }}
              className="flex-1 py-3 px-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Upgrade <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Helper: checks a fetch response for 403 subscription errors.
 * Returns { blocked: true, message } if upgrade required, { blocked: false } otherwise.
 */
export async function checkUpgradeRequired(response) {
  if (response.status === 403) {
    try {
      const data = await response.json();
      if (data.result?.requiresUpgrade || data.requiresUpgrade) {
        return { blocked: true, message: data.message || "" };
      }
      return { blocked: true, message: data.message || "Access denied" };
    } catch {
      return { blocked: true, message: "This feature requires a subscription upgrade." };
    }
  }
  return { blocked: false };
}
