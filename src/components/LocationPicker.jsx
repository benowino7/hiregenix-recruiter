import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';
import Modal from './Modal';

const LocationPicker = ({ isOpen, onClose, onSelect, initialLocation = '' }) => {
    const [searchQuery, setSearchQuery] = useState(initialLocation);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const autocompleteService = useRef(null);
    const placesService = useRef(null);

    useEffect(() => {
        // Initialize Google Places API services
        if (window.google && window.google.maps) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();

            const dummyMap = document.createElement('div');
            const map = new window.google.maps.Map(dummyMap);
            placesService.current = new window.google.maps.places.PlacesService(map);
        } else {
            console.error('Google Maps API not loaded. Make sure to include the Places library.');
        }
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.length > 2 && autocompleteService.current) {
            setLoading(true);

            autocompleteService.current.getPlacePredictions(
                {
                    input: value,
                    types: ['geocode', 'establishment'],
                },
                (predictions, status) => {
                    setLoading(false);
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSuggestions(predictions);
                    } else {
                        setSuggestions([]);
                    }
                }
            );
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        if (!placesService.current) return;

        setLoading(true);

        placesService.current.getDetails(
            {
                placeId: suggestion.place_id,
                fields: ['name', 'formatted_address', 'geometry', 'address_components']
            },
            (place, status) => {
                setLoading(false);

                if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                    const location = {
                        name: place.formatted_address || suggestion.description,
                        latitude: place.geometry.location.lat(),
                        longitude: place.geometry.location.lng(),
                        placeId: suggestion.place_id
                    };

                    setSelectedPlace(location);
                    setSearchQuery(location.name);
                    setSuggestions([]);
                }
            }
        );
    };

    const handleConfirm = () => {
        if (selectedPlace) {
            onSelect(selectedPlace);
            onClose();
        }
    };

    const handleClose = () => {
        setSearchQuery(initialLocation);
        setSelectedPlace(null);
        setSuggestions([]);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Select Location"
            subtitle="Search for a city, area, or specific address"
            size="md"
        >
            <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <Search
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search for location..."
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent"
                        autoFocus
                    />
                    {loading && (
                        <Loader
                            size={20}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-theme_color dark:text-dark-theme_color animate-spin"
                        />
                    )}
                </div>

                {/* Suggestions List */}
                {suggestions.length > 0 && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.place_id}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            >
                                <MapPin size={18} className="text-theme_color dark:text-dark-theme_color mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                        {suggestion.structured_formatting.main_text}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {suggestion.structured_formatting.secondary_text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Selected Location */}
                {selectedPlace && (
                    <div className="p-4 bg-theme_color/10 dark:bg-dark-theme_color/10 border border-theme_color/30 dark:border-dark-theme_color/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={18} className="text-theme_color dark:text-dark-theme_color" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                Selected Location
                            </span>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {selectedPlace.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            Lat: {selectedPlace.latitude.toFixed(6)}, Lng: {selectedPlace.longitude.toFixed(6)}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && suggestions.length === 0 && searchQuery.length > 2 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                        <MapPin size={48} className="mb-3 opacity-50" />
                        <p className="font-medium text-gray-600 dark:text-gray-400">No locations found</p>
                        <span className="text-sm">Try adjusting your search query</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedPlace}
                        className="px-6 py-2 rounded-lg font-medium text-white bg-theme_color dark:bg-dark-theme_color hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default LocationPicker;