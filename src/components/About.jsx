import { useState, useEffect } from 'react';
import {
    Briefcase, Building2, Users, Target, Award, TrendingUp,
    Heart, Globe, CheckCircle, Zap, Shield, Sparkles,
    ArrowRight, Star, MapPin, Clock, ChevronRight, UserPlus
} from 'lucide-react';
import partner1 from '../assets/nio.png';
import partner2 from '../assets/ensigma.png';
const About = () => {
    const [theme, setTheme] = useState('light');

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

    const features = [
        {
            icon: '👤',
            title: 'Cost Effective',
            description: 'Whether you choose to post your jobs directly or have them indexed automatically, our pricing model is highly competitive and cost-effective.'
        },
        {
            icon: '👤',
            title: 'Easy to Use',
            description: 'We have created a streamlined user interface so you can easily manage your jobs and candidates.'
        },
        {
            icon: '👤',
            title: 'Quality Candidate',
            description: 'Irrespective of your organization\'s size, we have a large pool of candidates with diverse skill sets and experience levels.'
        }
    ];

    const stats = [
        { icon: Briefcase, label: 'Live Jobs', value: '0', color: 'text-theme_color' },
        { icon: Building2, label: 'Companies', value: '64682', color: 'text-theme_color' },
        { icon: Users, label: 'Candidates', value: '3167', color: 'text-theme_color' }
    ];

    const partners = [
        { name: 'NIO', logo: partner1 },
        { name: 'ENSIGMA TECHNOLOGIES', logo: partner2 },
        { name: 'NIO', logo: partner1 },
        { name: 'ENSIGMA TECHNOLOGIES', logo: partner2 },
    ];

    const teamImages = [
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=300&fit=crop'
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">

            {/* Who We Are Section */}
            <div className="bg-white dark:bg-gray-950 py-16 md:py-24">
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-8 md:flex-row md:space-x-12 space-y-12 md:space-y-0">

                        <div className="md:w-3/5">
                            <div className="mb-6">
                                <span className="text-theme_color font-semibold text-sm uppercase tracking-wide">
                                    Who we are
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                                We're a highly skilled and professionals team.
                            </h2>

                            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                At HireGeniX, we're more than just a job portal; we're your partner in career success. Our dedicated team is committed to revolutionizing the job search experience.
                            </p>

                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                We believe in connecting talent with opportunity, ensuring that every individual finds meaningful work, and every employer discovers exceptional talent. With a passion for excellence, we strive to make the job market accessible, transparent, and rewarding for all. Join us on this journey as we shape the future of employment.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={index} className="w-full flex flex-row gap-6">
                                        <div className="w-12 h-12 mx-auto mb-3 bg-theme_color/10 rounded-lg flex items-center justify-center">
                                            <Icon size={24} className="text-theme_color" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center items-center">
                                            <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                                {stat.value}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                {stat.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {/* Why Choose Section */}
            <div className="bg-[#f5f5f5] dark:bg-slate-800 py-16">
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                            Why Choose <span className="text-theme_color">HireGeniX</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="text-center"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#FFA500]/20 rounded-full flex items-center justify-center text-3xl">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-slate-700 dark:text-slate-300 mb-4">
                            Have a question ?
                        </p>
                        <a href="#" className="text-theme_color hover:underline font-medium">
                            Contact us
                        </a>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="bg-white dark:bg-gray-950 py-16">
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">

                        <div>
                            <div className="mb-6">
                                <span className="text-theme_color font-semibold text-sm uppercase tracking-wide">
                                    Our Mission
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                                We're a highly professionals team
                            </h2>

                            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                At HireGeniX, our mission is to empower individuals and organizations to achieve their full potential by connecting talent with opportunity. We believe that every person deserves meaningful work, and every employer deserves exceptional talent.
                            </p>

                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                We are dedicated to delivering quality connections. We strive for excellence in matching talent to the right opportunities, resulting in long-lasting, fulfilling employment relationships.
                            </p>
                        </div>

                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                                alt="Team collaboration"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* Trusted Partners */}
            <div className="bg-white dark:bg-gray-950 py-12">
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center items-center gap-12">
                        {partners.map((partner, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="w-8 h-8 rounded"
                                    style={{ backgroundColor: partner.color }}
                                />
                                <img className='w-[120px] h-[80px] object-contain' src={partner?.logo} alt={partner?.name} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Images Section */}
            <div className="bg-white dark:bg-gray-950 py-16">
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <img
                                src={teamImages[0]}
                                alt="Team member"
                                className="w-full h-80 object-cover rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-1 space-y-6">
                            <img
                                src={teamImages[1]}
                                alt="Team member"
                                className="w-full h-64 object-cover rounded-lg"
                            />
                            <img
                                src={teamImages[3]}
                                alt="Team collaboration"
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <img
                                src={teamImages[2]}
                                alt="Team member"
                                className="w-full h-80 object-cover rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-[#f5f5f5] dark:bg-slate-800 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Join Our Talent Network
                    </h2>
                    <p className='mb-8 w-full lg:w-3/4 text-center mx-auto text-slate-900 dark:text-white'>Unlock endless opportunities and connect with top employers. Let your skills shine and land your dream job.</p>
                    <button className="px-8 py-3 bg-theme_color text-white rounded-lg font-semibold hover:bg-theme_color/90 transition-all">
                        Get Started
                    </button>
                </div>
            </div>

        </div>
    );
};

export default About;