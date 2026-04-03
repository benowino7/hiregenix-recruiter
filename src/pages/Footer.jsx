// src/components/Footer.jsx
import React, { useState } from 'react';
import {
  Building2, Mail, MapPin, Phone, Send,
  Linkedin, Twitter, Instagram, Facebook, ArrowUp,
  FileText
} from 'lucide-react';
import logo from '../assets/logo.png';
import logodark from '../assets/logodark.png';
import PolicyModal from '../components/PolicyModal';
import { CookieSettingsButton } from '../components/CookieConsent';
import { useTheme } from '../themes/ThemeContext';

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);
  const { isDark } = useTheme();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    <footer className="relative bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 overflow-hidden">

      <div className="relative max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">

          {/* Brand + Newsletter - takes more space on left */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img
                className="w-48 md:w-64 h-auto object-contain"
                src={isDark ? logodark : logo}
                alt="HireGeniX Logo"
              />
            </div>

            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-xl">
              Connecting top talent with the best career opportunities in Dubai, Abu Dhabi, Sharjah, and across the UAE.
            </p>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[#1A2D42] dark:text-slate-200">
                Get the latest jobs & career opportunities
              </h4>
              <form className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 bg-[#FAFBFC] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0097A7] focus:ring-1 focus:ring-[#0097A7]/30 text-sm text-slate-800 dark:text-white transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0097A7] hover:bg-teal-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-[#0097A7]/20 font-medium min-w-[140px]"
                >
                  <Send size={18} />
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* For Employers / Recruiters - wider column */}
          <div className="lg:col-start-3">
            <h3 className="text-lg font-semibold text-[#1A2D42] dark:text-white mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-[#0097A7]" />
              For Employers
            </h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/login?target=jobs" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Post a Job</a></li>
              <li><a href="/login" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Recruiter Login</a></li>
              <li><a href="/register" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Start Hiring</a></li>
              <li><a href="/pricing" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Pricing & Plans</a></li>
              <li><a href="/#testimonials" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Success Stories</a></li>
              <li><a href="/contact" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Contact Sales Team</a></li>
            </ul>
          </div>

          {/* Company + Legal + Contact */}
          <div>
            <h3 className="text-lg font-semibold text-[#1A2D42] dark:text-white mb-6">Company</h3>

            <ul className="space-y-3 mb-8 text-sm">
              <li><a href="/about" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">About HireGeniX</a></li>
              <li><a href="/contact" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Blogs</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Partners & Affiliates</a></li>
            </ul>

            <h4 className="text-sm font-semibold text-[#1A2D42] dark:text-slate-200 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm mb-8">
              <li>
                <button onClick={() => setShowTerms(true)} className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors flex items-center gap-2">
                  <FileText size={14} /> Terms of Use
                </button>
              </li>
              <li>
                <CookieSettingsButton className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors flex items-center gap-2" />
              </li>
            </ul>

            {/* Contact Info */}
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#0097A7] mt-1 flex-shrink-0" />
                <span>Suite 502, 55 Commerce Valley,<br />Markham, ON, L3T 7V9</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-[#0097A7] mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <div><a href="tel:+16477888715" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Care: 647-788-8715</a></div>
                  <div><a href="tel:+16479307516" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">Support: 647-930-7516</a></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#0097A7] flex-shrink-0" />
                <a href="mailto:support@hiregenix.ai" className="text-slate-500 dark:text-slate-300 hover:text-[#0097A7] transition-colors">
                  support@hiregenix.ai
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800/70">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
            <div className="text-center md:text-left">
              &copy; {new Date().getFullYear()} HireGeniX - All rights reserved.
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[
                { Icon: Facebook, href: '#', color: 'hover:bg-blue-600' },
                { Icon: Twitter, href: '#', color: 'hover:bg-sky-500' },
                { Icon: Linkedin, href: '#', color: 'hover:bg-blue-700' },
                { Icon: Instagram, href: '#', color: 'hover:bg-pink-600' },
              ].map(({ Icon, href, color }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 border border-slate-200 dark:border-slate-700 dark:bg-slate-800/70 rounded-full flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-teal-600 hover:border-teal-600 hover:scale-110 hover:shadow-lg`}
                  aria-label={`Follow us on ${Icon.name}`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-6 md:right-10 z-50 w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-lg hover:scale-110 transition-all duration-300 group"
        aria-label="Scroll to top"
      >
        <ArrowUp size={22} className="text-white group-hover:animate-bounce" />
      </button>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50%      { transform: scale(1.15); opacity: 0.45; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 12s infinite ease-in-out;
        }
        .delay-1000 {
          animation-delay: 4s;
        }
      `}</style>
    </footer>
    <PolicyModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
};

export default Footer;