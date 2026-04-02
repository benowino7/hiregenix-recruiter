// src/components/recruiter/PublishJob.jsx
import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';
import Modal from './Modal';
import successMessage from '../utilities/successMessage';
import ErrorMessage from '../utilities/ErrorMessage';
import UpgradeModal from './UpgradeModal';

const PublishJob = ({ job, isOpen, onClose, setReload }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [upgradeModal, setUpgradeModal] = useState({ open: false, message: "" });
    const token = JSON.parse(sessionStorage.getItem('accessToken'))
    const handlePublish = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/recruiter/job/${job.id}/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 403) {
                const errData = await response.json().catch(() => ({}));
                if (errData.result?.requiresUpgrade) {
                    setUpgradeModal({ open: true, message: errData.message || "" });
                    setLoading(false);
                    return;
                }
            }

            const data = await response.json();

            if (!response.ok) {
                ErrorMessage(data.message || 'Failed to publish job')
                throw new Error(data.message || 'Failed to publish job');
            }

            if (data.status === 'SUCCESS') {
                successMessage(data?.message || 'Job Published Successfully')
                setReload(prev => !prev)
                onClose()
            } else {
                ErrorMessage(data.message || 'Failed to publish job')
                throw new Error(data.message || 'Failed to publish job');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while publishing the job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <Modal
            isOpen={isOpen}
            onClose={() => onClose(false)}
            title={`Publish Job`}
            subtitle="Your job posting Will be live and visible to candidates upon publishing"
            size="lg"
        >


            {/* Job Details Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-theme_color/90 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {job.company?.name?.substring(0, 2).toUpperCase() || 'JB'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                            {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {job.company?.name}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                                {job.employmentType}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">
                                {job.vacancies} {job.vacancies === 1 ? 'vacancy' : 'vacancies'}
                            </span>
                            {job.isRemote && (
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">
                                    Remote
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning/Info Message */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                    <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                            Ready to go live?
                        </h4>
                        <p className="text-sm text-amber-800 dark:text-amber-400">
                            Publishing this job will make it visible to all candidates on the platform.
                            Make sure all details are correct before proceeding.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                        <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h4 className="font-semibold text-red-900 dark:text-red-300 mb-1">
                                Publishing Failed
                            </h4>
                            <p className="text-sm text-red-800 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
                {onClose && (
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handlePublish}
                    disabled={loading}
                    className="px-6 py-3 bg-theme_color hover:bg-theme_color/90 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Publishing...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            Publish Job
                        </>
                    )}
                </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Once published, you can pause or close this job posting at any time from your dashboard.
                </p>
            </div>
        </Modal>

        <UpgradeModal
            open={upgradeModal.open}
            onClose={() => setUpgradeModal({ open: false, message: "" })}
            feature="Job Publishing"
            message={upgradeModal.message}
        />
        </>
    );
};

export default PublishJob;