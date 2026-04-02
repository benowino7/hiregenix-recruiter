// CvBuilder.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Link as LinkIcon,
  MapPin,
  DollarSign,
  Globe,
  Heart,
  Plus,
  Trash2,
  Loader2,
  Camera,
  Image as ImageIcon,
  Lock
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { BASE_URL } from '../BaseUrl';
import UpgradeModal from './UpgradeModal';

// ────────────────────────────────────────────────
// Types & Initial Data
// ────────────────────────────────────────────────
const initialData = {
  personal: {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    photo: ''
  },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  links: {
    linkedin: '',
    github: '',
    portfolio: '',
    other: ''
  },
  preferences: {
    jobTitles: [],
    industries: [],
    jobType: 'Full-time',
    workMode: 'On-site',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    relocate: false
  }
};

// Quill toolbar configuration
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'font': [] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['clean']
  ]
};

const quillFormats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'size', 'font',
  'color', 'background',
  'align'
];

function CvBuilder({ subscription }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('topdubai_cv_draft');
    return saved ? JSON.parse(saved) : initialData;
  });

  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState('modern');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ open: false, message: '' });
  const photoInputRef = useRef(null);

  const totalSteps = 8;
  const token = JSON.parse(sessionStorage.getItem('accessToken'));

  const isPaidSubscriber = useMemo(() => {
    if (!subscription) return false;
    const planName = (subscription?.subscription?.plan?.name || '').toLowerCase();
    return subscription?.subscription?.status === 'ACTIVE' && planName !== 'free trial';
  }, [subscription]);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('topdubai_cv_draft', JSON.stringify(data));
  }, [data]);

  // ─── Helpers ───
  const update = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addItem = (section, newItem) => {
    setData(prev => ({
      ...prev,
      [section]: [...prev[section], { id: Date.now().toString(), ...newItem }]
    }));
  };

  const updateItem = (section, id, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (section, id) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      setData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
  };

  const removeSkill = (skill) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addPreferenceItem = (field, value) => {
    const trimmed = value.trim();
    if (trimmed && !data.preferences[field].includes(trimmed)) {
      setData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: [...prev.preferences[field], trimmed]
        }
      }));
    }
  };

  const removePreferenceItem = (field, value) => {
    setData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: prev.preferences[field].filter(v => v !== value)
      }
    }));
  };

  // ─── Photo Upload ───
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      update('personal', 'photo', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  // ─── PDF Export ───
  const handleExportPdf = async () => {
    if (!isPaidSubscriber) {
      setUpgradeModal({ open: true, message: 'PDF export is available for paid subscribers only. Upgrade to download your CV as a professional PDF.' });
      return;
    }

    setPdfLoading(true);
    try {
      const templateMap = { modern: 36, professional: 0, minimal: 34 };
      const templateId = templateMap[template] || 36;

      const response = await fetch(`${BASE_URL}/recruiter/cv/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cvData: data, templateId })
      });

      if (response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        if (errData.result?.requiresUpgrade) {
          setUpgradeModal({ open: true, message: errData.message || '' });
          return;
        }
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || 'Failed to generate PDF');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = [data.personal.firstName, data.personal.lastName].filter(Boolean).join('_') || 'CV';
      a.href = url;
      a.download = `${name}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // ─── Save Draft ───
  const handleSaveDraft = () => {
    localStorage.setItem('topdubai_cv_draft', JSON.stringify(data));
    alert('Draft saved successfully!');
  };

  // ─── Progress ───
  const stepLabels = ['Personal', 'Summary', 'Skills', 'Experience', 'Education', 'Certifications', 'Links', 'Preferences'];
  const stepIcons = [User, FileText, Award, Briefcase, GraduationCap, Award, LinkIcon, Heart];

  const Progress = () => (
    <div className="mb-8">
      <div className="flex justify-between text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
        <span className="font-semibold">{stepLabels[step - 1]}</span>
        <span className="text-theme_color font-bold">{step} / {totalSteps}</span>
      </div>
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-amber-500 transition-all duration-500 rounded-full"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <button
            key={i}
            onClick={() => setStep(i + 1)}
            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
              i + 1 === step
                ? 'bg-theme_color text-white shadow-lg shadow-teal-500/30 scale-110'
                : i + 1 < step
                ? 'bg-theme_color/20 text-theme_color'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Form Content ───
  const inputClass = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme_color/50 focus:border-theme_color dark:bg-gray-800 dark:text-white transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const cardClass = "border border-gray-200 dark:border-gray-700 rounded-2xl p-5 relative bg-white dark:bg-gray-800/50 shadow-sm";

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-theme_color/10 flex items-center justify-center">
                <User className="text-theme_color" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your basic contact details</p>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div
                onClick={() => photoInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-3 border-dashed border-theme_color/40 flex items-center justify-center cursor-pointer hover:border-theme_color transition-all bg-white dark:bg-gray-800 overflow-hidden flex-shrink-0"
              >
                {data.personal.photo ? (
                  <img src={data.personal.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto text-theme_color/50" size={24} />
                    <span className="text-xs text-gray-400 mt-1 block">Add Photo</span>
                  </div>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload a professional photo (max 2MB). This will appear on your CV.</p>
                {data.personal.photo && (
                  <button
                    onClick={() => update('personal', 'photo', '')}
                    className="text-xs text-red-500 hover:text-red-700 mt-2 font-medium"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  required
                  value={data.personal.firstName}
                  onChange={e => update('personal', 'firstName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  required
                  value={data.personal.lastName}
                  onChange={e => update('personal', 'lastName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Professional Title</label>
                <input
                  placeholder="e.g. Senior Frontend Developer"
                  value={data.personal.title}
                  onChange={e => update('personal', 'title', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  type="email"
                  required
                  value={data.personal.email}
                  onChange={e => update('personal', 'email', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={data.personal.phone}
                  onChange={e => update('personal', 'phone', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Location</label>
                <input
                  placeholder="City, Country"
                  value={data.personal.location}
                  onChange={e => update('personal', 'location', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-theme_color/10 flex items-center justify-center">
                <FileText className="text-theme_color" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Professional Summary</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">A strong summary increases interview chances</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ReactQuill
                theme="snow"
                value={data.summary}
                onChange={(value) => setData(prev => ({ ...prev, summary: value }))}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Results-driven professional with 5+ years of experience..."
                className="cv-quill-editor"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use the toolbar to format text: bold, italic, lists, colors, font sizes and more.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-theme_color/10 flex items-center justify-center">
                <Award className="text-theme_color" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add your key skills and competencies</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {data.skills.map(skill => (
                <div
                  key={skill}
                  className="bg-gradient-to-r from-teal-50 to-amber-50 dark:from-teal-900/20 dark:to-amber-900/20 text-theme_color px-3 py-1.5 rounded-full flex items-center gap-2 text-sm border border-theme_color/20"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-theme_color hover:text-red-600 font-bold text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type a skill and press Enter..."
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = e.target.value.trim();
                  if (val) {
                    addSkill(val);
                    e.target.value = '';
                  }
                }
              }}
              className={inputClass}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Examples: React, TypeScript, Leadership, Project Management, Python
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-theme_color/10 flex items-center justify-center">
                <Briefcase className="text-theme_color" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add your professional experience</p>
              </div>
            </div>
            {data.experience.map((exp) => (
              <div key={exp.id} className={cardClass}>
                <button
                  onClick={() => removeItem('experience', exp.id)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input
                      value={exp.title}
                      onChange={e => updateItem('experience', exp.id, 'title', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <input
                      value={exp.company}
                      onChange={e => updateItem('experience', exp.id, 'company', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input
                      value={exp.location}
                      onChange={e => updateItem('experience', exp.id, 'location', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Employment Type</label>
                    <select
                      value={exp.type}
                      onChange={e => updateItem('experience', exp.id, 'type', e.target.value)}
                      className={inputClass}
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Freelance</option>
                      <option>Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={e => updateItem('experience', exp.id, 'startDate', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={e => updateItem('experience', exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                        className={inputClass + " disabled:opacity-50"}
                      />
                      <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={e => updateItem('experience', exp.id, 'current', e.target.checked)}
                          className="w-4 h-4 text-theme_color rounded"
                        />
                        <span className="text-gray-600 dark:text-gray-400">Present</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Responsibilities & Achievements</label>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={exp.description}
                      onChange={(value) => updateItem('experience', exp.id, 'description', value)}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Describe your key responsibilities and achievements..."
                      className="cv-quill-editor-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => addItem('experience', {
                title: '',
                company: '',
                location: '',
                type: 'Full-time',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
              })}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-amber-500 text-white rounded-xl hover:from-teal-600 hover:to-amber-600 shadow-lg shadow-teal-500/20 transition-all font-medium"
            >
              <Plus size={18} /> Add Experience
            </button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-theme_color/10 flex items-center justify-center">
                <GraduationCap className="text-theme_color" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your academic background</p>
              </div>
            </div>
            {data.education.map(edu => (
              <div key={edu.id} className={cardClass}>
                <button
                  onClick={() => removeItem('education', edu.id)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Degree</label>
                    <input
                      value={edu.degree}
                      onChange={e => updateItem('education', edu.id, 'degree', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Institution</label>
                    <input
                      value={edu.institution}
                      onChange={e => updateItem('education', edu.id, 'institution', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Field of Study</label>
                    <input
                      value={edu.field}
                      onChange={e => updateItem('education', edu.id, 'field', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Start Year</label>
                      <input
                        type="number"
                        value={edu.startYear}
                        onChange={e => updateItem('education', edu.id, 'startYear', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Year</label>
                      <input
                        type="number"
                        value={edu.endYear}
                        onChange={e => updateItem('education', edu.id, 'endYear', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => addItem('education', {
                degree: '',
                institution: '',
                field: '',
                startYear: '',
                endYear: ''
              })}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-amber-500 text-white rounded-xl hover:from-teal-600 hover:to-amber-600 shadow-lg shadow-teal-500/20 transition-all font-medium"
            >
              <Plus size={18} /> Add Education
            </button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-theme_color/10 flex items-center justify-center">
                <Award className="text-theme_color" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Certifications & Licenses</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Professional certifications you hold</p>
              </div>
            </div>
            {data.certifications.map(cert => (
              <div key={cert.id} className={cardClass}>
                <button
                  onClick={() => removeItem('certifications', cert.id)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Certification Name</label>
                    <input
                      value={cert.name}
                      onChange={e => updateItem('certifications', cert.id, 'name', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Issuing Organization</label>
                    <input
                      value={cert.issuer}
                      onChange={e => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Issue Year</label>
                    <input
                      type="number"
                      value={cert.issueYear}
                      onChange={e => updateItem('certifications', cert.id, 'issueYear', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Expiry Year (optional)</label>
                    <input
                      type="number"
                      value={cert.expiryYear || ''}
                      onChange={e => updateItem('certifications', cert.id, 'expiryYear', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => addItem('certifications', {
                name: '',
                issuer: '',
                issueYear: '',
                expiryYear: ''
              })}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-amber-500 text-white rounded-xl hover:from-teal-600 hover:to-amber-600 shadow-lg shadow-teal-500/20 transition-all font-medium"
            >
              <Plus size={18} /> Add Certification
            </button>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-theme_color/10 flex items-center justify-center">
                <LinkIcon className="text-theme_color" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio & Links</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your online profiles and portfolio</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>LinkedIn</label>
                <input
                  type="url"
                  value={data.links.linkedin}
                  onChange={e => update('links', 'linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>GitHub</label>
                <input
                  type="url"
                  value={data.links.github}
                  onChange={e => update('links', 'github', e.target.value)}
                  placeholder="https://github.com/..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Portfolio Website</label>
                <input
                  type="url"
                  value={data.links.portfolio}
                  onChange={e => update('links', 'portfolio', e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Other (Behance, Dribbble, etc.)</label>
                <input
                  type="url"
                  value={data.links.other}
                  onChange={e => update('links', 'other', e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-theme_color/10 flex items-center justify-center">
                <Heart className="text-theme_color" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Job Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">For AI matching and recommendations</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className={labelClass}>Preferred Job Titles</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.preferences.jobTitles.map(t => (
                    <div
                      key={t}
                      className="bg-gradient-to-r from-teal-50 to-amber-50 dark:from-teal-900/20 dark:to-amber-900/20 text-theme_color px-3 py-1.5 rounded-full flex items-center gap-2 text-sm border border-theme_color/20"
                    >
                      {t}
                      <button onClick={() => removePreferenceItem('jobTitles', t)} className="text-theme_color hover:text-red-600">&times;</button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type title and press Enter..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val) {
                        addPreferenceItem('jobTitles', val);
                        e.target.value = '';
                      }
                    }
                  }}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Preferred Industries</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.preferences.industries.map(ind => (
                    <div
                      key={ind}
                      className="bg-gradient-to-r from-teal-50 to-amber-50 dark:from-teal-900/20 dark:to-amber-900/20 text-theme_color px-3 py-1.5 rounded-full flex items-center gap-2 text-sm border border-theme_color/20"
                    >
                      {ind}
                      <button onClick={() => removePreferenceItem('industries', ind)} className="text-theme_color hover:text-red-600">&times;</button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type industry and press Enter..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val) {
                        addPreferenceItem('industries', val);
                        e.target.value = '';
                      }
                    }
                  }}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Preferred Job Type</label>
                  <select
                    value={data.preferences.jobType}
                    onChange={e => update('preferences', 'jobType', e.target.value)}
                    className={inputClass}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Freelance</option>
                    <option>Internship</option>
                    <option>Remote</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Preferred Work Mode</label>
                  <select
                    value={data.preferences.workMode}
                    onChange={e => update('preferences', 'workMode', e.target.value)}
                    className={inputClass}
                  >
                    <option>On-site</option>
                    <option>Hybrid</option>
                    <option>Remote</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Salary Expectation (Min)</label>
                  <input
                    type="number"
                    value={data.preferences.salaryMin}
                    onChange={e => update('preferences', 'salaryMin', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Salary Expectation (Max)</label>
                  <input
                    type="number"
                    value={data.preferences.salaryMax}
                    onChange={e => update('preferences', 'salaryMax', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Currency</label>
                  <select
                    value={data.preferences.currency}
                    onChange={e => update('preferences', 'currency', e.target.value)}
                    className={inputClass}
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>AED</option>
                    <option>KES</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    checked={data.preferences.relocate}
                    onChange={e => update('preferences', 'relocate', e.target.checked)}
                    className="w-5 h-5 text-theme_color rounded"
                  />
                  <label className="text-gray-700 dark:text-gray-300">Willing to relocate</label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Preview ───
  const renderPreview = () => {
    const base = "bg-white text-gray-900 p-10 max-w-4xl mx-auto shadow-xl rounded-2xl dark:bg-gray-900 dark:text-gray-100";

    const styleClass = {
      modern: base + ' border-t-4 border-theme_color',
      professional: base + ' border-l-8 border-theme_color',
      minimal: base + ' border-none shadow-md'
    }[template];

    return (
      <div className={styleClass}>
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            {data.personal.photo && (
              <img
                src={data.personal.photo}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-3 border-theme_color/30 flex-shrink-0"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">
                {data.personal.firstName || 'First'} {data.personal.lastName || 'Last'}
              </h1>
              <p className="text-lg text-theme_color mt-1 font-medium">
                {data.personal.title || 'Professional Title'}
              </p>
            </div>
          </div>
          <div className="text-right text-sm space-y-1 text-gray-500 dark:text-gray-400">
            <p>{data.personal.email || 'email@example.com'}</p>
            <p>{data.personal.phone || '+000 ...'}</p>
            <p>{data.personal.location || 'City, Country'}</p>
          </div>
        </div>

        {data.summary && (
          <div className="mb-8">
            <h2 className="text-lg font-bold border-b-2 border-theme_color/30 pb-2 mb-3 text-theme_color">Professional Summary</h2>
            <div className="leading-relaxed text-sm cv-preview-content" dangerouslySetInnerHTML={{ __html: data.summary }} />
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold border-b-2 border-theme_color/30 pb-2 mb-3 text-theme_color">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map(s => (
                <span key={s} className="bg-theme_color/10 text-theme_color px-3 py-1 rounded-full text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold border-b-2 border-theme_color/30 pb-2 mb-3 text-theme_color">Experience</h2>
            {data.experience.map(exp => (
              <div key={exp.id} className="mb-5">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold text-sm">{exp.title}</h3>
                    <p className="text-theme_color text-sm">{exp.company}{exp.location ? ` \u2022 ${exp.location}` : ''}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {exp.startDate} \u2013 {exp.current ? 'Present' : exp.endDate}
                  </p>
                </div>
                {exp.description && (
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 cv-preview-content" dangerouslySetInnerHTML={{ __html: exp.description }} />
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold border-b-2 border-theme_color/30 pb-2 mb-3 text-theme_color">Education</h2>
            {data.education.map(edu => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold text-sm">{edu.degree}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{edu.institution}{edu.field ? ` - ${edu.field}` : ''}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {edu.startYear}{edu.endYear ? ` - ${edu.endYear}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold border-b-2 border-theme_color/30 pb-2 mb-3 text-theme_color">Certifications</h2>
            {data.certifications.map(cert => (
              <div key={cert.id} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-sm">{cert.name}</h3>
                  <p className="text-xs text-gray-500">{cert.issueYear}</p>
                </div>
                {cert.issuer && <p className="text-gray-600 dark:text-gray-400 text-sm">{cert.issuer}</p>}
              </div>
            ))}
          </div>
        )}

        {Object.values(data.links).some(Boolean) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold border-b-2 border-theme_color/30 pb-2 mb-3 text-theme_color">Links</h2>
            <div className="space-y-1 text-sm">
              {data.links.linkedin && <p><span className="font-medium">LinkedIn:</span> {data.links.linkedin}</p>}
              {data.links.github && <p><span className="font-medium">GitHub:</span> {data.links.github}</p>}
              {data.links.portfolio && <p><span className="font-medium">Portfolio:</span> {data.links.portfolio}</p>}
              {data.links.other && <p><span className="font-medium">Other:</span> {data.links.other}</p>}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-amber-500 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl shadow-lg shadow-teal-500/10">
          <h1 className="text-2xl font-bold text-white">HireGeniX CV Builder</h1>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-medium text-sm backdrop-blur-sm"
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              onClick={handleExportPdf}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-5 py-2 bg-white text-teal-600 rounded-xl hover:bg-teal-50 transition-all font-semibold text-sm shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {pdfLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  {isPaidSubscriber ? <Download size={16} /> : <Lock size={16} />}
                  Export as PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row">
          {/* Form */}
          <div className="lg:w-1/2 xl:w-5/12 overflow-y-auto p-6 lg:p-8 bg-white dark:bg-gray-900 border-r dark:border-gray-800 min-h-[calc(100vh-80px)]">
            <Progress />

            <div className="max-w-2xl mx-auto space-y-8 pb-20">
              {renderStepContent()}

              <div className="pt-8 flex justify-between sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t dark:border-gray-800 -mx-6 px-6 lg:-mx-8 lg:px-8">
                <button
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>

                {step === totalSteps ? (
                  <button
                    onClick={handleExportPdf}
                    disabled={pdfLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-amber-500 text-white rounded-xl shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-amber-600 transition-all font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {pdfLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Generating...
                      </>
                    ) : (
                      <>
                        {isPaidSubscriber ? <Download size={18} /> : <Lock size={18} />}
                        Export as PDF
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-amber-500 text-white rounded-xl shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-amber-600 transition-all font-semibold"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview – desktop only */}
          <div className="hidden lg:block lg:w-1/2 xl:w-7/12 overflow-y-auto p-6 lg:p-8 bg-gray-100 dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
              <div className="flex gap-2">
                {['modern', 'professional', 'minimal'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`px-4 py-1.5 text-sm rounded-xl transition-all font-medium ${template === t
                        ? 'bg-gradient-to-r from-teal-500 to-amber-500 text-white shadow-md shadow-teal-500/20'
                        : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {renderPreview()}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, message: '' })}
        feature="CV PDF Export"
        message={upgradeModal.message}
      />

      {/* Custom Quill styles */}
      <style>{`
        .cv-quill-editor .ql-container {
          min-height: 150px;
          font-size: 14px;
          border: none;
        }
        .cv-quill-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 12px 12px 0 0;
        }
        .cv-quill-editor .ql-editor {
          min-height: 150px;
          padding: 16px;
        }
        .cv-quill-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        .cv-quill-editor-sm .ql-container {
          min-height: 100px;
          font-size: 14px;
          border: none;
        }
        .cv-quill-editor-sm .ql-toolbar {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 12px 12px 0 0;
        }
        .cv-quill-editor-sm .ql-editor {
          min-height: 100px;
          padding: 12px;
        }
        .cv-quill-editor-sm .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        .dark .cv-quill-editor .ql-toolbar,
        .dark .cv-quill-editor-sm .ql-toolbar {
          background: #1f2937;
          border-bottom-color: #374151;
        }
        .dark .cv-quill-editor .ql-toolbar button .ql-stroke,
        .dark .cv-quill-editor-sm .ql-toolbar button .ql-stroke {
          stroke: #9ca3af;
        }
        .dark .cv-quill-editor .ql-toolbar button .ql-fill,
        .dark .cv-quill-editor-sm .ql-toolbar button .ql-fill {
          fill: #9ca3af;
        }
        .dark .cv-quill-editor .ql-toolbar .ql-picker-label,
        .dark .cv-quill-editor-sm .ql-toolbar .ql-picker-label {
          color: #9ca3af;
        }
        .dark .cv-quill-editor .ql-editor,
        .dark .cv-quill-editor-sm .ql-editor {
          color: #e5e7eb;
        }
        .cv-preview-content ul { list-style: disc; padding-left: 20px; }
        .cv-preview-content ol { list-style: decimal; padding-left: 20px; }
        .cv-preview-content p { margin-bottom: 4px; }
        .cv-preview-content li { margin-bottom: 2px; }
      `}</style>
    </div>
  );
}

export default CvBuilder;
