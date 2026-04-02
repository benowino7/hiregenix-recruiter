// src/components/modals/AddCompanyModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Building2, Globe, MapPin, FileText, Loader2, Plus } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';
import ErrorMessage from '../utilities/ErrorMessage';
import Modal from './Modal';


const AddCompanyModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [industries, setIndustries] = useState([]);
    const token = JSON.parse(sessionStorage.getItem('accessToken'))
    const [formData, setFormData] = useState({
        companyName: '',
        registrationNumber: '',
        website: '',
        address: '',
        country: 'KENYA',
        industries: []
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchIndustries();
        }
    }, [isOpen]);

    const fetchIndustries = async () => {
        try {
            const response = await fetch(`${BASE_URL}/public/industries/taxonomy`);
            const data = await response.json();
            if (!response.ok || data.error) {
                ErrorMessage(data?.message || 'Failed to fetch industries');
                return;
            }
            const items = [];
            for (const group of data.result || []) {
                for (const ind of group.industries || []) {
                    items.push({ id: ind.id, name: ind.name });
                }
            }
            items.sort((a, b) => a.name.localeCompare(b.name));
            setIndustries(items);
        } catch (error) {
            console.error('Error fetching industries:', error);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }
        if (!formData.registrationNumber.trim()) {
            newErrors.registrationNumber = 'Registration number is required';
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }
        if (formData.industries.length === 0) {
            newErrors.industries = 'Please select at least one industry';
        }
        if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
            newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        const token = JSON.parse(sessionStorage.getItem('accessToken'));

        try {
            const response = await fetch(`${BASE_URL}/recruiter/company`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add company');
            }

            if (data.status === 'SUCCESS') {
                onSuccess();
                onClose();
            } else {
                throw new Error(data.message || 'Failed to add company');
            }
        } catch (error) {
            setErrors({ submit: error.message || 'An error occurred while adding company' });
        } finally {
            setLoading(false);
        }
    };

    const handleIndustryToggle = (industryId) => {
        setFormData(prev => ({
            ...prev,
            industries: prev.industries.includes(industryId)
                ? prev.industries.filter(id => id !== industryId)
                : [...prev.industries, industryId]
        }));
        setErrors(prev => ({ ...prev, industries: null }));
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onClose()}
            title={'Add Company Details'}
            subtitle="Fill in the details to create the Company Profile"
            size="xl"
        >
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Company Name */}
                <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                        Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, companyName: e.target.value }));
                                setErrors(prev => ({ ...prev, companyName: null }));
                            }}
                            className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.companyName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-theme_color`}
                            placeholder="e.g., Flyance Systems"
                        />
                    </div>
                    {errors.companyName && (
                        <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                    )}
                </div>

                {/* Registration Number */}
                <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                        Registration Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={formData.registrationNumber}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, registrationNumber: e.target.value }));
                                setErrors(prev => ({ ...prev, registrationNumber: null }));
                            }}
                            className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.registrationNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-theme_color`}
                            placeholder="e.g., PVT-SIU821"
                        />
                    </div>
                    {errors.registrationNumber && (
                        <p className="mt-1 text-sm text-red-500">{errors.registrationNumber}</p>
                    )}
                </div>

                {/* Website */}
                <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                        Website
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={formData.website}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, website: e.target.value }));
                                setErrors(prev => ({ ...prev, website: null }));
                            }}
                            className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.website ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-theme_color`}
                            placeholder="https://example.com"
                        />
                    </div>
                    {errors.website && (
                        <p className="mt-1 text-sm text-red-500">{errors.website}</p>
                    )}
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                        Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <textarea
                            value={formData.address}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, address: e.target.value }));
                                setErrors(prev => ({ ...prev, address: null }));
                            }}
                            rows={3}
                            className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-theme_color resize-none`}
                            placeholder="e.g., PO BOX 23-00100"
                        />
                    </div>
                    {errors.address && (
                        <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                    )}
                </div>

                {/* Country */}
                <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                        Country <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme_color"
                    >
                        <option value="KENYA">Kenya</option>
                        <option value="UGANDA">Uganda</option>
                        <option value="TANZANIA">Tanzania</option>
                        <option value="RWANDA">Rwanda</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                {/* Industries */}
                <div>
                    <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                        Industries <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        {industries.map(industry => (
                            <label
                                key={industry.id}
                                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.industries.includes(industry.id)}
                                    onChange={() => handleIndustryToggle(industry.id)}
                                    className="w-4 h-4 rounded text-theme_color focus:ring-theme_color"
                                />
                                <span className="text-sm dark:text-gray-300">{industry.name}</span>
                            </label>
                        ))}
                    </div>
                    {errors.industries && (
                        <p className="mt-1 text-sm text-red-500">{errors.industries}</p>
                    )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <p className="text-sm text-red-800 dark:text-red-400">{errors.submit}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-theme_color hover:bg-theme_color/90 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus size={20} />
                                Add Company
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddCompanyModal;