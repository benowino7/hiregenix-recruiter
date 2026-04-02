// Pricing.jsx
import React from 'react';
import { Check, X, Crown, Star, Zap, ArrowRight, Sparkles, Shield, Gem } from 'lucide-react';

const plans = [
    {
        name: 'Package 1',
        subtitle: 'Single Job Posting',
        price: 99,
        interval: 'one-time',
        trial: null,
        gradient: 'from-slate-400 to-slate-600',
        cardBg: 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
        popular: false,
        icon: Shield,
        description: 'Post a single job vacancy',
        features: [
            { text: '1 job posting', included: true },
            { text: 'Full application management', included: true },
            { text: 'AI candidate suggestions', included: true },
            { text: 'Email support', included: true },
            { text: 'AI candidate rankings', included: false },
            { text: 'AI resume screening', included: false },
            { text: 'Bulk job upload', included: false },
        ],
    },
    {
        name: 'Package 2',
        subtitle: '3 Job Postings',
        price: 240,
        interval: 'one-time',
        trial: null,
        gradient: 'from-amber-400 via-yellow-500 to-teal-500',
        cardBg: 'bg-gradient-to-br from-amber-50 to-teal-100 dark:from-amber-950 dark:to-orange-950',
        popular: true,
        icon: Crown,
        description: 'Best value for growing teams',
        features: [
            { text: '3 job postings', included: true },
            { text: 'Full application management', included: true },
            { text: 'AI-powered candidate suggestions', included: true },
            { text: 'Chat & email support', included: true },
            { text: 'AI candidate rankings', included: true },
            { text: 'AI application analysis', included: true },
            { text: 'Bulk job upload', included: false },
        ],
    },
    {
        name: 'Package 3',
        subtitle: '5 Job Postings',
        price: 350,
        interval: 'one-time',
        trial: null,
        gradient: 'from-purple-500 via-indigo-500 to-blue-600',
        cardBg: 'bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950 dark:to-indigo-950',
        popular: false,
        icon: Sparkles,
        description: 'For active hiring teams',
        features: [
            { text: '5 job postings', included: true },
            { text: 'Full application management', included: true },
            { text: 'AI + priority matching', included: true },
            { text: 'VIP phone + account mgr', included: true },
            { text: 'AI candidate rankings', included: true },
            { text: 'AI resume screening', included: true },
            { text: 'Bulk job upload', included: true },
        ],
    },
    {
        name: 'Package 4',
        subtitle: 'Unlimited Job Postings',
        price: 9900,
        interval: 'year',
        trial: null,
        gradient: 'from-cyan-400 via-sky-500 to-blue-600',
        cardBg: 'bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-cyan-950 dark:to-sky-950',
        popular: false,
        icon: Gem,
        description: 'Enterprise-level hiring',
        features: [
            { text: 'Unlimited job postings', included: true },
            { text: 'Full application management', included: true },
            { text: 'AI + priority matching', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'AI candidate rankings', included: true },
            { text: 'AI resume screening', included: true },
            { text: 'Unlimited bulk upload', included: true },
        ],
    },
];

function Pricing() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header Section */}
                <div className="text-center mb-12 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-200 dark:border-purple-800 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Job Posting Packages</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent leading-tight">
                        Choose Your Package
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Post jobs, screen candidates with AI, and hire top talent in Dubai & UAE
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-16">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const displayPrice = plan.price.toLocaleString();

                        return (
                            <div
                                key={plan.name}
                                className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 group flex flex-col ${plan.popular
                                        ? 'shadow-2xl shadow-amber-500/20 dark:shadow-amber-500/30 ring-2 ring-amber-400/50'
                                        : 'shadow-xl hover:shadow-2xl'
                                    }`}
                            >
                                <div className={`absolute inset-0 ${plan.cardBg} backdrop-blur-xl`}></div>
                                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-teal-500 text-white text-[11px] font-bold py-1.5 text-center z-10">
                                        BEST VALUE
                                    </div>
                                )}

                                <div className={`relative ${plan.popular ? 'pt-10' : 'pt-6'} px-5 pb-6 flex flex-col flex-1`}>

                                    <div className="flex items-center gap-2.5 mb-1">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{plan.name}</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-theme_color dark:text-teal-400 mb-1 ml-[52px]">{plan.subtitle}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 ml-[52px]">{plan.description}</p>

                                    <div className="mb-5">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-3xl font-extrabold bg-gradient-to-br ${plan.gradient} bg-clip-text text-transparent`}>
                                                ${displayPrice}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {plan.interval === 'year' ? '/year' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                            What's included
                                        </p>
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-[13px]">
                                                    {feature.included ? (
                                                        <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <X className="w-2.5 h-2.5 text-gray-400 dark:text-gray-600" />
                                                        </div>
                                                    )}
                                                    <span className={`leading-snug break-words ${feature.included
                                                            ? 'text-gray-700 dark:text-gray-300'
                                                            : 'text-gray-400 dark:text-gray-600 line-through'
                                                        }`}>
                                                        {feature.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <a
                                        href={`/register?plan=${plan.name.toLowerCase()}`}
                                        className={`w-full mt-5 py-3 px-4 rounded-xl font-bold text-center text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn ${plan.popular
                                                ? 'bg-gradient-to-r from-amber-500 to-teal-500 text-white hover:from-amber-600 hover:to-teal-600'
                                                : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-xl`
                                            }`}
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Indicators */}
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-center text-base font-semibold text-gray-900 dark:text-white mb-5">
                            Join thousands of recruiters hiring top talent
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Secure Payments</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">256-bit SSL encryption</p>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Cancel Anytime</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">No long-term commitment</p>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
                                    <Star className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">24/7 Support</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">We're here to help</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
        </div>
    );
}

export default Pricing;
