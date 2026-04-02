// src/pages/JobDetails.jsx
import React from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Star,
  Share2,
  BookmarkPlus,
  ArrowRight,
} from "lucide-react";

// Mock single job data (in real app → from useParams / API)
const job = {
  id: "6",
  title: "Data Scientist",
  company: "Dubai AI Lab",
  companyLogo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=80&h=80&fit=crop", // ← placeholder / real logo
  location: "Dubai Internet City, UAE",
  locationType: "Hybrid",           // was "Remote" but description feels office-oriented
  salary: { min: 25000, max: 38000, currency: "USD", frequency: "monthly" },
  matchScore: 93,
  jobType: "Full-time",
  experienceLevel: "Senior",
  postedDate: "2026-01-19T08:00:00Z",
  urgency: "New",
  category: "Technology",
  subCategory: "AI/ML",
  skills: ["Python", "TensorFlow", "Deep Learning", "MLOps", "PyTorch", "SQL"],
  description:
    `We are seeking a talented Senior Data Scientist to join our cutting-edge AI research team in Dubai.

Key responsibilities include:
• Developing and deploying advanced machine learning models
• Conducting experiments and analyzing large-scale datasets
• Collaborating with engineers and product teams to productionize models
• Staying up-to-date with the latest advancements in AI/ML
• Mentoring junior data scientists and contributing to research publications`,
  requirements: [
    "5+ years of professional experience in data science / machine learning",
    "Strong proficiency in Python and ML frameworks (TensorFlow, PyTorch)",
    "Experience building and deploying production ML systems (MLOps)",
    "Solid understanding of deep learning architectures",
    "Experience with cloud platforms (GCP, AWS, Azure)",
    "Strong statistical and mathematical foundation",
    "Excellent communication and problem-solving skills",
  ],
  benefits: [
    "Dedicated research time",
    "Conference & training budget",
    "Access to cutting-edge hardware & datasets",
    "Competitive compensation & equity",
    "Flexible working hours",
  ],
  applyUrl: "/login",
};

// Mock related jobs (same category: Technology)
const relatedJobs = [
  {
    id: "4",
    title: "DevOps Architect - Cloud Native",
    company: "Etisalat Digital",
    location: "Dubai Silicon Oasis",
    salary: { min: 28000, max: 42000, currency: "USD", frequency: "monthly" },
    matchScore: 89,
    jobType: "Contract",
  },
  {
    id: "7",
    title: "Full Stack Engineer (Node.js + React)",
    company: "Careem Engineering",
    location: "DIFC, Dubai",
    salary: { min: 24000, max: 36000, currency: "USD", frequency: "monthly" },
    matchScore: 91,
    jobType: "Full-time",
  },
  {
    id: "9",
    title: "AI Research Engineer - Generative Models",
    company: "G42",
    location: "Masdar City, Abu Dhabi",
    salary: { min: 32000, max: 48000, currency: "USD", frequency: "monthly" },
    matchScore: 88,
    jobType: "Full-time",
  },
];

const JobDetails = () => {
  const postedDate = new Date(job.postedDate);
  const now = new Date();
  const daysAgo = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Sticky Header Bar */}
      <div className="bg-white dark:bg-dark-sidebar border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {job.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-slate-600 dark:text-slate-400">
              <Building2 size={18} />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              title="Save job"
              className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-gray-600 dark:text-gray-300"
            >
              <BookmarkPlus size={20} />
            </button>
            <button
              title="Share"
              className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-gray-600 dark:text-gray-300"
            >
              <Share2 size={20} />
            </button>
            <a
              href="/login"
              className="
                px-6 sm:px-8 py-3 bg-teal-600
                hover:bg-teal-700
                text-white font-semibold rounded-xl shadow-md hover:shadow-lg
                transition-all flex items-center gap-2 text-base
              "
            >
              <Briefcase size={18} />
              Apply Now
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-dark-sidebar p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Location
                </div>
                <div className="text-base font-medium flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <MapPin size={16} />
                  {job.location}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {job.locationType}
                </div>
              </div>

              <div className="bg-white dark:bg-dark-sidebar p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Posted
                </div>
                <div className="text-base font-medium text-gray-600 dark:text-gray-300">
                  {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-5 text-slate-900 dark:text-white">
                About the Role
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                {/<[a-z][\s\S]*>/i.test(job.description) ? (
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                ) : (
                  job.description.split("\n").map((line, i) => (
                    <p key={i} className="mb-4 last:mb-0">
                      {line}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-5 text-slate-900 dark:text-white">
                Requirements
              </h2>
              <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-5 text-slate-900 dark:text-white">
                Benefits & Perks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {job.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 text-teal-500 text-lg">✓</div>
                    <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-5 text-slate-900 dark:text-white">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md bg-slate-200 dark:bg-slate-700">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/80?text=Co")}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {job.company}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {job.category} • UAE
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <MapPin size={18} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase size={18} />
                  <span>51-200 employees</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} />
                  <span>{job.jobType} • {job.experienceLevel}</span>
                </div>
              </div>

              <a
                href="/login"
                className="
                  w-full py-4 bg-teal-600
                  hover:bg-teal-700
                  text-white font-bold rounded-xl shadow-md hover:shadow-lg
                  transition-all mb-4 flex items-center justify-center gap-2 text-lg
                "
              >
                <Briefcase size={20} />
                Apply for this job
              </a>

              <a
                href="/companies/2"
                className="
                  w-full inline-block text-center py-3.5 border border-slate-300 dark:border-slate-700
                  text-slate-700 dark:text-slate-300 font-medium rounded-xl
                  hover:bg-slate-50 dark:hover:bg-slate-800 transition
                "
              >
                View company profile
              </a>
            </div>
          </div>
        </div>

        {/* Related Jobs */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              More Technology Jobs
            </h2>
            <a
              href="/joblisting?category=Technology"
              className="
                flex items-center gap-2 text-teal-600 dark:text-teal-500
                font-medium hover:text-teal-700 dark:hover:text-teal-400 transition
              "
            >
              View all <ArrowRight size={18} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedJobs.map((relJob) => (
              <a
                href={`/joblisting/${relJob?.id}`}
                key={relJob.id}
                className="
                  bg-white dark:bg-dark-sidebar rounded-xl border border-slate-200 dark:border-slate-800
                  p-5 hover:border-teal-400 dark:hover:border-teal-500
                  hover:shadow-md transition-all group cursor-pointer
                "
              >
                <h3
                  className="
                    text-lg font-semibold text-slate-900 dark:text-white
                    group-hover:text-teal-600 dark:group-hover:text-teal-400 mb-2 line-clamp-2
                  "
                >
                  {relJob.title}
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {relJob.company} • {relJob.location}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;