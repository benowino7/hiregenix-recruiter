import { useState, useEffect } from 'react';
import { Building2, MapPin, Briefcase, Star, Shield, Search, X, ChevronDown, Filter, TrendingUp, Users, DollarSign, Globe, Clock, ArrowUpDown } from 'lucide-react';

const AllCompanies = () => {
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activelyHiring, setActivelyHiring] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

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

  // Sample company data with global representation
  const companies = [
    {
      id: '1',
      name: 'Google',
      logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200&h=200&fit=crop',
      industry: 'Technology',
      location: { city: 'Mountain View', country: 'USA', region: 'North America' },
      company_size: '10000+',
      open_jobs_count: 342,
      is_verified: true,
      hiring_status: 'actively_hiring',
      rating: { average: 4.4, reviews_count: 15420 },
      salary_range: '$120k - $250k',
      founded: 1998,
      remote_friendly: true
    },
    {
      id: '2',
      name: 'Siemens',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop',
      industry: 'Engineering',
      location: { city: 'Munich', country: 'Germany', region: 'Europe' },
      company_size: '10000+',
      open_jobs_count: 287,
      is_verified: true,
      hiring_status: 'actively_hiring',
      rating: { average: 4.2, reviews_count: 8934 },
      salary_range: '€65k - €140k',
      founded: 1847,
      remote_friendly: false
    },
    {
      id: '3',
      name: 'Shopify',
      logo: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=200&h=200&fit=crop',
      industry: 'E-commerce',
      location: { city: 'Ottawa', country: 'Canada', region: 'North America' },
      company_size: '5000-10000',
      open_jobs_count: 156,
      is_verified: true,
      hiring_status: 'actively_hiring',
      rating: { average: 4.5, reviews_count: 3421 },
      salary_range: '$95k - $180k',
      founded: 2006,
      remote_friendly: true
    },
    {
      id: '4',
      name: 'Samsung Electronics',
      logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop',
      industry: 'Technology',
      location: { city: 'Seoul', country: 'South Korea', region: 'Asia' },
      company_size: '10000+',
      open_jobs_count: 412,
      is_verified: true,
      hiring_status: 'actively_hiring',
      rating: { average: 4.1, reviews_count: 12567 },
      salary_range: '₩45M - ₩120M',
      founded: 1969,
      remote_friendly: false
    },
    {
      id: '5',
      name: 'Unilever',
      logo: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=200&h=200&fit=crop',
      industry: 'Consumer Goods',
      location: { city: 'London', country: 'UK', region: 'Europe' },
      company_size: '10000+',
      open_jobs_count: 198,
      is_verified: true,
      hiring_status: 'hiring',
      rating: { average: 4.0, reviews_count: 7832 },
      salary_range: '£45k - £95k',
      founded: 1929,
      remote_friendly: true
    },
    {
      id: '6',
      name: 'Atlassian',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
      industry: 'Software',
      location: { city: 'Sydney', country: 'Australia', region: 'Oceania' },
      company_size: '5000-10000',
      open_jobs_count: 89,
      is_verified: true,
      hiring_status: 'actively_hiring',
      rating: { average: 4.6, reviews_count: 2341 },
      salary_range: 'A$110k - A$200k',
      founded: 2002,
      remote_friendly: true
    },
    {
      id: '7',
      name: 'Infosys',
      logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&h=200&fit=crop',
      industry: 'IT Services',
      location: { city: 'Bangalore', country: 'India', region: 'Asia' },
      company_size: '10000+',
      open_jobs_count: 534,
      is_verified: true,
      hiring_status: 'actively_hiring',
      rating: { average: 3.9, reviews_count: 18923 },
      salary_range: '₹8L - ₹25L',
      founded: 1981,
      remote_friendly: false
    },
    {
      id: '8',
      name: 'Spotify',
      logo: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&h=200&fit=crop',
      industry: 'Media & Entertainment',
      location: { city: 'Stockholm', country: 'Sweden', region: 'Europe' },
      company_size: '5000-10000',
      open_jobs_count: 67,
      is_verified: true,
      hiring_status: 'hiring',
      rating: { average: 4.3, reviews_count: 1876 },
      salary_range: '€70k - €150k',
      founded: 2006,
      remote_friendly: true
    },
    {
      id: '9',
      name: 'Shoprite Holdings',
      logo: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=200&h=200&fit=crop',
      industry: 'Retail',
      location: { city: 'Cape Town', country: 'South Africa', region: 'Africa' },
      company_size: '10000+',
      open_jobs_count: 276,
      is_verified: true,
      hiring_status: 'actively_hiring',
      rating: { average: 3.8, reviews_count: 4521 },
      salary_range: 'R180k - R450k',
      founded: 1979,
      remote_friendly: false
    },
    {
      id: '10',
      name: 'Mercado Libre',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      industry: 'E-commerce',
      location: { city: 'Buenos Aires', country: 'Argentina', region: 'South America' },
      company_size: '5000-10000',
      open_jobs_count: 143,
      is_verified: true,
      hiring_status: 'actively_hiring',
      rating: { average: 4.2, reviews_count: 3102 },
      salary_range: '$45k - $95k',
      founded: 1999,
      remote_friendly: true
    },
    {
      id: '11',
      name: 'HSBC',
      logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&h=200&fit=crop',
      industry: 'Banking',
      location: { city: 'Hong Kong', country: 'Hong Kong', region: 'Asia' },
      company_size: '10000+',
      open_jobs_count: 231,
      is_verified: true,
      hiring_status: 'hiring',
      rating: { average: 3.7, reviews_count: 9234 },
      salary_range: 'HK$480k - HK$1.2M',
      founded: 1865,
      remote_friendly: false
    },
    {
      id: '12',
      name: 'Salesforce',
      logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
      industry: 'Software',
      location: { city: 'San Francisco', country: 'USA', region: 'North America' },
      company_size: '10000+',
      open_jobs_count: 298,
      is_verified: true,
      hiring_status: 'actively_hiring',
      rating: { average: 4.4, reviews_count: 11234 },
      salary_range: '$130k - $270k',
      founded: 1999,
      remote_friendly: true
    }
  ];

  const industries = [
    'Technology', 'Banking', 'Healthcare', 'E-commerce', 'Software',
    'Retail', 'Engineering', 'Consumer Goods', 'Media & Entertainment',
    'IT Services', 'Manufacturing', 'Education'
  ];

  const regions = [
    'North America', 'Europe', 'Asia', 'Middle East', 'Africa',
    'South America', 'Oceania'
  ];

  const companySizes = [
    '1-50', '51-200', '201-500', '501-1000', '1001-5000', '5000-10000', '10000+'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'jobs', label: 'Most Jobs' },
    { value: 'name', label: 'Company Name' },
    { value: 'recent', label: 'Recently Posted' }
  ];

  const toggleArrayFilter = (arr, setArr, value) => {
    if (arr.includes(value)) {
      setArr(arr.filter(item => item !== value));
    } else {
      setArr([...arr, value]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedIndustries([]);
    setSelectedLocations([]);
    setSelectedCompanySizes([]);
    setVerifiedOnly(false);
    setActivelyHiring(false);
    setMinRating(0);
  };

  const activeFilterCount =
    selectedIndustries.length +
    selectedLocations.length +
    selectedCompanySizes.length +
    (verifiedOnly ? 1 : 0) +
    (activelyHiring ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#e7f0fa] dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">
            Discover{' '}
            <span className="text-teal-600">
              Leading Companies
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Explore opportunities at {companies.length}+ top companies worldwide
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search companies by name, industry, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-dark-sidebar border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme_color text-base transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700 custom-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-medium"
              >
                <Filter size={18} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-theme_color text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Quick Filters */}
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${verifiedOnly
                  ? 'bg-theme_color text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <Shield size={16} />
                <span>Verified</span>
              </button>

              <button
                onClick={() => setActivelyHiring(!activelyHiring)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activelyHiring
                  ? 'bg-theme_color text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <TrendingUp size={16} />
                <span>Actively Hiring</span>
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-theme_color dark:text-dark-theme_color hover:underline font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort and View */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-4 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme_color transition-all"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {companies.length} companies
              </span>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Industry
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {industries.map((industry) => (
                      <label key={industry} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedIndustries.includes(industry)}
                          onChange={() => toggleArrayFilter(selectedIndustries, setSelectedIndustries, industry)}
                          className="w-4 h-4 text-theme_color border-slate-300 dark:border-slate-600 rounded focus:ring-theme_color"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                          {industry}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Region
                  </label>
                  <div className="space-y-2">
                    {regions.map((region) => (
                      <label key={region} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(region)}
                          onChange={() => toggleArrayFilter(selectedLocations, setSelectedLocations, region)}
                          className="w-4 h-4 text-theme_color border-slate-300 dark:border-slate-600 rounded focus:ring-theme_color"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                          {region}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Company Size Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Company Size
                  </label>
                  <div className="space-y-2">
                    {companySizes.map((size) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCompanySizes.includes(size)}
                          onChange={() => toggleArrayFilter(selectedCompanySizes, setSelectedCompanySizes, size)}
                          className="w-4 h-4 text-theme_color border-slate-300 dark:border-slate-600 rounded focus:ring-theme_color"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                          {size} employees
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0, 0].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          className="w-4 h-4 text-theme_color border-slate-300 dark:border-slate-600 focus:ring-theme_color"
                        />
                        <div className="flex items-center gap-1">
                          {rating > 0 ? (
                            <>
                              <Star size={16} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                                {rating}+
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                              All ratings
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedIndustries.map((industry) => (
              <span
                key={industry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme_color/10 dark:bg-theme_color/20 text-theme_color dark:text-dark-theme_color rounded-lg text-sm font-medium"
              >
                {industry}
                <button
                  onClick={() => toggleArrayFilter(selectedIndustries, setSelectedIndustries, industry)}
                  className="hover:text-theme_color/80 dark:hover:text-dark-theme_color/80"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {selectedLocations.map((location) => (
              <span
                key={location}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme_color/10 dark:bg-theme_color/20 text-theme_color dark:text-dark-theme_color rounded-lg text-sm font-medium"
              >
                {location}
                <button
                  onClick={() => toggleArrayFilter(selectedLocations, setSelectedLocations, location)}
                  className="hover:text-theme_color/80 dark:hover:text-dark-theme_color/80"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {selectedCompanySizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme_color/10 dark:bg-theme_color/20 text-theme_color dark:text-dark-theme_color rounded-lg text-sm font-medium"
              >
                {size} employees
                <button
                  onClick={() => toggleArrayFilter(selectedCompanySizes, setSelectedCompanySizes, size)}
                  className="hover:text-theme_color/80 dark:hover:text-dark-theme_color/80"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Companies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <a
              href='/companies/1'
              key={company.id}
              className="group bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 group-hover:border-theme_color dark:group-hover:border-dark-theme_color transition-all">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-theme_color dark:group-hover:text-dark-theme_color transition-colors">
                      {company.name}
                    </h3>
                    {company.is_verified && (
                      <div className="flex-shrink-0 w-6 h-6 bg-theme_color/10 dark:bg-theme_color/10 rounded-full flex items-center justify-center">
                        <Shield size={14} className="text-theme_color dark:text-theme_color" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {company.industry}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>{company.location.city}, {company.location.country}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>{company.company_size} employees</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <DollarSign size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>{company.salary_range}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {company.rating.average}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({company.rating.reviews_count})
                    </span>
                  </div>

                  {company.remote_friendly && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Globe size={14} />
                      <span>Remote</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-200 dark:bg-slate-700 mb-4" />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-theme_color dark:text-dark-theme_color" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {company.open_jobs_count} Open Roles
                  </span>
                </div>

                {company.hiring_status === 'actively_hiring' && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-theme_color/10 dark:bg-theme_color/10 rounded-full">
                    <div className="w-1.5 h-1.5 bg-theme_color rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-theme_color dark:text-theme_color">
                      Hiring
                    </span>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
export default AllCompanies;