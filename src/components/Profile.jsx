// src/pages/recruiter/RecruiterProfile.jsx
import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, Globe, MapPin, FileText,
  CheckCircle, AlertCircle, Loader2, Plus, Edit, Calendar,
  Briefcase, Shield
} from 'lucide-react';
import { BASE_URL } from '../BaseUrl';
import AddIndustryModal from './AddIndustryModal';
import AddCompanyModal from './AddCompanyModal';

const RecruiterProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddIndustryModal, setShowAddIndustryModal] = useState(false);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    fetchRecruiterDetails();
  }, [reload]);

  const fetchRecruiterDetails = async () => {
    setLoading(true);
    setError(null);
    const token = JSON.parse(sessionStorage.getItem('accessToken'));

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

      if (data.status === 'SUCCESS') {
        setProfileData(data);

        if (data.onboarded && !data.company) {
          setShowAddCompanyModal(true);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch profile details');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: {
        bg: 'bg-green-100 dark:bg-green-900/40',
        text: 'text-green-700 dark:text-green-300',
        icon: CheckCircle
      },
      PENDING: {
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        text: 'text-amber-700 dark:text-amber-300',
        icon: AlertCircle
      },
      SUSPENDED: {
        bg: 'bg-red-100 dark:bg-red-900/40',
        text: 'text-red-700 dark:text-red-300',
        icon: AlertCircle
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.text}`}>
        <Icon size={16} />
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toDateString() + ', ' + date?.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-theme_color" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
          <h3 className="text-2xl font-bold mb-2 dark:text-white">Error Loading Profile</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchRecruiterDetails}
            className="px-6 py-3 bg-theme_color text-white rounded-xl hover:bg-theme_color/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const user = profileData?.profile?.user;
  const company = profileData?.company;
  const recruiterProfile = user?.recruiterProfile;

  return (
    <div className="w-full pb-8">
      <div className="w-full">
        {/* Header */}
        <div className="pt-4 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            My Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account and company information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                  <User className="text-theme_color" size={24} />
                  Personal Information
                </h2>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Edit size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">First Name</label>
                    <p className="mt-1 text-base dark:text-white">{user?.firstName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Last Name</label>
                    <p className="mt-1 text-base dark:text-white">{user?.lastName || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <p className="mt-1 text-base dark:text-white">{user?.email || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <p className="mt-1 text-base dark:text-white">
                    {user?.countryCode} {user?.phoneNumber || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar size={16} />
                    Member Since
                  </label>
                  <p className="mt-1 text-base dark:text-white">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                  <Building2 className="text-theme_color" size={24} />
                  Company Information
                </h2>
                {company && (
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Edit size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>

              {company ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Company Name</label>
                    <p className="mt-1 text-base dark:text-white">{company.name}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FileText size={16} />
                        Registration Number
                      </label>
                      <p className="mt-1 text-base dark:text-white">{company.registrationNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <MapPin size={16} />
                        Country
                      </label>
                      <p className="mt-1 text-base dark:text-white">{company.country}</p>
                    </div>
                  </div>

                  {company.website && (
                    <div>
                      <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Globe size={16} />
                        Website
                      </label>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-base text-theme_color hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Address</label>
                    <p className="mt-1 text-base dark:text-white">{company.address}</p>
                  </div>

                  {/* Industries */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Briefcase size={16} />
                        Industries
                      </label>
                      <button
                        onClick={() => setShowAddIndustryModal(true)}
                        className="text-sm text-theme_color hover:underline flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Industry
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {company.industries?.length > 0 ? (
                        company.industries.map(industry => (
                          <span
                            key={industry.id}
                            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full"
                          >
                            {industry.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No industries added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    No company information available
                  </p>
                  <button
                    onClick={() => setShowAddCompanyModal(true)}
                    className="px-6 py-3 bg-theme_color text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                  >
                    <Plus size={20} />
                    Add Company Details
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status & Activity */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                <Shield className="text-theme_color" size={20} />
                Account Status
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-2">
                    {getStatusBadge(recruiterProfile?.status || 'PENDING')}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Approval Status</label>
                  <div className="mt-2">
                    {recruiterProfile?.isApproved ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                        <CheckCircle size={16} />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                        <AlertCircle size={16} />
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Onboarded</label>
                  <div className="mt-2">
                    {profileData?.onboarded ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        <CheckCircle size={16} />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        <AlertCircle size={16} />
                        No
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status History */}
            {recruiterProfile?.statusLogs && recruiterProfile.statusLogs.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold dark:text-white mb-4">Status History</h2>
                <div className="space-y-4">
                  {recruiterProfile.statusLogs.map((log, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-theme_color pl-4 py-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm dark:text-white">
                          {log.oldStatus} → {log.newStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {log.reason}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onSuccess={() => setReload(prev => !prev)}
      />

      <AddIndustryModal
        isOpen={showAddIndustryModal}
        onClose={() => setShowAddIndustryModal(false)}
        onSuccess={() => setReload(prev => !prev)}
        currentIndustries={company?.industries || []}
      />
    </div>
  );
};

export default RecruiterProfile;