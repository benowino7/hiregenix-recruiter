// src/components/modals/AddIndustryModal.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Building2, Loader2, Plus, CheckCircle, Search, ChevronDown } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';
import ErrorMessage from '../utilities/ErrorMessage';
import successMessage from '../utilities/successMessage';
import Modal from './Modal';

// ─── Searchable Select ────────────────────────────────────────────────────────

const SearchableSelect = ({ options, value, onChange, placeholder = 'Search…', error }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.id === value) || null;

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option) => {
    onChange(option.id);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={open ? () => setOpen(false) : handleOpen}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-gray-800 border ${
          error
            ? 'border-red-500'
            : open
            ? 'border-theme_color ring-2 ring-theme_color/20'
            : 'border-gray-300 dark:border-gray-700'
        } rounded-xl transition-all text-left`}
      >
        <span
          className={`text-sm truncate ${
            selected
              ? 'text-gray-900 dark:text-white font-medium'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {selected ? selected.name : '-- Choose an industry --'}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <span
              role="button"
              onClick={handleClear}
              className="p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
          style={{ animation: 'fadeSlideDown 0.15s ease both' }}
        >
          {/* Search input */}
          <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-theme_color placeholder-gray-400 text-gray-900 dark:text-white"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                No industries match "{query}"
              </li>
            ) : (
              filtered.map((option) => {
                const isSelected = option.id === value;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-theme_color/10 text-theme_color font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60'
                      }`}
                    >
                      <span>{option.name}</span>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 flex-shrink-0 text-theme_color" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Count footer */}
          {filtered.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                {filtered.length} option{filtered.length !== 1 ? 's' : ''}
                {query ? ` matching "${query}"` : ''}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const AddIndustryModal = ({ isOpen, onClose, onSuccess, currentIndustries = [] }) => {
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [error, setError] = useState(null);
  const token = JSON.parse(sessionStorage.getItem('accessToken'));

  useEffect(() => {
    if (isOpen) {
      fetchIndustries();
      setSelectedIndustry('');
      setError(null);
    }
  }, [isOpen]);

  const fetchIndustries = async () => {
    setLoading2(true);
    try {
      const response = await fetch(`${BASE_URL}/public/industries/taxonomy`);
      const data = await response.json();
      if (!response.ok || data.error) {
        ErrorMessage(data?.message || 'Failed to fetch industries');
        return;
      }
      const items = [];
      for (const group of data.result || []) {
        for (const ind of group.industries || []) {
          items.push({ id: ind.id, name: ind.name });
        }
      }
      items.sort((a, b) => a.name.localeCompare(b.name));
      setIndustries(items);
    } catch (error) {
      console.error('Error fetching industries:', error);
    } finally {
      setLoading2(false);
    }
  };

  // Filter out industries that are already added
  const availableIndustries = industries.filter(
    (industry) => !currentIndustries.some((current) => current.id === industry.id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedIndustry) {
      setError('Please select an industry');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/recruiter/company/industry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ industryId: selectedIndustry }),
      });

      const data = await response.json();

      if (!response.ok) {
        ErrorMessage(data?.message || 'Failed to add industry');
        throw new Error(data.message || 'Failed to add industry');
      }

      if (data.status === 'SUCCESS') {
        onSuccess();
        successMessage(data?.message || 'Industry Added successfully');
        onClose();
        setSelectedIndustry('');
      } else {
        throw new Error(data.message || 'Failed to add industry');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while adding industry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title="Add Industry to the Company"
      subtitle="Select the Industry to add from the existing ones"
      size="lg"
    >
      {loading2 ? (
        <div className="w-full min-h-[350px] flex items-center justify-center flex-col gap-3">
          <p>Loading industries</p>
          <Loader2 className="animate-spin text-3xl text-theme_color" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {availableIndustries.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
              <p className="text-gray-600 dark:text-gray-400">
                All available industries have been added to your company
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                  Select Industry <span className="text-red-500">*</span>
                </label>

                <SearchableSelect
                  options={availableIndustries}
                  value={selectedIndustry}
                  onChange={(val) => {
                    setSelectedIndustry(val);
                    setError(null);
                  }}
                  placeholder="Search industries…"
                  error={error}
                />

                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
              </div>

              {/* Current Industries */}
              {currentIndustries.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                    Current Industries
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentIndustries.map((industry) => (
                      <span
                        key={industry.id}
                        className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {industry.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedIndustry}
                  className="px-6 py-3 bg-theme_color hover:bg-theme_color/90 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Add
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </Modal>
  );
};

export default AddIndustryModal;