import { useState, useEffect } from 'react';
import {
    Building2, MapPin, Briefcase, Star, Shield, Globe, Users, DollarSign,
    Clock, TrendingUp, Award, Target, Heart, Share2, ExternalLink,
    Calendar, CheckCircle, XCircle, Camera, Video, FileText, ChevronRight,
    ThumbsUp, MessageCircle, Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';

const CompanyDetails = () => {
    const [theme, setTheme] = useState('light');
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedJobCategory, setSelectedJobCategory] = useState('all');
    const [showAllBenefits, setShowAllBenefits] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    setTheme(isDark ? 'dark' : 'light');
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    // Mock company data
    const company = {
        id: '1',
        name: 'Google',
        logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400&h=400&fit=crop',
        cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop',
        tagline: 'Organize the world\'s information and make it universally accessible',
        industry: 'Technology',
        location: { city: 'Mountain View', country: 'USA', region: 'North America' },
        company_size: '10000+',
        founded: 1998,
        website: 'https://www.google.com',
        is_verified: true,
        hiring_status: 'actively_hiring',
        rating: { average: 4.4, reviews_count: 15420 },
        salary_range: '$120k - $250k',
        remote_friendly: true,
        description: 'Google is a multinational technology company that specializes in Internet-related services and products. These include online advertising technologies, search engines, cloud computing, software, and hardware. Google has been a leader in innovation and continues to shape the future of technology.',
        mission: 'Our mission is to organize the world\'s information and make it universally accessible and useful.',
        values: [
            { title: 'Innovation', description: 'We believe in the power of new ideas' },
            { title: 'Collaboration', description: 'Great things happen when we work together' },
            { title: 'User Focus', description: 'Our users are at the heart of everything we do' },
            { title: 'Excellence', description: 'We strive for the highest quality in our work' }
        ],
        stats: [
            { label: 'Employees Worldwide', value: '156,500+' },
            { label: 'Countries', value: '50+' },
            { label: 'Products', value: '100+' },
            { label: 'Daily Active Users', value: '3B+' }
        ],
        benefits: [
            { icon: '🏥', title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
            { icon: '🏖️', title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
            { icon: '💰', title: 'Competitive Salary', description: 'Top of market compensation packages' },
            { icon: '📚', title: 'Learning Budget', description: '$5000 annual learning and development budget' },
            { icon: '🏠', title: 'Remote Work', description: 'Flexible work from anywhere options' },
            { icon: '🍽️', title: 'Free Meals', description: 'Complimentary breakfast, lunch, and dinner' },
            { icon: '🏋️', title: 'Gym Membership', description: 'On-site fitness centers and wellness programs' },
            { icon: '👶', title: 'Parental Leave', description: '18 weeks paid parental leave' },
            { icon: '🚗', title: 'Transportation', description: 'Shuttle services and parking benefits' },
            { icon: '💼', title: 'Stock Options', description: 'RSUs and stock purchase programs' }
        ],
        open_jobs: [
            {
                id: '1',
                title: 'Senior Software Engineer',
                category: 'Engineering',
                location: 'Mountain View, CA',
                type: 'Full-time',
                posted: '2 days ago',
                salary: '$180k - $250k',
                remote: true
            },
            {
                id: '2',
                title: 'Product Manager',
                category: 'Product',
                location: 'San Francisco, CA',
                type: 'Full-time',
                posted: '5 days ago',
                salary: '$150k - $200k',
                remote: false
            },
            {
                id: '3',
                title: 'UX Designer',
                category: 'Design',
                location: 'New York, NY',
                type: 'Full-time',
                posted: '1 week ago',
                salary: '$130k - $180k',
                remote: true
            },
            {
                id: '4',
                title: 'Data Scientist',
                category: 'Engineering',
                location: 'Mountain View, CA',
                type: 'Full-time',
                posted: '3 days ago',
                salary: '$160k - $220k',
                remote: true
            },
            {
                id: '5',
                title: 'Marketing Manager',
                category: 'Marketing',
                location: 'Austin, TX',
                type: 'Full-time',
                posted: '1 day ago',
                salary: '$120k - $160k',
                remote: false
            }
        ],
        reviews: [
            {
                id: '1',
                author: 'Current Employee',
                role: 'Software Engineer',
                rating: 5,
                date: '2 weeks ago',
                title: 'Amazing place to grow your career',
                pros: 'Great work-life balance, innovative projects, supportive team',
                cons: 'Can be bureaucratic at times',
                helpful: 234
            },
            {
                id: '2',
                author: 'Former Employee',
                role: 'Product Manager',
                rating: 4,
                date: '1 month ago',
                title: 'Good compensation and benefits',
                pros: 'Excellent benefits, smart colleagues, impactful work',
                cons: 'High pressure environment',
                helpful: 189
            }
        ],
        social: {
            linkedin: 'https://linkedin.com/company/google',
            twitter: 'https://twitter.com/google',
            facebook: 'https://facebook.com/google',
            instagram: 'https://instagram.com/google'
        }
    };

    const jobCategories = ['all', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales'];

    const filteredJobs = selectedJobCategory === 'all'
        ? company.open_jobs
        : company.open_jobs.filter(job => job.category === selectedJobCategory);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Building2 },
        { id: 'jobs', label: `Jobs (${company.open_jobs.length})`, icon: Briefcase },
        { id: 'reviews', label: `Reviews (${company.reviews.length})`, icon: Star },
        { id: 'benefits', label: 'Benefits', icon: Award }
    ];

    return (
        <div className="min-h-screen bg-[#e7f0fa] dark:bg-gray-950 transition-colors duration-300">

            {/* Cover Image */}
            <div className="relative h-64 md:h-80 bg-teal-600 overflow-hidden">
                <img
                    src={company.cover_image}
                    alt={company.name}
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Company Header */}
                <div className="relative -mt-24 mb-8">
                    <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                        <div className="flex flex-col md:flex-row gap-6">

                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg">
                                    <img
                                        src={company.logo}
                                        alt={company.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                                                {company.name}
                                            </h1>
                                            {company.is_verified && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-theme_color/10 dark:bg-theme_color/10 rounded-full">
                                                    <Shield size={16} className="text-theme_color dark:text-theme_color" />
                                                    <span className="text-sm font-semibold text-theme_color dark:text-theme_color">
                                                        Verified
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-3">
                                            {company.tagline}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                                            <Heart size={20} />
                                        </button>
                                        <button className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span>{company.location.city}, {company.location.country}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Building2 size={16} className="text-slate-400" />
                                        <span>{company.company_size} employees</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span>Founded {company.founded}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Globe size={16} className="text-slate-400" />
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-theme_color dark:hover:text-dark-theme_color">
                                            {company.website.replace('https://', '')}
                                        </a>
                                    </div>
                                </div>

                                {/* Rating and Status */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Star size={18} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                {company.rating.average}
                                            </span>
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            ({company.rating.reviews_count} reviews)
                                        </span>
                                    </div>

                                    {company.hiring_status === 'actively_hiring' && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                                Actively Hiring
                                            </span>
                                        </div>
                                    )}

                                    {company.remote_friendly && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                            <Globe size={14} className="text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                                                Remote Friendly
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {company.stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow text-center">
                            <div className="text-3xl font-extrabold text-theme_color dark:text-dark-theme_color mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-2 mb-8 custom-shadow">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-theme_color text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid lg:grid-cols-3 gap-8 pb-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <>
                                {/* About */}
                                <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                        About {company.name}
                                    </h2>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                        {company.description}
                                    </p>
                                    <div className="bg-theme_color/5 dark:bg-theme_color/10 rounded-xl p-4 border border-theme_color/20">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                            <Target size={20} className="text-theme_color" />
                                            Our Mission
                                        </h3>
                                        <p className="text-slate-700 dark:text-slate-300">
                                            {company.mission}
                                        </p>
                                    </div>
                                </div>

                                {/* Values */}
                                <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                        Our Values
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {company.values.map((value, index) => (
                                            <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                                    {value.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {value.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Benefits Preview */}
                                <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                        Benefits & Perks
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {company.benefits.slice(0, 6).map((benefit, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="text-3xl">{benefit.icon}</div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                        {benefit.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {benefit.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('benefits')}
                                        className="mt-4 text-theme_color dark:text-dark-theme_color font-semibold hover:underline flex items-center gap-1"
                                    >
                                        View all benefits
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Jobs Tab */}
                        {activeTab === 'jobs' && (
                            <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Open Positions
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={20} className="text-theme_color" />
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                                            {filteredJobs.length} jobs
                                        </span>
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {jobCategories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedJobCategory(category)}
                                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${selectedJobCategory === category
                                                ? 'bg-theme_color text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {category === 'all' ? 'All Jobs' : category}
                                        </button>
                                    ))}
                                </div>

                                {/* Job Listings */}
                                <div className="space-y-4">
                                    {filteredJobs.map((job) => (
                                        <div
                                            key={job.id}
                                            className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-theme_color dark:hover:border-dark-theme_color transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-theme_color dark:group-hover:text-dark-theme_color transition-colors mb-1">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium">
                                                            {job.category}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={14} />
                                                            {job.location}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-theme_color dark:text-dark-theme_color mb-1">
                                                        {job.salary}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {job.posted}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg">
                                                    {job.type}
                                                </span>
                                                {job.remote && (
                                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg flex items-center gap-1">
                                                        <Globe size={12} />
                                                        Remote
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                {/* Rating Summary */}
                                <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                        Employee Reviews
                                    </h2>
                                    <div className="flex items-center gap-8 mb-6">
                                        <div className="text-center">
                                            <div className="text-5xl font-extrabold text-theme_color dark:text-dark-theme_color mb-2">
                                                {company.rating.average}
                                            </div>
                                            <div className="flex items-center gap-1 justify-center mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={20}
                                                        className={`${i < Math.floor(company.rating.average)
                                                            ? 'text-yellow-500 fill-yellow-500'
                                                            : 'text-slate-300 dark:text-slate-600'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                {company.rating.reviews_count} reviews
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            {[5, 4, 3, 2, 1].map((rating) => (
                                                <div key={rating} className="flex items-center gap-3 mb-2">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 w-8">
                                                        {rating}★
                                                    </span>
                                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-theme_color"
                                                            style={{ width: `${rating * 20}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Individual Reviews */}
                                {company.reviews.map((review) => (
                                    <div key={review.id} className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {review.author}
                                                    </span>
                                                    <span className="text-slate-500 dark:text-slate-400">•</span>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                                        {review.role}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                className={`${i < review.rating
                                                                    ? 'text-yellow-500 fill-yellow-500'
                                                                    : 'text-slate-300 dark:text-slate-600'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {review.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
                                            {review.title}
                                        </h3>

                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircle size={16} className="text-green-600" />
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        Pros
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 pl-6">
                                                    {review.pros}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <XCircle size={16} className="text-red-600" />
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        Cons
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 pl-6">
                                                    {review.cons}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <button className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-theme_color dark:hover:text-dark-theme_color transition-colors">
                                                <ThumbsUp size={16} />
                                                <span>Helpful ({review.helpful})</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Benefits Tab */}
                        {activeTab === 'benefits' && (
                            <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                    Benefits & Perks
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {company.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <div className="text-4xl">{benefit.icon}</div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                                                    {benefit.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {benefit.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Salary Range */}
                        <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Salary Range
                            </h3>
                            <div className="flex items-center gap-3">
                                <DollarSign size={20} className="text-theme_color dark:text-dark-theme_color" />
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {company.salary_range}
                                </span>
                            </div>
                        </div>
                        {/* Social Links */}
                        <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Connect with Us
                            </h3>
                            <div className="flex items-center gap-4">
                                {company.social.linkedin && (
                                    <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-theme_color dark:hover:text-dark-theme_color transition-colors">
                                        <Linkedin size={24} />
                                    </a>
                                )}
                                {company.social.twitter && (
                                    <a href={company.social.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-theme_color dark:hover:text-dark-theme_color transition-colors">
                                        <Twitter size={24} />
                                    </a>
                                )}
                                {company.social.facebook && (
                                    <a href={company.social.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-theme_color dark:hover:text-dark-theme_color transition-colors">
                                        <Facebook size={24} />
                                    </a>
                                )}
                                {company.social.instagram && (
                                    <a href={company.social.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-theme_color dark:hover:text-dark-theme_color transition-colors">
                                        <Instagram size={24} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default CompanyDetails;