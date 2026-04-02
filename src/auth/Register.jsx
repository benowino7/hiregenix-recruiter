// src/pages/Register.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, Users, ArrowRight, ArrowLeft, Sparkles, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../BaseUrl';
import ErrorMessage from '../utilities/ErrorMessage';
import successMessage from '../utilities/successMessage';
import PolicyModal from '../components/PolicyModal';

const countries = [
    { name: "Afghanistan", code: "AF", phone: "+93" },
    { name: "Albania", code: "AL", phone: "+355" },
    { name: "Algeria", code: "DZ", phone: "+213" },
    { name: "Andorra", code: "AD", phone: "+376" },
    { name: "Angola", code: "AO", phone: "+244" },
    { name: "Antigua and Barbuda", code: "AG", phone: "+1-268" },
    { name: "Argentina", code: "AR", phone: "+54" },
    { name: "Armenia", code: "AM", phone: "+374" },
    { name: "Australia", code: "AU", phone: "+61" },
    { name: "Austria", code: "AT", phone: "+43" },
    { name: "Azerbaijan", code: "AZ", phone: "+994" },
    { name: "Bahamas", code: "BS", phone: "+1-242" },
    { name: "Bahrain", code: "BH", phone: "+973" },
    { name: "Bangladesh", code: "BD", phone: "+880" },
    { name: "Barbados", code: "BB", phone: "+1-246" },
    { name: "Belarus", code: "BY", phone: "+375" },
    { name: "Belgium", code: "BE", phone: "+32" },
    { name: "Belize", code: "BZ", phone: "+501" },
    { name: "Benin", code: "BJ", phone: "+229" },
    { name: "Bhutan", code: "BT", phone: "+975" },
    { name: "Bolivia", code: "BO", phone: "+591" },
    { name: "Bosnia and Herzegovina", code: "BA", phone: "+387" },
    { name: "Botswana", code: "BW", phone: "+267" },
    { name: "Brazil", code: "BR", phone: "+55" },
    { name: "Brunei", code: "BN", phone: "+673" },
    { name: "Bulgaria", code: "BG", phone: "+359" },
    { name: "Burkina Faso", code: "BF", phone: "+226" },
    { name: "Burundi", code: "BI", phone: "+257" },
    { name: "Cambodia", code: "KH", phone: "+855" },
    { name: "Cameroon", code: "CM", phone: "+237" },
    { name: "Canada", code: "CA", phone: "+1" },
    { name: "Cape Verde", code: "CV", phone: "+238" },
    { name: "Central African Republic", code: "CF", phone: "+236" },
    { name: "Chad", code: "TD", phone: "+235" },
    { name: "Chile", code: "CL", phone: "+56" },
    { name: "China", code: "CN", phone: "+86" },
    { name: "Colombia", code: "CO", phone: "+57" },
    { name: "Comoros", code: "KM", phone: "+269" },
    { name: "Congo", code: "CG", phone: "+242" },
    { name: "Costa Rica", code: "CR", phone: "+506" },
    { name: "Croatia", code: "HR", phone: "+385" },
    { name: "Cuba", code: "CU", phone: "+53" },
    { name: "Cyprus", code: "CY", phone: "+357" },
    { name: "Czech Republic", code: "CZ", phone: "+420" },
    { name: "Denmark", code: "DK", phone: "+45" },
    { name: "Djibouti", code: "DJ", phone: "+253" },
    { name: "Dominica", code: "DM", phone: "+1-767" },
    { name: "Dominican Republic", code: "DO", phone: "+1-809" },
    { name: "Ecuador", code: "EC", phone: "+593" },
    { name: "Egypt", code: "EG", phone: "+20" },
    { name: "El Salvador", code: "SV", phone: "+503" },
    { name: "Equatorial Guinea", code: "GQ", phone: "+240" },
    { name: "Eritrea", code: "ER", phone: "+291" },
    { name: "Estonia", code: "EE", phone: "+372" },
    { name: "Eswatini", code: "SZ", phone: "+268" },
    { name: "Ethiopia", code: "ET", phone: "+251" },
    { name: "Fiji", code: "FJ", phone: "+679" },
    { name: "Finland", code: "FI", phone: "+358" },
    { name: "France", code: "FR", phone: "+33" },
    { name: "Gabon", code: "GA", phone: "+241" },
    { name: "Gambia", code: "GM", phone: "+220" },
    { name: "Georgia", code: "GE", phone: "+995" },
    { name: "Germany", code: "DE", phone: "+49" },
    { name: "Ghana", code: "GH", phone: "+233" },
    { name: "Greece", code: "GR", phone: "+30" },
    { name: "Guatemala", code: "GT", phone: "+502" },
    { name: "Guinea", code: "GN", phone: "+224" },
    { name: "Guyana", code: "GY", phone: "+592" },
    { name: "Haiti", code: "HT", phone: "+509" },
    { name: "Honduras", code: "HN", phone: "+504" },
    { name: "Hungary", code: "HU", phone: "+36" },
    { name: "Iceland", code: "IS", phone: "+354" },
    { name: "India", code: "IN", phone: "+91" },
    { name: "Indonesia", code: "ID", phone: "+62" },
    { name: "Iran", code: "IR", phone: "+98" },
    { name: "Iraq", code: "IQ", phone: "+964" },
    { name: "Ireland", code: "IE", phone: "+353" },
    { name: "Israel", code: "IL", phone: "+972" },
    { name: "Italy", code: "IT", phone: "+39" },
    { name: "Jamaica", code: "JM", phone: "+1-876" },
    { name: "Japan", code: "JP", phone: "+81" },
    { name: "Jordan", code: "JO", phone: "+962" },
    { name: "Kenya", code: "KE", phone: "+254" },
    { name: "Kuwait", code: "KW", phone: "+965" },
    { name: "Kyrgyzstan", code: "KG", phone: "+996" },
    { name: "Laos", code: "LA", phone: "+856" },
    { name: "Latvia", code: "LV", phone: "+371" },
    { name: "Lebanon", code: "LB", phone: "+961" },
    { name: "Lesotho", code: "LS", phone: "+266" },
    { name: "Liberia", code: "LR", phone: "+231" },
    { name: "Libya", code: "LY", phone: "+218" },
    { name: "Lithuania", code: "LT", phone: "+370" },
    { name: "Luxembourg", code: "LU", phone: "+352" },
    { name: "Madagascar", code: "MG", phone: "+261" },
    { name: "Malawi", code: "MW", phone: "+265" },
    { name: "Malaysia", code: "MY", phone: "+60" },
    { name: "Maldives", code: "MV", phone: "+960" },
    { name: "Mali", code: "ML", phone: "+223" },
    { name: "Malta", code: "MT", phone: "+356" },
    { name: "Mauritania", code: "MR", phone: "+222" },
    { name: "Mauritius", code: "MU", phone: "+230" },
    { name: "Mexico", code: "MX", phone: "+52" },
    { name: "Moldova", code: "MD", phone: "+373" },
    { name: "Mongolia", code: "MN", phone: "+976" },
    { name: "Morocco", code: "MA", phone: "+212" },
    { name: "Mozambique", code: "MZ", phone: "+258" },
    { name: "Myanmar", code: "MM", phone: "+95" },
    { name: "Namibia", code: "NA", phone: "+264" },
    { name: "Nepal", code: "NP", phone: "+977" },
    { name: "Netherlands", code: "NL", phone: "+31" },
    { name: "New Zealand", code: "NZ", phone: "+64" },
    { name: "Nicaragua", code: "NI", phone: "+505" },
    { name: "Niger", code: "NE", phone: "+227" },
    { name: "Nigeria", code: "NG", phone: "+234" },
    { name: "North Macedonia", code: "MK", phone: "+389" },
    { name: "Norway", code: "NO", phone: "+47" },
    { name: "Oman", code: "OM", phone: "+968" },
    { name: "Pakistan", code: "PK", phone: "+92" },
    { name: "Palestine", code: "PS", phone: "+970" },
    { name: "Panama", code: "PA", phone: "+507" },
    { name: "Paraguay", code: "PY", phone: "+595" },
    { name: "Peru", code: "PE", phone: "+51" },
    { name: "Philippines", code: "PH", phone: "+63" },
    { name: "Poland", code: "PL", phone: "+48" },
    { name: "Portugal", code: "PT", phone: "+351" },
    { name: "Qatar", code: "QA", phone: "+974" },
    { name: "Romania", code: "RO", phone: "+40" },
    { name: "Russia", code: "RU", phone: "+7" },
    { name: "Rwanda", code: "RW", phone: "+250" },
    { name: "Saudi Arabia", code: "SA", phone: "+966" },
    { name: "Senegal", code: "SN", phone: "+221" },
    { name: "Serbia", code: "RS", phone: "+381" },
    { name: "Sierra Leone", code: "SL", phone: "+232" },
    { name: "Singapore", code: "SG", phone: "+65" },
    { name: "Slovakia", code: "SK", phone: "+421" },
    { name: "Slovenia", code: "SI", phone: "+386" },
    { name: "Somalia", code: "SO", phone: "+252" },
    { name: "South Africa", code: "ZA", phone: "+27" },
    { name: "South Sudan", code: "SS", phone: "+211" },
    { name: "Spain", code: "ES", phone: "+34" },
    { name: "Sri Lanka", code: "LK", phone: "+94" },
    { name: "Sudan", code: "SD", phone: "+249" },
    { name: "Sweden", code: "SE", phone: "+46" },
    { name: "Switzerland", code: "CH", phone: "+41" },
    { name: "Syria", code: "SY", phone: "+963" },
    { name: "Taiwan", code: "TW", phone: "+886" },
    { name: "Tanzania", code: "TZ", phone: "+255" },
    { name: "Thailand", code: "TH", phone: "+66" },
    { name: "Togo", code: "TG", phone: "+228" },
    { name: "Trinidad and Tobago", code: "TT", phone: "+1-868" },
    { name: "Tunisia", code: "TN", phone: "+216" },
    { name: "Turkey", code: "TR", phone: "+90" },
    { name: "Uganda", code: "UG", phone: "+256" },
    { name: "Ukraine", code: "UA", phone: "+380" },
    { name: "United Arab Emirates", code: "AE", phone: "+971" },
    { name: "United Kingdom", code: "GB", phone: "+44" },
    { name: "United States", code: "US", phone: "+1" },
    { name: "Uruguay", code: "UY", phone: "+598" },
    { name: "Venezuela", code: "VE", phone: "+58" },
    { name: "Vietnam", code: "VN", phone: "+84" },
    { name: "Yemen", code: "YE", phone: "+967" },
    { name: "Zambia", code: "ZM", phone: "+260" },
    { name: "Zimbabwe", code: "ZW", phone: "+263" }
];

const Register = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: '',
        password: '',
        confirmPassword: '',
        agree: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [showTerms, setShowTerms] = useState(false);
    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!form.firstName.trim()) newErrors.firstName = "First name is required";
            if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
            if (!form.email) newErrors.email = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
            if (!form.phone.trim()) newErrors.phone = "Phone number is required";
            if (!form.countryCode) newErrors.countryCode = "Country is required";
        }

        if (step === 2) {
            if (!form.password) newErrors.password = "Password is required";
            else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
            if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
            if (!form.agree) newErrors.agree = "You must agree to the terms";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (validateStep(2)) {
            const formDatajson = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                phoneNumber: form.phone.trim(),
                countryCode: form.countryCode,
                password: form.password,
                role: "RECRUITER"
            };

            try {
                const response = await fetch(`${BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formDatajson),
                });

                const data = await response.json();

                if (!response.ok) {
                    ErrorMessage(data?.message || data?.errors?.[0]?.message || 'Registration failed');
                    setIsLoading(false);
                    return;
                }

                successMessage(data?.message || 'Registration successful! Redirecting...');

                if (data?.data?.token) {
                    sessionStorage.setItem('accessToken', JSON.stringify(data.data.token));
                }
                if (data?.data) {
                    sessionStorage.setItem('user', JSON.stringify(data.data));
                }

                navigate('/dashboard', { replace: true });

            } catch (error) {
                console.error('Registration error:', error);
                ErrorMessage('Something went wrong. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    const handleCountryChange = (e) => {
        const code = e.target.value;
        setForm({ ...form, countryCode: code });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                <div className="grid md:grid-cols-2 gap-0 bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">

                    {/* Left Side - Branding & Features */}
                    <div className="bg-theme_color/90 dark:bg-dark-theme_color p-12 flex-col justify-center text-white hidden md:flex">
                        <div className="mb-12">
                            <h1 className="text-4xl font-bold mb-4">
                                Welcome to TalentHub
                            </h1>
                            <p className="text-teal-100 text-lg">
                                Join thousands of companies finding exceptional talent
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Access Top Talent</h3>
                                    <p className="text-teal-100 text-sm">Connect with pre-vetted candidates ready to join your team</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Streamlined Hiring</h3>
                                    <p className="text-teal-100 text-sm">Reduce your time-to-hire by up to 60% with our platform</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">AI-Powered Matching</h3>
                                    <p className="text-teal-100 text-sm">Smart recommendations to find the perfect candidate fit</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="p-8 md:p-12">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Create Account
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {currentStep === 1
                                    ? "Let's get started with your information"
                                    : "Secure your account with a password"
                                }
                            </p>

                            {/* Step Indicator */}
                            <div className="flex items-center gap-2 mt-6">
                                <div className={`h-1 flex-1 rounded-full transition-colors ${currentStep >= 1 ? 'bg-theme_color/90' : 'bg-gray-200 dark:bg-gray-700'
                                    }`} />
                                <div className={`h-1 flex-1 rounded-full transition-colors ${currentStep >= 2 ? 'bg-theme_color/90' : 'bg-gray-200 dark:bg-gray-700'
                                    }`} />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Personal Info */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={form.firstName}
                                                onChange={e => setForm({ ...form, firstName: e.target.value })}
                                                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.firstName
                                                    ? 'border-red-500'
                                                    : 'border-gray-300 dark:border-gray-700'
                                                    } rounded-lg focus:border-theme_color focus:dark:border-theme_color outline-none text-gray-900 dark:text-white transition`}
                                                placeholder="John"
                                            />
                                            {errors.firstName && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={form.lastName}
                                                onChange={e => setForm({ ...form, lastName: e.target.value })}
                                                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.lastName
                                                    ? 'border-red-500'
                                                    : 'border-gray-300 dark:border-gray-700'
                                                    } rounded-lg focus:border-theme_color focus:dark:border-theme_color outline-none text-gray-900 dark:text-white transition`}
                                                placeholder="Doe"
                                            />
                                            {errors.lastName && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Work Email
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value.trim() })}
                                            className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.email
                                                ? 'border-red-500'
                                                : 'border-gray-300 dark:border-gray-700'
                                                } rounded-lg focus:border-theme_color focus:dark:border-theme_color outline-none text-gray-900 dark:text-white transition`}
                                            placeholder="john.doe@company.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Country
                                            </label>
                                            <select
                                                value={form.countryCode}
                                                onChange={handleCountryChange}
                                                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.countryCode
                                                    ? 'border-red-500'
                                                    : 'border-gray-300 dark:border-gray-700'
                                                    } rounded-lg focus:border-theme_color focus:dark:border-theme_color outline-none text-gray-900 dark:text-white transition`}
                                            >
                                                <option value="">Select</option>
                                                {countries.map(c => (
                                                    <option key={c.code} value={c.phone}>
                                                        {c.name} ({c.phone})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.countryCode && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.countryCode}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                {form.countryCode && (
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                                        {form.countryCode}
                                                    </span>
                                                )}
                                                <input
                                                    type="tel"
                                                    value={form.phone}
                                                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                                                    className={`w-full ${form.countryCode ? 'pl-16' : 'pl-4'} pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.phone
                                                        ? 'border-red-500'
                                                        : 'border-gray-300 dark:border-gray-700'
                                                        } rounded-lg focus:border-theme_color focus:dark:border-theme_color outline-none text-gray-900 dark:text-white transition`}
                                                    placeholder="76543210"
                                                    maxLength={10}
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Password */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.password
                                                    ? 'border-red-500'
                                                    : 'border-gray-300 dark:border-gray-700'
                                                    } rounded-lg focus:border-theme_color focus:dark:border-theme_color outline-none text-gray-900 dark:text-white transition pr-12`}
                                                placeholder="Min. 8 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                value={form.confirmPassword}
                                                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.confirmPassword
                                                    ? 'border-red-500'
                                                    : 'border-gray-300 dark:border-gray-700'
                                                    } rounded-lg focus:border-theme_color focus:dark:border-theme_color outline-none text-gray-900 dark:text-white transition pr-12`}
                                                placeholder="Re-enter password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                            >
                                                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-3 mt-2">
                                        <input
                                            type="checkbox"
                                            id="agree"
                                            checked={form.agree}
                                            onChange={e => setForm({ ...form, agree: e.target.checked })}
                                            className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                                        />
                                        <label htmlFor="agree" className="text-sm text-gray-600 dark:text-gray-400">
                                            I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-teal-600 dark:text-teal-400 hover:underline">Terms of Use</button>
                                        </label>
                                    </div>
                                    {errors.agree && <p className="text-sm text-red-600 dark:text-red-400 -mt-1">{errors.agree}</p>}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 mt-8">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft size={18} />
                                        Back
                                    </button>
                                )}

                                {currentStep < 2 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex-1 px-6 py-3 bg-theme_color/90 hover:bg-dark-theme_color text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30"
                                        disabled={isLoading}
                                    >
                                        Continue
                                        <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-theme_color/90 hover:bg-dark-theme_color text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            'Creating Account...'
                                        ) : (
                                            <>
                                                Create Account
                                                <CheckCircle size={18} />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>

                        <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-teal-600 hover:text-teal-700 dark:text-teal-500 dark:hover:text-teal-400 font-medium transition">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <PolicyModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        </div>
    );
};

export default Register;