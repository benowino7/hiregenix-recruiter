import { useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

const GoogleMapsLoader = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps && window.google.maps.places) {
            setIsLoaded(true);
            return;
        }

        // Get API key from environment variables
        // Supports both Vite and Create React App
        const apiKey = import.meta.env.VITE_MAP_API

        if (!apiKey) {
            setError('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY or REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.');
            console.error('Missing Google Maps API key in environment variables');
            return;
        }

        // Create and inject script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            // Verify that Places library is loaded
            if (window.google && window.google.maps && window.google.maps.places) {
                setIsLoaded(true);
            } else {
                setError('Google Maps Places library failed to load');
            }
        };

        script.onerror = () => {
            setError('Failed to load Google Maps API. Please check your API key and network connection.');
            console.error('Google Maps script failed to load');
        };

        document.head.appendChild(script);

        // Cleanup function
        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    // Error state
    if (error) {
        return (
            <div className="min-h-[200px] flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={24} />
                        <div>
                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                                Google Maps API Error
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                {error}
                            </p>
                            <details className="text-xs text-red-600 dark:text-red-400">
                                <summary className="cursor-pointer font-medium mb-2">
                                    Setup Instructions
                                </summary>
                                <ol className="list-decimal list-inside space-y-1 ml-2">
                                    <li>Create a <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">.env</code> file in your project root</li>
                                    <li>Add: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your_api_key</code></li>
                                    <li>Get an API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                                    <li>Enable Places API and Maps JavaScript API</li>
                                    <li>Restart your dev server</li>
                                </ol>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (!isLoaded) {
        return (
            <div className="min-h-[200px] flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                    <Loader className="animate-spin text-theme_color dark:text-dark-theme_color" size={32} />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Loading Google Maps...
                    </p>
                </div>
            </div>
        );
    }
    return children;
};

export default GoogleMapsLoader;