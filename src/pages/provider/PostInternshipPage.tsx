import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/common';
import {
  Save, Send, CheckCircle, AlertCircle, Briefcase, MapPin,
  DollarSign, Clock, Users, Tag, FileText, ChevronRight, ChevronLeft, Zap, Star
} from 'lucide-react';
import { addDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

type Step = 1 | 2 | 3;

const steps = [
  { id: 1, label: 'Basic Info', icon: Briefcase },
  { id: 2, label: 'Details', icon: FileText },
  { id: 3, label: 'Preview & Publish', icon: Send },
];

export const PostInternshipPage: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'draft'>('idle');
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'internship',
    location: '',
    workplaceType: 'remote',
    duration: '6',
    stipend: '',
    stipendType: 'monthly',
    openings: '1',
    experience: 'fresher',
    deadline: '',
    skills: '',
    description: '',
    responsibilities: '',
    perks: '',
    featured: false,
    autoClose: true,
    visibility: 'public',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const isStep1Valid = form.title.trim() && form.location.trim();
  const isStep2Valid = form.description.trim() && form.skills.trim();

  const handleSubmit = async (isDraft = false) => {
    if (!isStep1Valid || (!isDraft && !isStep2Valid)) { setStatus('error'); return; }
    isDraft ? setDraftLoading(true) : setLoading(true);
    setStatus('idle');

    const result = await addDocument('internships', {
      ...form,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      perks: form.perks.split(',').map(s => s.trim()).filter(Boolean),
      status: isDraft ? 'draft' : 'published',
      postedBy: user?.uid || 'unknown',
      applicants: 0,
      createdAt: new Date().toISOString(),
    });

    isDraft ? setDraftLoading(false) : setLoading(false);
    if (result.success) {
      setStatus(isDraft ? 'draft' : 'success');
      if (!isDraft) {
        setForm({ title: '', type: 'internship', location: '', workplaceType: 'remote', duration: '6', stipend: '', stipendType: 'monthly', openings: '1', experience: 'fresher', deadline: '', skills: '', description: '', responsibilities: '', perks: '', featured: false, autoClose: true, visibility: 'public' });
        setStep(1);
      }
    } else {
      setStatus('error');
    }
  };

  const fieldClass = "w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Post New Internship</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Find top student talent for your team</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(true)}
            disabled={!isStep1Valid || draftLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Save className="w-4 h-4" />
            {draftLoading ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-green-700 dark:text-green-400 font-semibold">Internship published successfully!</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Students can now discover and apply to your listing.</p>
          </div>
        </div>
      )}
      {status === 'draft' && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <Save className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold">Draft saved! You can publish it anytime.</p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400 font-semibold">Please fill in all required fields before continuing.</p>
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => s.id < step ? setStep(s.id as Step) : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                step === s.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30'
                  : s.id < step
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              {s.id < step ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full ${s.id < step ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader title="Basic Information" />
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Internship Title <span className="text-red-500">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Frontend Developer Intern" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select name="type" value={form.type} onChange={handleChange} className={fieldClass}>
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time Job</option>
                  <option value="freelance">Freelance / Contract</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Location <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore, India" className={`${fieldClass} pl-9`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Workplace Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['remote', 'onsite', 'hybrid'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, workplaceType: t }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border ${
                        form.workplaceType === t
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                      }`}
                    >{t === 'onsite' ? 'On-site' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Duration</label>
                <select name="duration" value={form.duration} onChange={handleChange} className={fieldClass}>
                  {['1','2','3','4','6','12'].map(d => <option key={d} value={d}>{d} Month{parseInt(d) > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Openings</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" name="openings" value={form.openings} onChange={handleChange} min="1" className={`${fieldClass} pl-9`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Experience Required</label>
                <select name="experience" value={form.experience} onChange={handleChange} className={fieldClass}>
                  <option value="fresher">Fresher</option>
                  <option value="0-1">0–1 Year</option>
                  <option value="1-2">1–2 Years</option>
                  <option value="2+">2+ Years</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Stipend / Salary</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input name="stipend" value={form.stipend} onChange={handleChange} placeholder="e.g. ₹15,000" className={`${fieldClass} pl-9`} />
                  </div>
                  <select name="stipendType" value={form.stipendType} onChange={handleChange} className={`${fieldClass} w-auto`}>
                    <option value="monthly">/mo</option>
                    <option value="weekly">/wk</option>
                    <option value="lump">Lump</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Application Deadline</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className={`${fieldClass} pl-9`} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => { if (isStep1Valid) setStep(2); else setStatus('error'); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
              >
                Next: Job Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <Card>
          <CardHeader title="Job Details & Requirements" />
          <CardContent className="space-y-5">
            <div>
              <label className={labelClass}>Required Skills <span className="text-red-500">*</span></label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, TypeScript, Node.js (comma separated)" className={`${fieldClass} pl-9`} />
              </div>
              {form.skills && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.skills.split(',').filter(s => s.trim()).map((s, i) => (
                    <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-medium">{s.trim()}</span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Job Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe the role, what the intern will work on, and what they'll learn..."
                className={`${fieldClass} resize-none`} />
            </div>

            <div>
              <label className={labelClass}>Key Responsibilities</label>
              <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={4} placeholder="• Design and develop frontend features&#10;• Collaborate with product team&#10;• Write clean, maintainable code"
                className={`${fieldClass} resize-none`} />
            </div>

            <div>
              <label className={labelClass}>Perks & Benefits</label>
              <input name="perks" value={form.perks} onChange={handleChange} placeholder="Certificate, Letter of Recommendation, PPO, Flexible Hours (comma separated)" className={fieldClass} />
              {form.perks && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.perks.split(',').filter(s => s.trim()).map((s, i) => (
                    <span key={i} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-lg font-medium">✓ {s.trim()}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className={labelClass}>Visibility</label>
                <select name="visibility" value={form.visibility} onChange={handleChange} className={fieldClass}>
                  <option value="public">Public (all students)</option>
                  <option value="registered">Registered users only</option>
                  <option value="premium">Premium students only</option>
                </select>
              </div>
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="autoClose" checked={form.autoClose} onChange={handleChange} className="w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Auto-close on deadline</p>
                    <p className="text-xs text-gray-400">Listing closes automatically</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      Featured Listing <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    </p>
                    <p className="text-xs text-gray-400">Shown prominently to students</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => { if (isStep2Valid) setStep(3); else setStatus('error'); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
              >
                Preview Listing <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview & Publish */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Listing Preview</h3>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full font-semibold">Preview Mode</span>
            </div>
            <CardContent className="space-y-5">
              {/* Preview Header */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">T</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg">{form.title || 'Internship Title'}</h2>
                    {form.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">TechCorp India</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {form.location || 'Location'} ({form.workplaceType})</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {form.duration} months</span>
                    {form.stipend && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {form.stipend}/{form.stipendType}</span>}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {form.openings} opening{parseInt(form.openings) > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {form.skills && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.split(',').filter(s => s.trim()).map((s, i) => (
                      <span key={i} className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg font-medium">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {form.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">About This Role</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{form.description}</p>
                </div>
              )}

              {/* Perks */}
              {form.perks && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Perks & Benefits</p>
                  <div className="flex flex-wrap gap-2">
                    {form.perks.split(',').filter(s => s.trim()).map((s, i) => (
                      <span key={i} className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg font-medium">✓ {s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                {[
                  { label: 'Type', value: form.type.charAt(0).toUpperCase() + form.type.slice(1) },
                  { label: 'Visibility', value: form.visibility.charAt(0).toUpperCase() + form.visibility.slice(1) },
                  { label: 'Auto-close', value: form.autoClose ? 'Yes' : 'No' },
                  { label: 'Deadline', value: form.deadline || 'Not set' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-3">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              <ChevronLeft className="w-4 h-4" /> Edit Details
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit(true)}
                disabled={draftLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-all"
              >
                <Save className="w-4 h-4" /> {draftLoading ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
              >
                <Zap className="w-4 h-4" /> {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
