// src/components/dashboard/DashboardOverview.jsx
import { useState, useEffect } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  AreaChart,
  Area,
} from 'recharts';
import {
  ChevronDown,
  Calendar,
  Plus,
  Users,
  Clock,
  BarChart2,
  Briefcase,
  CheckCircle,
  TrendingUp,
  FileText,
  Target,
  Award,
  Eye,
  UserCheck,
  Activity,
  Filter,
  Loader2,
  AlertCircle,
  Archive,
} from 'lucide-react';
import { BASE_URL } from '../BaseUrl';
import { useNavigate } from 'react-router-dom';

// ─── Auth ─────────────────────────────────────────────────────────────────────

const getToken = () => {
  try {
    return JSON.parse(sessionStorage.getItem('accessToken') || '{}');
  } catch {
    return '';
  }
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

export default function DashboardOverview({ subscription }) {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real data from API
  const [dashboardData, setDashboardData] = useState(null);

  const timeRangeOptions = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 3 Months', value: '90d' },
    { label: 'All Time', value: 'all' },
  ];

  // Derive paid-active from the subscription prop (same logic as Dashboard.jsx)
  const isPaidActive = subscription && !subscription.noSub
    && subscription.subscription?.status === "ACTIVE"
    && subscription.subscription?.plan?.name !== "Free Trial"
    && subscription.isActiveNow !== false;

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ period: timeRange });
      const res = await fetch(`${BASE_URL}/recruiter/dashboard?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Failed to load dashboard');
      }
      const json = await res.json();
      setDashboardData(json.result || json.data || json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subscription === null) return; // still loading
    if (!isPaidActive) { setLoading(false); return; }
    fetchDashboard();
  }, [timeRange, isPaidActive]);

  // Derive metrics from API response safely
  // API returns: { period, metrics: { activeJobs: {current,...}, applications: {current,...}, ... } }
  const metrics = dashboardData?.metrics || {};
  const totalJobs = metrics.activeJobs?.current ?? 0;
  const closedJobs = metrics.closedJobs?.current ?? 0;
  const totalApplications = metrics.applications?.current ?? 0;
  const shortlisted = metrics.shortlisted?.current ?? 0;
  const hired = metrics.hires?.current ?? 0;
  const interviews = metrics.interviews?.current ?? 0;
  const pending = metrics.pending?.current ?? 0;

  // Pipeline data derived from real stats
  const pipelineData = [
    { stage: 'Applied', count: totalApplications, fill: '#6366f1' },
    { stage: 'Shortlisted', count: shortlisted, fill: '#8b5cf6' },
    { stage: 'Interviewing', count: interviews, fill: '#ec4899' },
    { stage: 'Hired', count: hired, fill: '#10b981' },
  ];

  const hasPipelineData = pipelineData.some((d) => d.count > 0);

  // Trends data from API if available
  const trendsData = dashboardData?.trends || [];
  const hasTrendsData = trendsData.length > 0;

  // Recent activity from API if available
  const recentActivity = dashboardData?.recentActivity || [];

  // Top candidates from API if available
  const topCandidates = dashboardData?.topCandidates || [];

  const selectedTimeLabel =
    timeRangeOptions.find((o) => o.value === timeRange)?.label || timeRange;

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // Subscription required state
  if (subscription !== null && !isPaidActive) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
            Hiring Dashboard
          </h1>
        </div>
        <button onClick={() => navigate('/dashboard/subscriptions')} className="w-full p-5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl hover:shadow-lg transition-all group text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">Subscribe to unlock your dashboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Get a subscription plan to access all features — job posting, AI rankings, applications & more.</p>
            </div>
            <span className="px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg group-hover:bg-teal-600 transition shrink-0">
              View Plans
            </span>
          </div>
        </button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Failed to load dashboard
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center">
            {error}
          </p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Trial Banner */}
      {subscription?.isTrial && (
        <div className="mb-6 bg-teal-600 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between text-white gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">
                Free Trial &mdash; {subscription.trialDaysLeft}{' '}
                {subscription.trialDaysLeft === 1 ? 'day' : 'days'} remaining
              </p>
              <p className="text-sm opacity-90">
                Upgrade to post jobs, use AI rankings, and unlock all recruiter features
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/subscriptions')}
            className="px-6 py-2.5 bg-white text-teal-600 font-bold rounded-xl hover:bg-teal-50 transition-all shadow-lg flex-shrink-0"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
              Hiring Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
              <Briefcase size={16} />
              {selectedTimeLabel}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard/job_management')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={18} /> Post New Job
            </button>
            <button
              onClick={() => navigate('/dashboard/applications')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg transition-all"
            >
              <Users size={18} /> View Applications
            </button>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
              <Filter size={18} />
              Time Range
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden text-sm text-teal-600 dark:text-teal-400 font-medium"
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className={`${showFilters ? 'block' : 'hidden'} md:block p-4`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Period
                </label>
                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium transition-all"
                  >
                    {timeRangeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        {[
          {
            label: 'Total Jobs Posted',
            value: totalJobs,
            icon: Briefcase,
            bgColor: 'bg-teal-50 dark:bg-teal-500/10',
            iconBg: 'bg-teal-100 dark:bg-teal-500/20',
            iconColor: 'text-teal-600 dark:text-teal-400',
          },
          {
            label: 'Total Applications',
            value: totalApplications,
            icon: FileText,
            bgColor: 'bg-blue-50 dark:bg-blue-500/10',
            iconBg: 'bg-blue-100 dark:bg-blue-500/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
          },
          {
            label: 'Shortlisted',
            value: shortlisted,
            icon: UserCheck,
            bgColor: 'bg-purple-50 dark:bg-purple-500/10',
            iconBg: 'bg-purple-100 dark:bg-purple-500/20',
            iconColor: 'text-purple-600 dark:text-purple-400',
          },
          {
            label: 'Interviews',
            value: interviews,
            icon: Calendar,
            bgColor: 'bg-amber-50 dark:bg-amber-500/10',
            iconBg: 'bg-amber-100 dark:bg-amber-500/20',
            iconColor: 'text-amber-600 dark:text-amber-400',
          },
          {
            label: 'Hired',
            value: hired,
            icon: CheckCircle,
            bgColor: 'bg-green-50 dark:bg-green-500/10',
            iconBg: 'bg-green-100 dark:bg-green-500/20',
            iconColor: 'text-green-600 dark:text-green-400',
          },
          {
            label: 'Pending Review',
            value: pending,
            icon: Clock,
            bgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
            iconBg: 'bg-cyan-100 dark:bg-cyan-500/20',
            iconColor: 'text-cyan-600 dark:text-cyan-400',
          },
          {
            label: 'Closed Jobs',
            value: closedJobs,
            icon: Archive,
            bgColor: 'bg-gray-50 dark:bg-gray-500/10',
            iconBg: 'bg-gray-100 dark:bg-gray-500/20',
            iconColor: 'text-gray-600 dark:text-gray-400',
          },
        ].map((m, i) => (
          <div
            key={i}
            className={`relative ${m.bgColor} rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all group overflow-hidden`}
          >
            {/* Background decoration */}
            <div className={"absolute -right-8 -bottom-8 w-32 h-32 bg-teal-500 opacity-5 rounded-full group-hover:scale-110 transition-transform"}></div>

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`${m.iconBg} p-3 rounded-xl`}>
                  <m.icon size={24} className={m.iconColor} />
                </div>
              </div>

              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {m.value}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {m.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-4">
        {/* Hiring Pipeline */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart2 size={22} className="text-indigo-500" />
            Hiring Pipeline
          </h2>

          {hasPipelineData ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={pipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="stage"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#f3f4f6',
                      padding: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[12, 12, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: '#f97316', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center">
              <BarChart2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No pipeline data yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Post jobs and receive applications to see your hiring pipeline
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity size={22} className="text-green-500" />
            Summary
          </h2>

          <div className="space-y-4">
            {[
              { label: 'Applications', value: totalApplications, color: 'bg-blue-500', max: Math.max(totalApplications, 1) },
              { label: 'Shortlisted', value: shortlisted, color: 'bg-purple-500', max: Math.max(totalApplications, 1) },
              { label: 'Interviews', value: interviews, color: 'bg-amber-500', max: Math.max(totalApplications, 1) },
              { label: 'Hired', value: hired, color: 'bg-green-500', max: Math.max(totalApplications, 1) },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {totalApplications === 0 && (
            <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800/40 rounded-xl">
              <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                No applications yet. Post a job to start receiving applications.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trends Chart */}
      {hasTrendsData && (
        <div className="mb-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp size={22} className="text-blue-500" />
              Hiring Trends
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="period"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#f3f4f6',
                      padding: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorApps)"
                  />
                  <Area
                    type="monotone"
                    dataKey="hires"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorHires)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Candidates */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award size={22} className="text-yellow-500" />
            Top Candidate Matches
          </h2>

          {topCandidates.length > 0 ? (
            <div className="space-y-4">
              {topCandidates.map((match, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {(match.name || match.candidateName || '??').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {match.name || match.candidateName || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                      <span>{match.role || match.jobTitle || ''}</span>
                      {match.location && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{match.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {match.match && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold text-green-600 dark:text-green-400">
                        <Target size={18} />
                        {match.match}%
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No candidates yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Candidates will appear here as applications come in
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard/applications')}
            className="w-full mt-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            View All Applications
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity size={22} className="text-cyan-500" />
            Recent Activity
          </h2>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                    <FileText className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {activity.action || activity.type || 'Activity'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.candidate || activity.description || ''}
                    </div>
                  </div>
                  {activity.time && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                      {activity.time}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activity</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Activity will show here as you post jobs and receive applications
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-800 p-4 md:hidden shadow-2xl z-50">
        <div className="flex gap-3 max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/dashboard/job_management')}
            className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={18} /> Post Job
          </button>
          <button
            onClick={() => navigate('/dashboard/applications')}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <Users size={18} /> Applications
          </button>
        </div>
      </div>

      {/* Add padding at bottom for mobile */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}
