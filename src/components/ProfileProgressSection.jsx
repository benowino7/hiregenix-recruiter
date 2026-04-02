import { useState, useEffect } from "react";
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Award,
  Rocket,
  ShieldCheck,
  Star,
} from "lucide-react";

const ProfileProgressSection = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const steps = [
    {
      icon: Building2,
      title: "Set Up Company Profile",
      description:
        "Create a professional employer profile that attracts top talent and showcases your brand",
    },
    {
      icon: Briefcase,
      title: "Post Your Jobs",
      description:
        "Quickly publish roles with AI-optimized descriptions to reach the right candidates",
    },
    {
      icon: Users,
      title: "Receive AI-Matched Candidates",
      description:
        "Get ranked applicants with match scores, skills alignment, and experience insights",
    },
    {
      icon: CheckCircle,
      title: "Manage & Hire Faster",
      description:
        "Track pipelines, schedule interviews, collaborate with your team, and close hires efficiently",
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: "Precision Targeting",
      stat: "92%",
      label: "Match Rate",
      description:
        "Our AI matches candidates with surgical precision based on skills, experience, and cultural fit",
      flatColor: "bg-teal-600",
      accent: "#0097A7",
    },
    {
      icon: Rocket,
      title: "Velocity Hiring",
      stat: "60%",
      label: "Faster",
      description:
        "Cut your time-to-hire in half with automated screening and intelligent candidate ranking",
      flatColor: "bg-teal-600",
      accent: "#0097A7",
    },
    {
      icon: ShieldCheck,
      title: "Quality Assurance",
      stat: "4.8★",
      label: "Avg Rating",
      description:
        "Pre-vetted candidates with verified skills and experience you can trust",
      flatColor: "bg-teal-600",
      accent: "#0097A7",
    },
    {
      icon: Star,
      title: "Brand Amplification",
      stat: "3x",
      label: "More Views",
      description:
        "Showcase your employer brand to reach passive candidates who aren't actively searching",
      flatColor: "bg-teal-600",
      accent: "#0097A7",
    },
  ];

  return (
    <div className="relative transition-colors duration-500">
      {/* ──────────────────────────────────────────────
          SECTION 1: Hero / Recruiter Profile Setup
          Dark premium gradient background
      ────────────────────────────────────────────── */}
      <section className="relative bg-[#e7f0fa] dark:bg-gray-950 text-white py-24 overflow-hidden">


        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Content Side */}
            <div className="lg:col-span-7 space-y-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-theme_color/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl animate-shimmer">
                <span className="text-sm font-bold text-theme_color">
                  AI-Powered Recruitment Platform
                </span>
              </div>

              <h2 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-gray-600 dark:text-theme_color">
                Build Your
                <br />
                <span className="relative inline-block mt-2">
                  <span className="">
                    Recruitment Empire
                  </span>
                  <div className="absolute -inset-2 bg-teal-500/30 blur-2xl -z-10 animate-pulse-slow" />
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-slate-800 dark:text-gray-100 leading-relaxed max-w-2xl font-light">
                Join{" "}
                <span className="font-bold text-theme_color">1,200+ companies</span>{" "}
                using AI to discover, engage, and hire top talent{" "}
                <span className="italic">faster than ever before.</span>
              </p>

              <div className="flex flex-wrap gap-8 py-6">
                {[
                  { value: "92%", label: "AI Match Accuracy", icon: Target },
                  { value: "60%", label: "Faster Hiring", icon: Zap },
                  { value: "1.2K+", label: "Active Jobs", icon: Briefcase },
                ].map((stat, i) => (
                  <div key={i} className="group relative">
                    <div className="relative flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-lg">
                      <div className="p-2 bg-teal-600 rounded-xl">
                        <stat.icon className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-600 dark:text-white">{stat.value}</div>
                        <div className="text-xs font-medium text-slate-600 dark:text-white">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <a
                  href="/register"
                  className="group relative px-10 py-6 bg-teal-600 rounded-2xl font-bold text-white text-lg shadow-2xl hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <div className="relative flex items-center justify-center gap-3">
                    <span>Start Hiring Today</span>
                    <ArrowRight
                      size={22}
                      className="group-hover:translate-x-2 transition-transform duration-300"
                    />
                  </div>
                </a>
                <a
                  href="#how_it_works"
                  className="group px-10 py-6 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl font-bold text-white text-lg hover:bg-white/20 transition-all duration-300 shadow-xl flex items-center justify-center gap-3"
                >
                  <span>See How It Works</span>
                  <ArrowRight
                    size={22}
                    className="group-hover:translate-x-2 transition-transform duration-300"
                  />
                </a>
              </div>
            </div>
            {/* Visual Side - 5 columns - Asymmetric collage layout */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-[700px]">
                {/* Main image */}
                <div
                  className="absolute top-0 right-0 w-[85%] h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 transform rotate-2 hover:rotate-0 transition-all duration-500"
                  style={{ animationDelay: '0s' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800"
                    alt="Recruiter dashboard"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-teal-500/10" />
                </div>

                {/* Secondary image */}
                <div
                  className="absolute bottom-0 left-0 w-[70%] h-[350px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 transform -rotate-3 hover:rotate-0 transition-all duration-500"
                  style={{ animationDelay: '0.1s' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800"
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-teal-500/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          SECTION 2: Benefits – Why Choose Us
          Light / neutral background for contrast
      ────────────────────────────────────────────── */}
      <section className="relative bg-[#FAFBFC] dark:bg-slate-900 py-24">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Why Top Companies Choose Us
            </h3>
            <p className="text-xl text-slate-600 dark:text-white max-w-3xl mx-auto">
              Experience recruitment technology that transforms how you discover and hire talent
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700"
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div
                  className={"absolute inset-0 bg-teal-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"}
                />
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `${benefit.accent}15`,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl ${benefit.flatColor} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500`}
                    >
                      <benefit.icon className="text-white" size={32} />
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-theme_color">
                        {benefit.stat}
                      </div>
                      <div className="text-sm font-bold text-slate-600 dark:text-white">
                        {benefit.label}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-teal-600 transition-all duration-300">
                    {benefit.title}
                  </h4>
                  <p className="text-slate-600 dark:text-white leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          SECTION 3: Working Process – 4 Steps
          Soft accent background
      ────────────────────────────────────────────── */}
      <section id="how_it_works" className="w-full relative bg-[#FAFBFC] dark:bg-slate-800 py-24">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-800 dark:bg-white rounded-full mb-6">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-white dark:text-slate-900">
                Four Simple Steps
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-theme_color mb-4">
              Your Journey to
              <br />
              <span className="">
                Effortless Hiring
              </span>
            </h2>
          </div>

          <div className="relative w-full mx-auto">
            <div className="hidden lg:block absolute top-32 left-0 right-0 h-1 bg-teal-600 rounded-full" />

            <div className="grid lg:grid-cols-4 gap-12 lg:gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative group"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-teal-600 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-900 group-hover:scale-110 transition-transform duration-500">
                        <span className="text-2xl font-black text-white">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-teal-500 transition-all duration-500 shadow-lg">
                      <step.icon
                        className="text-slate-600 dark:text-white group-hover:text-teal-600 transition-colors duration-500"
                        size={32}
                        strokeWidth={2}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-teal-600 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-white leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-reverse {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(45deg);
          }
          50% {
            transform: translateY(-30px) rotate(45deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 7s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfileProgressSection;