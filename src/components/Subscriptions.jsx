import React, { useState, useEffect } from "react";
import {
  Crown,
  Shield,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Star,
  Zap,
  Loader2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  CreditCard,
  Smartphone,
  ArrowUpCircle,
  Info,
  Clock,
  Gem,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../BaseUrl";
import Modal from "./Modal";
import successMessage from "../utilities/successMessage";

// ─── Static visual config keyed by plan name ──────────────────────────────────
const PLAN_VISUAL = {
  "Silver": {
    accentColor: "text-slate-600",
    accentBg: "bg-slate-600",
    cardBg: "bg-slate-50 dark:bg-gray-800",
    shadowColor: "shadow-lg",
    popular: false,
    icon: Shield,
    subtitle: "Single (1) Job Posting",
    description: "Post a single job vacancy",
  },
  "Gold": {
    accentColor: "text-teal-600",
    accentBg: "bg-teal-600",
    cardBg: "bg-amber-50 dark:bg-amber-950",
    shadowColor: "shadow-lg",
    popular: true,
    icon: Crown,
    subtitle: "Three (3) Job Postings",
    description: "Best value for growing teams",
  },
  "Platinum": {
    accentColor: "text-purple-600",
    accentBg: "bg-purple-600",
    cardBg: "bg-purple-50 dark:bg-purple-950",
    shadowColor: "shadow-lg",
    popular: false,
    icon: Sparkles,
    subtitle: "Five (5) Job Postings",
    description: "For active hiring teams",
  },
  "Diamond": {
    accentColor: "text-cyan-600",
    accentBg: "bg-cyan-600",
    cardBg: "bg-cyan-50 dark:bg-cyan-950",
    shadowColor: "shadow-lg",
    popular: false,
    icon: Gem,
    subtitle: "Unlimited Job Postings",
    description: "Enterprise-level hiring (1 year)",
  },
};

const FALLBACK_VISUAL = {
  accentColor: "text-gray-600",
  accentBg: "bg-gray-600",
  cardBg: "bg-gray-50 dark:bg-gray-800",
  shadowColor: "shadow-lg",
  popular: false,
  icon: Star,
  description: "Great value",
};

// ─── Transform API features object into a flat list for display ───────────────
const buildFeatureList = (features) => {
  if (!features) return [];
  const rows = [];

  const access = features.access || {};
  if (access.jobPosting) rows.push({ text: access.jobPosting, included: true });
  if (access.applicationManagement)
    rows.push({ text: `Applications: ${access.applicationManagement}`, included: true });
  if (access.candidateSuggestions && access.candidateSuggestions !== "Not Available")
    rows.push({ text: access.candidateSuggestions, included: true });
  else
    rows.push({ text: "Candidate Suggestions", included: false });

  if (access.bulkUpload && access.bulkUpload !== "Not Available")
    rows.push({ text: `Bulk Upload: ${access.bulkUpload}`, included: true });
  else
    rows.push({ text: "Bulk Job Upload", included: false });

  if (access.support)
    rows.push({ text: `Support: ${access.support}`, included: true });

  const ai = features.ai || {};
  rows.push({ text: "AI Candidate Rankings", included: ai.rankings === true });
  rows.push({ text: "AI Application Analysis", included: ai.analysis === true });
  rows.push({ text: "AI Resume Screening", included: ai.screening === true });

  const rs = features.recruiterServices || {};
  if (rs.customCandidateSearch) rows.push({ text: "Custom Candidate Search", included: true });
  if (rs.companyRepresentation) rows.push({ text: "Company Representation", included: true });
  if (rs.interviewScheduling) rows.push({ text: "Interview Scheduling", included: true });
  if (rs.referenceChecks) rows.push({ text: "Reference Checks", included: true });
  if (rs.offerNegotiation) rows.push({ text: "Offer Negotiation", included: true });
  if (rs.telephoneSupport) rows.push({ text: "Telephone Support", included: true });
  if (rs.seats && rs.seats > 0) rows.push({ text: `${rs.seats} Recruiter Seats`, included: true });
  if (rs.seats === -1) rows.push({ text: "Unlimited Recruiter Seats", included: true });

  return rows;
};

// ─── Main Component ───────────────────────────────────────────────────────────
function Subscriptions({ subscription }) {
  const navigate = useNavigate();
  const token = JSON.parse(sessionStorage.getItem("accessToken") || "{}");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PAYPAL");
  const [askingPrice, setAskingPrice] = useState(false);

  const handleAskForPrice = async () => {
    setAskingPrice(true);
    try {
      const res = await fetch(`${BASE_URL}/messaging/diamond-inquiry`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/dashboard/messages");
      } else {
        alert(data.message || "Failed to send inquiry");
      }
    } catch {
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setAskingPrice(false);
    }
  };

  // Top-up state
  const [upgradeQuote, setUpgradeQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  // API state
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment link states
  const [paymentLink, setPaymentLink] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [activePlanDetails, setActivePlanDetails] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchActiveSubscriptions(), fetchSubscriptions()]);
      } catch (error) {
        console.error("Failed to load subscriptions:", error);
      }
    };
    loadData();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${BASE_URL}/public/subscriptions?userType=RECRUITER`,
      );
      const json = await res.json();
      if (!res.ok || json.error)
        throw new Error(json?.message || "Failed to load plans");
      setPlans(json.result || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSubscriptions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/recruiter/subscriptions/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || json.error)
        throw new Error(json?.message || "Failed to load subscription");
      setActivePlan(json.result?.subscription?.plan?.id || null);
      setActivePlanDetails(json.result || null);
    } catch (e) {
      console.log(e.message);
    }
  };

  // ── Fetch upgrade quote when user selects a new plan and has an active plan ──
  const fetchUpgradeQuote = async (planId) => {
    setLoadingQuote(true);
    setQuoteError(null);
    setUpgradeQuote(null);
    try {
      const res = await fetch(
        `${BASE_URL}/recruiter/subscriptions/upgrade-quote?planId=${planId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await res.json();
      if (!res.ok || json.error)
        throw new Error(json?.message || "Failed to fetch upgrade quote");
      setUpgradeQuote(json.result);
    } catch (e) {
      setQuoteError(e.message);
    } finally {
      setLoadingQuote(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowConfirmation(true);
    setPaymentLink(null);
    setPaymentMessage(null);
    setPaymentMethod("PAYPAL");
    setUpgradeQuote(null);
    setQuoteError(null);

    // If there's an active paid plan and user is switching, fetch upgrade quote
    if (activePlan && activePlan !== plan.id && !isTrial) {
      fetchUpgradeQuote(plan.id);
    }
  };

  const handleConfirm = async (plan) => {
    // If Google/Apple Pay selected, navigate to checkout page
    if (paymentMethod === "GPAY_APAY") {
      navigate(`/dashboard/checkout?planId=${plan.id}`);
      setShowConfirmation(false);
      return;
    }

    // If PayPal selected, use PayPal API
    if (paymentMethod === "PAYPAL") {
      setLoadingSubscription(true);
      try {
        const res = await fetch(`${BASE_URL}/recruiter/subscriptions/paypal`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ planId: plan?.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to initiate PayPal payment");
        if (data?.result?.approveUrl) {
          window.location.href = data.result.approveUrl;
        } else {
          throw new Error("No PayPal approval URL returned");
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoadingSubscription(false);
      }
      return;
    }

    setLoadingSubscription(true);
    setPaymentLink(null);
    setPaymentMessage(null);

    try {
      const res = await fetch(`${BASE_URL}/recruiter/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan?.id,
          paymentMethod: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to initiate subscription");
      }

      successMessage(data?.message || "Subscription initiated");

      const link = data?.result?.gateway?.payment_link;

      if (link) {
        setPaymentLink(link);
        setPaymentMessage(
          "Payment link ready! Complete payment to activate your plan.",
        );
        setShowConfirmation(false);

        // Google Ads purchase conversion event
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'conversion', {
            send_to: 'AW-18030826186/DypyCOed2IwcEMql4pVD',
            value: (data?.result?.plan?.amountToPay || selectedPlan?.amount / 100 || 1.0),
            currency: data?.result?.plan?.currency || 'CAD',
            transaction_id: data?.result?.gateway?.externalId || '',
          });
        }
      } else {
        setPaymentMessage(
          "Subscription created, but no payment link was returned.",
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const copyToClipboard = async () => {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
      setPaymentMessage("Payment link copied to clipboard!");
      setTimeout(() => setPaymentMessage(null), 3200);
    } catch (err) {
      setPaymentMessage("Failed to copy link");
    }
  };

  const isTrial = subscription?.isTrial || activePlanDetails?.isTrial;
  const isUpgrade = activePlan && selectedPlan && activePlan !== selectedPlan?.id && !isTrial;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-theme_color/20 dark:bg-theme_color/20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-theme_color animate-spin" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading subscription plans…
        </p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Failed to load plans
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Unlock job posting, AI candidate screening, and powerful recruiting
            tools in Dubai & UAE
          </p>
        </div>

        {/* Trial Status Banner */}
        {(subscription?.isTrial || activePlanDetails?.isTrial) && (
          <div className="mb-8 bg-teal-600 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between text-white gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-lg">
                  You're on a Free Trial &mdash;{" "}
                  {subscription?.trialDaysLeft ?? activePlanDetails?.trialDaysLeft}{" "}
                  {(subscription?.trialDaysLeft ?? activePlanDetails?.trialDaysLeft) === 1
                    ? "day"
                    : "days"}{" "}
                  remaining
                </p>
                <p className="text-sm opacity-90">
                  Upgrade to a paid plan to unlock job posting, AI candidate
                  rankings, bulk uploads, and more
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full mx-auto mb-16">
          {plans
            .filter((p) => p.name !== "Free Trial" && !p.name.includes("(Legacy)") && PLAN_VISUAL[p.name])
            .map((plan) => {
              const visual = PLAN_VISUAL[plan.name] || FALLBACK_VISUAL;
              const Icon = visual.icon;
              const featureList = buildFeatureList(plan.features);

              const priceUsd = plan.amount / 100;
              const isYearly = plan.name === "Diamond";
              const displayPrice = priceUsd.toLocaleString();

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 group flex flex-col ${
                    visual.popular
                      ? "shadow-2xl ring-2 ring-teal-400/50"
                      : `shadow-xl hover:shadow-2xl ${visual.shadowColor}`
                  }`}
                >
                  <div
                    className={`absolute inset-0 ${visual.cardBg} backdrop-blur-xl`}
                  ></div>
                  <div
                    className={"absolute inset-0 bg-teal-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"}
                  ></div>

                  <div className="relative pt-6 px-5 pb-6 flex flex-col flex-1">
                    {/* Icon & Plan Name */}
                    <div className="flex items-center gap-2.5 mb-1">
                      <div
                        className={`w-10 h-10 rounded-xl ${visual.accentBg} flex items-center justify-center shadow-md flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                    {visual.subtitle && (
                      <p className="text-sm font-semibold text-theme_color dark:text-teal-400 mb-1 ml-[52px]">{visual.subtitle}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 ml-[52px]">
                      {visual.description}
                    </p>

                    {/* Price */}
                    <div className="mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-extrabold ${visual.accentColor}`}>
                          ${displayPrice}
                        </span>
                        {isYearly && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">/year</span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        What's included
                      </p>
                      <ul className="space-y-2">
                        {featureList.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-[13px]"
                          >
                            {feature.included ? (
                              <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <X className="w-2.5 h-2.5 text-gray-400 dark:text-gray-600" />
                              </div>
                            )}
                            <span
                              className={`leading-snug break-words ${
                                feature.included
                                  ? "text-gray-700 dark:text-gray-300"
                                  : "text-gray-400 dark:text-gray-600 line-through"
                              }`}
                            >
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Active plan info */}
                    {activePlan === plan?.id && (
                      <div className="py-2 px-3 bg-white dark:bg-dark-theme_color/10 rounded-xl mt-3">
                        <p className="text-[11px] py-0.5">
                          Started:{" "}
                          {new Date(
                            activePlanDetails?.subscription?.startedAt,
                          )?.toDateString()}
                        </p>
                        <p className="text-[11px] py-0.5">
                          Expires:{" "}
                          {new Date(
                            activePlanDetails?.subscription?.expiresAt,
                          )?.toDateString()}
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    {false ? null : (
                      <button
                        onClick={() => handlePlanSelect(plan)}
                        disabled={activePlan === plan?.id && !isTrial}
                        className={`${activePlan === plan?.id ? "disabled:bg-gray-200 disabled:cursor-not-allowed" : "cursor-pointer"} w-full mt-4 py-3 px-4 rounded-xl font-bold text-center text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn ${
                          visual.popular
                            ? "bg-teal-600 text-white hover:bg-teal-700"
                            : `${visual.accentBg} text-white hover:shadow-xl hover:opacity-90`
                        }`}
                      >
                        {activePlan === null || isTrial
                          ? "Get Started"
                          : activePlan === plan?.id
                            ? "Current Plan"
                            : "Switch Plan"}
                        {activePlan !== plan?.id && (
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Trust Indicators */}
        <div className="w-full mx-auto">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <p className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Join thousands of recruiters hiring top talent
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Secure Payments
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  256-bit SSL encryption
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Cancel Anytime
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  No long-term commitment
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  24/7 Support
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  We're here to help
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation / Upgrade Modal ─────────────────────────────────────── */}
      {showConfirmation &&
        selectedPlan &&
        !paymentLink &&
        (() => {
          const visual = PLAN_VISUAL[selectedPlan.name] || FALLBACK_VISUAL;
          const Icon = visual.icon;
          const displayPrice = (selectedPlan.amount / 100).toLocaleString();
          const isYearlyPlan = selectedPlan.name === "Diamond";

          // Current plan visual for upgrade flow
          const currentPlanName = upgradeQuote?.currentSubscription?.plan?.name;
          const currentVisual = currentPlanName
            ? PLAN_VISUAL[currentPlanName] || FALLBACK_VISUAL
            : null;

          return (
            <Modal
              isOpen={showConfirmation}
              onClose={() => {
                setShowConfirmation(false);
                setSelectedPlan(null);
                setUpgradeQuote(null);
                setQuoteError(null);
              }}
              title={isUpgrade ? "Upgrade Subscription" : "Add Subscription"}
              subtitle={`${selectedPlan.name} Subscription Plan`}
              size="lg"
            >
              <div className="w-full p-8 relative animate-scale-in">
                {/* Plan icon */}
                <div
                  className={`w-16 h-16 rounded-full ${visual.accentBg} flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  {isUpgrade ? "Upgrade Your Plan" : "Confirm Your Subscription"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  You're about to{" "}
                  {isUpgrade ? "upgrade to the" : "subscribe to the"}{" "}
                  <strong className="text-theme_color dark:text-dark-theme_color uppercase">
                    {selectedPlan.name}
                  </strong>{" "}
                  Plan
                </p>

                {/* ── Upgrade journey banner ─────────────────────────── */}
                {isUpgrade && (
                  <div className="mb-2">
                    {loadingQuote ? (
                      <div className="flex items-center justify-center gap-3 py-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
                        <Loader2 className="w-5 h-5 text-theme_color animate-spin" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Calculating your top-up amount…
                        </span>
                      </div>
                    ) : quoteError ? (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {quoteError}
                        </p>
                      </div>
                    ) : upgradeQuote ? (
                      <>
                        {/* From → To visual */}
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${currentVisual?.accentBg || "bg-gray-600"} text-white text-sm font-semibold shadow-md`}
                          >
                            {currentPlanName}
                          </div>

                          <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                            <ArrowUpCircle className="w-6 h-6 text-green-500" />
                          </div>

                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${visual.accentBg} text-white text-sm font-semibold shadow-md`}
                          >
                            {selectedPlan.name}
                          </div>
                        </div>

                        {/* Credit & Top-up breakdown */}
                        <div className="rounded-2xl border border-dashed border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Info className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">
                              Upgrade Cost Breakdown
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Remaining credit from{" "}
                              <strong>{currentPlanName}</strong>
                            </span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              -${upgradeQuote.creditMajor.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              New plan price (
                              {upgradeQuote.newPlan?.name})
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              ${(upgradeQuote.newPlan?.amount / 100).toFixed(2)}
                            </span>
                          </div>

                          <div className="border-t border-green-200 dark:border-green-800 pt-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-800 dark:text-white">
                              Top-up amount due
                            </span>
                            <span className="text-lg font-extrabold text-theme_color dark:text-dark-theme_color">
                              ${upgradeQuote.topUpMajor.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Standard plan summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Plan
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {selectedPlan.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Billing
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm capitalize">
                      {isYearlyPlan ? "Yearly" : "One-time"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Price
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      ${displayPrice}{isYearlyPlan ? "/year" : ""}
                    </span>
                  </div>
                </div>

                {/* ── Payment method ────────────────────────── */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {/* PayPal - only active payment method */}
                    <label
                      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        paymentMethod === "PAYPAL"
                          ? "border-theme_color bg-theme_color/5 dark:bg-theme_color/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <input type="radio" name="paymentMethod" value="PAYPAL" checked={paymentMethod === "PAYPAL"} onChange={() => setPaymentMethod("PAYPAL")} className="sr-only" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${paymentMethod === "PAYPAL" ? "border-theme_color bg-theme_color" : "border-gray-300 dark:border-gray-600"}`}>
                        {paymentMethod === "PAYPAL" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className={`w-5 h-5 flex-shrink-0 ${paymentMethod === "PAYPAL" ? "text-[#003087]" : "text-gray-400"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg>
                        <div>
                          <p className={`text-sm font-semibold leading-tight ${paymentMethod === "PAYPAL" ? "text-[#003087]" : "text-gray-700 dark:text-gray-300"}`}>PayPal</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Secure checkout</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmation(false);
                      setSelectedPlan(null);
                      setUpgradeQuote(null);
                      setQuoteError(null);
                    }}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirm(selectedPlan)}
                    disabled={loadingSubscription || (isUpgrade && loadingQuote)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold bg-theme_color dark:bg-dark-theme_color text-white hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingSubscription && (
                      <Loader2 className="text-white animate-spin w-5 h-5" />
                    )}
                    {paymentMethod === "GPAY_APAY"
                      ? "Continue to Checkout"
                      : isUpgrade
                        ? "Pay Top-up & Upgrade"
                        : "Continue to Payment"}
                    {!loadingSubscription && (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </Modal>
          );
        })()}

      {/* ── Payment Success / Link Modal ──────────────────────────────────────── */}
      {paymentLink && (
        <Modal
          isOpen={!!paymentLink}
          onClose={() => {
            setPaymentLink(null);
          }}
          title={"Subscription Alert"}
          subtitle={`${selectedPlan?.name} Subscription Plan Alert`}
          size="xl"
          closeOnOverlayClick={false}
        >
          <div className="bg-emerald-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                  Ready to Pay
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  {selectedPlan?.name} Plan — ${selectedPlan?.amount / 100}
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {paymentMessage ||
                "Your subscription has been prepared. Use the buttons below to copy the link or open the secure payment page."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white dark:bg-gray-800 border-2 border-green-600 text-green-700 dark:text-green-400 font-semibold rounded-xl hover:bg-green-50 dark:hover:bg-green-950/60 transition-colors shadow-sm hover:shadow"
              >
                <Copy className="w-5 h-5" />
                Copy Payment Link
              </button>

              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="w-5 h-5" />
                Open Payment Page
              </a>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
              Please complete payment soon — link may expire
            </p>
          </div>
        </Modal>
      )}

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Subscriptions;
