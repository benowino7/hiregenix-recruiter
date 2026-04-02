import { Calendar, Clock, Video, Bell } from 'lucide-react';

const ScheduledInterviews = () => {
    return (
        <div className="md:px-4 lg:px-14 py-4">
            <div className="w-full">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Scheduled Interviews
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage and track all upcoming candidate interviews
                    </p>
                </div>

                {/* Coming Soon State */}
                <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-gray-200 dark:border-gray-700 p-12 md:p-16 text-center shadow-sm">
                    <div className="max-w-md mx-auto">
                        {/* Icon cluster */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-teal-500" />
                            </div>
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                                <Video className="w-7 h-7 text-blue-500" />
                            </div>
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                                <Clock className="w-7 h-7 text-purple-500" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Interview Scheduling Coming Soon
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            We are building a powerful interview scheduling system that will allow you to
                            schedule, manage, and track interviews with candidates directly from your dashboard.
                        </p>

                        {/* Feature preview list */}
                        <div className="space-y-3 text-left max-w-sm mx-auto mb-8">
                            {[
                                { icon: Calendar, text: 'Schedule interviews with calendar integration' },
                                { icon: Video, text: 'Video, phone, and in-person interview support' },
                                { icon: Bell, text: 'Automatic reminders for you and candidates' },
                                { icon: Clock, text: 'Timezone-aware scheduling' },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                                >
                                    <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <feature.icon className="w-4 h-4 text-theme_color" />
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/40 rounded-xl">
                            <Bell className="w-4 h-4 text-teal-500" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                                Stay tuned for updates
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduledInterviews;
