import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
  Loader,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import Modal from "./Modal";
import LocationPicker from "./LocationPicker";
import { BASE_URL } from "../BaseUrl";
import GoogleMapsLoader from "./GoogleMapsLoader";
import successMessage from "../utilities/successMessage";
import ErrorMessage from "../utilities/ErrorMessage";
import UpgradeModal from "./UpgradeModal";

const JobPostingModal = ({ isOpen, onClose, jobData = null, setReload }) => {
  const isEditMode = !!jobData;
  const token = JSON.parse(sessionStorage?.getItem("accessToken"));
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vacancies: 1,
    maxApplicants: "",
    employmentType: "FULL_TIME",
    experienceLevel: "Mid-Level",
    locationName: "",
    latitude: null,
    longitude: null,
    isRemote: false,
    minSalary: "",
    maxSalary: "",
    currency: "AED",
    showSalary: true,
    industries: [],
    skills: [],
  });

  const [skills, setSkills] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [errors, setErrors] = useState({});
  const [upgradeModal, setUpgradeModal] = useState({ open: false, message: "" });
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const employmentTypes = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "TEMPORARY", label: "Temporary" },
    { value: "INTERNSHIP", label: "Internship" },
  ];

  const experienceLevels = [
    "Entry-Level",
    "Mid-Level",
    "Senior-Level",
    "Executive",
  ];

  const currencies = ["AED", "USD"];

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()),
  );

  const filteredIndustries = industries.filter((industry) =>
    industry.name.toLowerCase().includes(industrySearch.toLowerCase()),
  );

  const allFilteredSkillsSelected =
    filteredSkills.length > 0 &&
    filteredSkills.every((skill) => formData.skills.includes(skill.id));

  const allFilteredIndustriesSelected =
    filteredIndustries.length > 0 &&
    filteredIndustries.every((industry) =>
      formData.industries.includes(industry.id),
    );

  useEffect(() => {
    if (isOpen) {
      fetchSkillsAndIndustries();
    }
  }, [isOpen]);

  useEffect(() => {
    if (jobData) {
      setFormData({
        title: jobData.title || "",
        description: jobData.description || "",
        vacancies: jobData.vacancies || 1,
        maxApplicants: jobData.maxApplicants || "",
        employmentType: jobData.employmentType || "FULL_TIME",
        experienceLevel: jobData.experienceLevel || "Mid-Level",
        locationName: jobData.locationName || "",
        latitude: jobData.latitude || null,
        longitude: jobData.longitude || null,
        isRemote: jobData.isRemote || false,
        minSalary: jobData.minSalary || "",
        maxSalary: jobData.maxSalary || "",
        currency: jobData.currency || "AED",
        showSalary:
          jobData.showSalary !== undefined ? jobData.showSalary : true,
        industries: jobData?.industries?.map((item) => item.industryId) || [],
        skills: jobData?.skills?.map((item) => item.skillId) || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        vacancies: 1,
        maxApplicants: "",
        employmentType: "FULL_TIME",
        experienceLevel: "Mid-Level",
        locationName: "",
        latitude: null,
        longitude: null,
        isRemote: false,
        minSalary: "",
        maxSalary: "",
        currency: "AED",
        showSalary: true,
        industries: [],
        skills: [],
      });
      setErrors({});
      setSkillSearch("");
      setIndustrySearch("");
    }
  }, [jobData, isOpen]);

  const fetchSkillsAndIndustries = async () => {
    setFetchingData(true);
    try {
      const [skillsRes, industriesRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/skills`),
        fetch(`${BASE_URL}/public/industries/taxonomy`),
      ]);

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        if (skillsData.status === "SUCCESS" && skillsData.data) {
          setSkills(skillsData.data);
        } else if (Array.isArray(skillsData)) {
          setSkills(skillsData);
        }
      }

      if (industriesRes.ok) {
        const industriesData = await industriesRes.json();
        if (!industriesData.error && industriesData.result) {
          const items = [];
          for (const group of industriesData.result) {
            for (const ind of group.industries || []) {
              items.push({ id: ind.id, name: ind.name });
            }
          }
          items.sort((a, b) => a.name.localeCompare(b.name));
          setIndustries(items);
        }
      }
    } catch (error) {
      console.error("Error fetching skills and industries:", error);
      setErrors((prev) => ({
        ...prev,
        fetch: "Failed to load skills and industries. Please try again.",
      }));
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const currentValues = prev[name];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [name]: newValues };
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectAllSkills = () => {
    const filteredIds = filteredSkills.map((s) => s.id);
    if (allFilteredSkillsSelected) {
      // Deselect all filtered
      setFormData((prev) => ({
        ...prev,
        skills: prev.skills.filter((id) => !filteredIds.includes(id)),
      }));
    } else {
      // Select all filtered (merge with existing)
      setFormData((prev) => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...filteredIds])],
      }));
    }
    if (errors.skills) setErrors((prev) => ({ ...prev, skills: null }));
  };

  const handleSelectAllIndustries = () => {
    const filteredIds = filteredIndustries.map((i) => i.id);
    if (allFilteredIndustriesSelected) {
      setFormData((prev) => ({
        ...prev,
        industries: prev.industries.filter((id) => !filteredIds.includes(id)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        industries: [...new Set([...prev.industries, ...filteredIds])],
      }));
    }
    if (errors.industries) setErrors((prev) => ({ ...prev, industries: null }));
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      locationName: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
    if (errors.locationName) {
      setErrors((prev) => ({ ...prev, locationName: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.vacancies || formData.vacancies < 1)
      newErrors.vacancies = "At least 1 vacancy required";
    if (formData.maxApplicants !== "" && Number(formData.maxApplicants) < 1) {
      newErrors.maxApplicants = "Max applicants must be at least 1";
    }
    if (!formData.locationName && !formData.isRemote) {
      newErrors.locationName = "Location is required for non-remote jobs";
    }
    if (formData.industries.length === 0)
      newErrors.industries = "Select at least one industry";
    if (formData.skills.length === 0)
      newErrors.skills = "Select at least one skill";

    if (
      formData.minSalary &&
      formData.maxSalary &&
      Number(formData.minSalary) > Number(formData.maxSalary)
    ) {
      newErrors.maxSalary = "Max salary must be greater than min salary";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const url = isEditMode
        ? `${BASE_URL}/recruiter/job/${jobData.id}`
        : `${BASE_URL}/recruiter/job`;

      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          maxApplicants:
            formData.maxApplicants === ""
              ? null
              : Number(formData.maxApplicants),
        }),
      });
      if (response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        if (errData.result?.requiresUpgrade) {
          setUpgradeModal({ open: true, message: errData.message || "" });
          setLoading(false);
          return;
        }
      }
      const data = await response.json();
      if (response.ok && data.status === "SUCCESS") {
        successMessage(
          data?.message ||
            `${isEditMode ? "Post Updated Successfully" : "Post Added Successfully"}`,
        );
        setReload((prev) => !prev);
        onClose(true);
      } else {
        setErrors({
          submit:
            data.message ||
            data.error ||
            "Failed to save job. Please try again.",
        });
        ErrorMessage(
          data.message || data.error || "Failed to save job. Please try again.",
        );
      }
    } catch (error) {
      setErrors({
        submit: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <GoogleMapsLoader>
      <Modal
        isOpen={isOpen}
        onClose={() => onClose(false)}
        title={isEditMode ? "Edit Job Posting" : "Post a New Job"}
        subtitle="Fill in the details to create an attractive job posting"
        size="xl"
      >
        {fetchingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader
              size={32}
              className="animate-spin text-theme_color dark:text-dark-theme_color"
            />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading form data...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fetch Error */}
            {errors.fetch && (
              <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle
                  size={20}
                  className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {errors.fetch}
                </span>
              </div>
            )}

            {/* Job Title */}
            <div>
              <label
                htmlFor="title"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                <Briefcase
                  size={16}
                  className="text-theme_color dark:text-dark-theme_color"
                />
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.title
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent`}
                placeholder="e.g., Front End Software Engineer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="6"
                className={`w-full px-4 py-2.5 border ${
                  errors.description
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent resize-y`}
                placeholder="Describe the role, responsibilities, and requirements..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Vacancies, Max Applicants, and Employment Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="vacancies"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Users
                    size={16}
                    className="text-theme_color dark:text-dark-theme_color"
                  />
                  Vacancies *
                </label>
                <input
                  type="number"
                  id="vacancies"
                  name="vacancies"
                  min="1"
                  value={formData.vacancies}
                  onChange={handleNumberChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.vacancies
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent`}
                />
                {errors.vacancies && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.vacancies}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="maxApplicants"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Users
                    size={16}
                    className="text-theme_color dark:text-dark-theme_color"
                  />
                  Maximum Applicants
                </label>
                <input
                  type="number"
                  id="maxApplicants"
                  name="maxApplicants"
                  min="1"
                  value={formData.maxApplicants}
                  onChange={handleNumberChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.maxApplicants
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent`}
                  placeholder="20"
                />
                {errors.maxApplicants && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.maxApplicants}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="employmentType"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Clock
                    size={16}
                    className="text-theme_color dark:text-dark-theme_color"
                  />
                  Employment Type *
                </label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent"
                >
                  {employmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label
                htmlFor="experienceLevel"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Experience Level *
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent"
              >
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <MapPin
                  size={16}
                  className="text-theme_color dark:text-dark-theme_color"
                />
                Location {!formData.isRemote && "*"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.locationName}
                  readOnly
                  onClick={() => setShowLocationPicker(true)}
                  className={`flex-1 px-4 py-2.5 border ${
                    errors.locationName
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent`}
                  placeholder="Click to select location"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="px-6 py-2.5 bg-theme_color dark:bg-dark-theme_color text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Select
                </button>
              </div>
              {errors.locationName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.locationName}
                </p>
              )}

              <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-theme_color dark:text-dark-theme_color bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color"
                />
                <Globe
                  size={16}
                  className="text-gray-500 dark:text-gray-400 group-hover:text-theme_color dark:group-hover:text-dark-theme_color transition-colors"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Remote Position
                </span>
              </label>
            </div>

            {/* Salary Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign
                  size={16}
                  className="text-theme_color dark:text-dark-theme_color"
                />
                Salary Range
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  name="minSalary"
                  value={formData.minSalary}
                  onChange={handleNumberChange}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent"
                  placeholder="Min salary"
                />
                <span className="hidden sm:flex items-center text-gray-500 dark:text-gray-400">
                  —
                </span>
                <input
                  type="number"
                  name="maxSalary"
                  value={formData.maxSalary}
                  onChange={handleNumberChange}
                  className={`flex-1 px-4 py-2.5 border ${
                    errors.maxSalary
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent`}
                  placeholder="Max salary"
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full sm:w-24 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color focus:border-transparent"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
              {errors.maxSalary && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.maxSalary}
                </p>
              )}

              <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="showSalary"
                  checked={formData.showSalary}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-theme_color dark:text-dark-theme_color bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color"
                />
                {formData.showSalary ? (
                  <Eye
                    size={16}
                    className="text-gray-500 dark:text-gray-400 group-hover:text-theme_color dark:group-hover:text-dark-theme_color transition-colors"
                  />
                ) : (
                  <EyeOff
                    size={16}
                    className="text-gray-500 dark:text-gray-400 group-hover:text-theme_color dark:group-hover:text-dark-theme_color transition-colors"
                  />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show salary on job posting
                </span>
              </label>
            </div>

            {/* Industries */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Industries * ({formData.industries.length} selected)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllIndustries}
                  className="flex items-center gap-1.5 text-xs font-medium text-theme_color dark:text-dark-theme_color hover:opacity-75 transition-opacity"
                >
                  {allFilteredIndustriesSelected ? (
                    <>
                      <CheckSquare size={14} />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square size={14} />
                      Select All
                    </>
                  )}
                  {industrySearch && " (filtered)"}
                </button>
              </div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    />
                    <input
                      type="text"
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                      placeholder="Search industries..."
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-theme_color dark:focus:ring-dark-theme_color"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800/50">
                  {filteredIndustries.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No industries found
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredIndustries.map((industry) => (
                        <label
                          key={industry.id}
                          className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <input
                            type="checkbox"
                            checked={formData.industries.includes(industry.id)}
                            onChange={() =>
                              handleMultiSelect("industries", industry.id)
                            }
                            className="w-4 h-4 text-theme_color dark:text-dark-theme_color bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color"
                          />
                          <span
                            className={`text-sm ${
                              formData.industries.includes(industry.id)
                                ? "text-theme_color dark:text-dark-theme_color font-medium"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {industry.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {errors.industries && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.industries}
                </p>
              )}
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Required Skills * ({formData.skills.length} selected)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllSkills}
                  className="flex items-center gap-1.5 text-xs font-medium text-theme_color dark:text-dark-theme_color hover:opacity-75 transition-opacity"
                >
                  {allFilteredSkillsSelected ? (
                    <>
                      <CheckSquare size={14} />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square size={14} />
                      Select All
                    </>
                  )}
                  {skillSearch && " (filtered)"}
                </button>
              </div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    />
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skills..."
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-theme_color dark:focus:ring-dark-theme_color"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800/50">
                  {filteredSkills.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No skills found
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredSkills.map((skill) => (
                        <label
                          key={skill.id}
                          className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill.id)}
                            onChange={() =>
                              handleMultiSelect("skills", skill.id)
                            }
                            className="w-4 h-4 text-theme_color dark:text-dark-theme_color bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-theme_color dark:focus:ring-dark-theme_color"
                          />
                          <span
                            className={`text-sm ${
                              formData.skills.includes(skill.id)
                                ? "text-theme_color dark:text-dark-theme_color font-medium"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {skill.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {errors.skills && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.skills}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle
                  size={20}
                  className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {errors.submit}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => onClose(false)}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg font-medium text-white bg-theme_color dark:bg-dark-theme_color hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
              >
                {loading && <Loader size={16} className="animate-spin" />}
                {loading ? "Saving..." : isEditMode ? "Update Job" : "Post Job"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={handleLocationSelect}
        initialLocation={formData.locationName}
      />
    </GoogleMapsLoader>

    <UpgradeModal
      open={upgradeModal.open}
      onClose={() => setUpgradeModal({ open: false, message: "" })}
      feature="Job Posting"
      message={upgradeModal.message}
    />
    </>
  );
};

export default JobPostingModal;