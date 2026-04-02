import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import DashboardOverview from "../components/DashboardOverview";
import Profile from "../components/Profile";
import CVBuilder from "../components/CvBuilder";
import Subscriptions from "../components/Subscriptions";
import Checkout from "../components/Checkout";
import JobApplications from "../components/JobApplications";
import MyPostedJobs from "../components/MyPostedJobs";
import ScheduledInterviews from "../components/ScheduledInterviews";
import { BASE_URL } from "../BaseUrl";
import ErrorMessage from "../utilities/ErrorMessage";
import MyJobDetails from "../components/MyJobDetails";
import AIRankings from "../components/AIRankings";
import BulkJobUpload from "../components/BulkJobUpload";
import AIJobPosting from "../components/AIJobPosting";
import Messaging from "../components/Messaging";
import SecuritySettings from "../components/SecuritySettings";
import SubscriptionInvoices from "../components/SubscriptionInvoices";
import MyTestimonial from "../components/MyTestimonial";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const token = JSON.parse(sessionStorage.getItem('accessToken'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchRecruiterDetails();
    fetchSubscription();
  }, []);

  // Redirect to profile page if company details are missing
  useEffect(() => {
    if (!loading && profileData && (!profileData.onboarded || !profileData.company)) {
      if (!location.pathname.endsWith('/profile')) {
        navigate('/dashboard/profile', { replace: true });
      }
    }
  }, [loading, profileData, location.pathname]);

  const fetchRecruiterDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/recruiter/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile details');
      }
      setProfileData(data);
    } catch (err) {
      ErrorMessage(err.message || 'An error occurred while fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`${BASE_URL}/recruiter/subscriptions/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && !data.error) {
        setSubscription(data.result || null);
      } else {
        setSubscription({ noSub: true });
      }
    } catch (err) {
      console.log('Failed to fetch subscription:', err.message);
      setSubscription({ noSub: true });
    }
  };

  // Check if user has active paid subscription
  const isPaidActive = subscription && !subscription.noSub
    && subscription.subscription?.status === "ACTIVE"
    && subscription.subscription?.plan?.name !== "Free Trial"
    && subscription.isActiveNow !== false;

  // Redirect to subscriptions if no paid subscription (but allow profile for onboarding)
  useEffect(() => {
    if (subscription === null) return; // still loading
    if (!isPaidActive
      && !location.pathname.endsWith('/subscriptions')
      && !location.pathname.endsWith('/checkout')
      && !location.pathname.endsWith('/profile')) {
      navigate('/dashboard/subscriptions', { replace: true });
    }
  }, [subscription, isPaidActive, location.pathname]);

  const showGate = subscription !== null && !isPaidActive
    && !location.pathname.endsWith('/subscriptions')
    && !location.pathname.endsWith('/checkout')
    && !location.pathname.endsWith('/profile');

  return (
    <div>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <NavBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-x-hidden h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 dark:bg-gray-950 px-4 py-2 relative">
            {showGate && (
              <div className="absolute inset-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                  <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Subscription Required</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Subscribe to a plan to unlock all features and start using your dashboard.</p>
                  <button onClick={() => navigate('/dashboard/subscriptions')} className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition shadow-lg">
                    View Subscription Plans
                  </button>
                </div>
              </div>
            )}
            <Routes>
              <Route path="/" element={<DashboardOverview subscription={subscription} />} />
              <Route path="/messages" element={<Messaging />} />
              <Route path="/applications" element={<JobApplications companyId={profileData?.company?.id} subscription={subscription} />} />
              <Route path="/job_management" element={<MyPostedJobs companyId={profileData?.company?.id} subscription={subscription} />} />
              <Route path="/job_management/:id" element={<MyJobDetails companyId={profileData?.company?.id} subscription={subscription} />} />
              <Route path="/jobs/:jobId/ai-rankings" element={<AIRankings subscription={subscription} />} />
              <Route path="/interviews" element={<ScheduledInterviews />} />
              <Route path="/cv_builder" element={<CVBuilder subscription={subscription} />} />
              <Route path="/subscriptions" element={<Subscriptions subscription={subscription} onSubscriptionChange={fetchSubscription} />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/ai_job_posting" element={<AIJobPosting subscription={subscription} />} />
              <Route path="/bulk_upload" element={<BulkJobUpload subscription={subscription} />} />
              <Route path="/testimonial" element={<MyTestimonial />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/subscription_invoices" element={<SubscriptionInvoices />} />
              <Route path="/security" element={<SecuritySettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;