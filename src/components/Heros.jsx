import { useState } from 'react';
import { ArrowRight, TrendingUp, Building2, Search, MapPin, Sparkles, Briefcase } from 'lucide-react';
import dubaiVideo from '../assets/video.mp4';
import dashboardMockup from '../assets/herobg.png';

const Heros = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    const q = searchTerm.trim();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (q) params.set("aiSearch", "true");
    window.location.href = `/joblisting?${params.toString()}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const locations = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Remote', 'UAE'];

  return (
    <section id='home' className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-gray-900 text-white pt-10 md:pt-0">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-90"
          src={dubaiVideo}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/70" />
        <div className="absolute top-20 -left-20 w-96 h-96 bg-theme_color/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      {/* Floating Stats */}
      <div className="absolute top-16 right-6 lg:right-12 z-20 hidden md:block animate-float">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme_color/90 rounded-xl">
              <TrendingUp className="text-white" size={22} />
            </div>
            <div>
              <p className="text-white font-bold text-xl">AI-Powered</p>
              <p className="text-slate-300 text-sm">Candidate Screening</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - split layout */}
      <div className="relative z-10 max-w-[90rem] mx-auto px-5 sm:px-8 py-8 lg:py-0 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* LEFT: Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-4 sm:mb-6 lg:mb-8 animate-fade-in mx-auto lg:mx-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-white font-medium text-xs sm:text-sm md:text-base">AI-Powered Recruitment — Trusted by Top Hiring Teams</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 animate-fade-in-up">
              Stop Screening.{' '}
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-teal-400">
                Let AI Find{' '}
              </span>
              Your Perfect Hire
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-slate-200 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up delay-200">
              Our AI extracts candidate skills from CVs, scores every applicant against your job requirements, and ranks them by fit — so you interview the best, not the most.
            </p>

            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3 mb-8 animate-fade-in-up delay-300 max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search jobs: finance, developer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:bg-white/20 focus:border-theme_color focus:outline-none transition text-sm"
                  />
                </div>
                <div className="relative sm:w-40">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:bg-white/20 focus:border-theme_color focus:outline-none transition text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="text-gray-900">Location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc} className="text-gray-900">{loc}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSearch}
                  className="px-5 py-3 bg-theme_color hover:bg-teal-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles size={16} />
                  Search
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center lg:justify-start animate-fade-in-up delay-500">
              <a
                href="/register"
                className="group px-4 py-3 sm:py-4 bg-theme_color hover:bg-teal-600 text-white font-semibold rounded-xl transition shadow-lg shadow-theme_color/30 hover:shadow-xl hover:shadow-theme_color/40 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                <Building2 size={18} />
                Create Account
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </a>

              <a
                href="/joblisting"
                className="group px-4 py-3 sm:py-4 border-2 border-white/40 hover:bg-white/10 rounded-xl font-semibold transition flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                <Briefcase size={20} />
                Browse All Jobs
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              </a>
            </div>

            {/* Trust Stats */}
            <div className="mt-6 sm:mt-10 flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10 text-center lg:text-left">
              <div>
                <p className="text-xl sm:text-3xl lg:text-4xl font-bold">AI Ranking</p>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">Auto-score applicants</p>
              </div>
              <div className="w-px h-10 sm:h-14 bg-white/20 hidden sm:block" />
              <div>
                <p className="text-xl sm:text-3xl lg:text-4xl font-bold">CV Parsing</p>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">Extract skills instantly</p>
              </div>
              <div className="w-px h-10 sm:h-14 bg-white/20 hidden sm:block" />
              <div>
                <p className="text-xl sm:text-3xl lg:text-4xl font-bold">% Match</p>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">See candidate fit scores</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Dashboard Mockup */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end animate-fade-in-up delay-300">
            <div className="relative w-full max-w-[560px] lg:max-w-[640px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              <img
                src={dashboardMockup}
                alt="Recruiter Dashboard Preview - AI Matching, Pipeline & Analytics"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Straight Bottom Bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-theme_color pointer-events-none" />

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        .animate-fade-in    { animation: fade-in 1s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
        .animate-float      { animation: float 7s ease-in-out infinite; }
        .delay-200          { animation-delay: 0.2s; }
        .delay-300          { animation-delay: 0.3s; }
        .delay-500          { animation-delay: 0.5s; }
        .animate-pulse-slow { animation: pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
      `}</style>
    </section>
  );
};

export default Heros;
