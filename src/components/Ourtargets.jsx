import React from 'react';
import {
  Rocket,
  Building2,
  Briefcase,
  Users,
  Globe,
} from 'lucide-react';

function Ourtargets() {
  const targetAudiences = [
    {
      icon: Rocket,
      title: 'Startups',
      description: 'Build your dream team without enterprise costs',
    },
    {
      icon: Building2,
      title: 'SMEs',
      description: 'Automated hiring for growing businesses',
    },
    {
      icon: Briefcase,
      title: 'Corporates',
      description: 'Scale recruitment across departments seamlessly',
    },
    {
      icon: Users,
      title: 'Agencies',
      description: 'Manage multiple clients in one dashboard',
    },
    {
      icon: Globe,
      title: 'Remote-First',
      description: 'Hire talent from anywhere in the world',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 py-20 border-y border-slate-200 dark:border-slate-700">
      <div className="shadow-2xl rounded-xl max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Built for Every Hiring Team
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            The right solution for your business size and needs
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {targetAudiences.map((audience, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <audience.icon className="text-slate-700 dark:text-slate-300" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {audience.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Ourtargets;