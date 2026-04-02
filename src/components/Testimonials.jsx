import { useEffect, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const perPage = 3;

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${BASE_URL}/public/testimonials?type=RECRUITER`);
      const data = await res.json();
      if (res.ok && !data.error) {
        setTestimonials(data.result || []);
      }
    } catch (err) {
      console.log("Failed to fetch testimonials:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(testimonials.length / perPage);
  const currentTestimonials = testimonials.slice(currentPage * perPage, (currentPage + 1) * perPage);

  const nextPage = () => setCurrentPage((p) => (p + 1) % totalPages);
  const prevPage = () => setCurrentPage((p) => (p - 1 + totalPages) % totalPages);

  if (loading) {
    return (
      <section className="relative bg-white dark:bg-slate-900 py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse text-slate-400">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const fallbackImg = "/favicon.ico";

  return (
    <section id='testimonials' className="relative bg-white dark:bg-slate-900 py-20 md:py-32 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/4 rounded-full blur-3xl -translate-y-1/3" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/4 rounded-full blur-3xl translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-slate-200/80 dark:border-slate-700/50 mb-6 shadow-sm">
            <Sparkles className="text-indigo-500 dark:text-indigo-400" size={18} />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Real Stories • Real Results
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What Hiring Teams Are Saying
          </h2>

          <p className="mt-5 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            From startups to enterprises — see how companies are transforming their hiring process.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {currentTestimonials.map((t) => (
            <div
              key={t.id}
              className="
                group relative
                bg-white dark:bg-slate-800/80 backdrop-blur-md
                rounded-2xl md:rounded-3xl
                p-7 md:p-9
                border border-slate-200/80 dark:border-slate-700/50
                group-hover:border-teal-400/70
                transition-all duration-400 ease-out
                hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/30
                hover:-translate-y-2
                flex flex-col
                overflow-hidden
              "
            >
              {/* Quote mark */}
              <div className="absolute top-5 right-6 opacity-10 dark:opacity-5 transition-all duration-500 group-hover:scale-125 group-hover:opacity-20 dark:group-hover:opacity-10">
                <Quote size={80} className="text-slate-400 dark:text-slate-600" />
              </div>

              {/* Avatar + Name */}
              <div className="relative z-10 flex items-center gap-4 mb-6">
                <img
                  src={t.user?.profilePicture || fallbackImg}
                  alt={t.user?.fullName || "User"}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md transition-transform duration-400 group-hover:scale-110"
                  onError={(e) => { e.target.src = fallbackImg; }}
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-base md:text-lg">
                    {t.user?.fullName || "Anonymous"}
                  </div>
                  {(t.role || t.company) && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                      {t.role}
                      {t.role && t.company && <span className="mx-1.5">·</span>}
                      {t.company}
                    </div>
                  )}
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="relative z-10 text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed mb-8 flex-grow">
                "{t.text}"
              </blockquote>

              {/* Company highlight */}
              {t.company && (
                <div className="relative z-10 pt-5 border-t border-slate-200/60 dark:border-slate-700/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Featured at
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t.company}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={prevPage}
              className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i === currentPage
                      ? 'bg-theme_color'
                      : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextPage}
              className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 md:mt-24 text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-6 md:gap-12 bg-white/80 dark:bg-slate-800/70 backdrop-blur-md px-8 py-7 md:px-12 md:py-9 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-700/50 shadow-xl">
            <div className="text-left max-w-[90rem]">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Ready to see similar results?
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
                Join hundreds of hiring teams already cutting time-to-hire and improving candidate quality.
              </p>
            </div>

            <a
              href="/register"
              className="
                px-8 py-4 bg-theme_color dark:bg-theme_color transition-all duration-300 flex items-center gap-3 whitespace-nowrap rounded-full shadow-lg shadow-theme_color/30 hover:shadow-xl hover:shadow-theme_color/40 text-white font-semibold
                group"
            >
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;