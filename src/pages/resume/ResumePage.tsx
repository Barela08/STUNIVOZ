import React, { useState, useRef } from 'react';
import { FileText, Plus, Download, Share, Eye, Edit, Trash2, CheckCircle, AlertCircle, Sparkles, X, Save, ExternalLink, Upload, FileDown } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Textarea, FileUpload } from '../../components/common';
import type { UploadResult } from '../../services/uploadService';

type Resume = {
  id: string;
  title: string;
  createdAt: string;
  atsScore: number;
  isDefault: boolean;
};

type ResumeForm = {
  title: string;
  summary: string;
  education: { school: string; degree: string; year: string; cgpa: string }[];
  skills: string[];
  projects: { title: string; description: string; techStack: string }[];
  experience: { company: string; role: string; duration: string; description: string }[];
  certifications: string[];
  achievements: string[];
};

const blankForm = (): ResumeForm => ({
  title: '',
  summary: '',
  education: [{ school: '', degree: '', year: '', cgpa: '' }],
  skills: [],
  projects: [{ title: '', description: '', techStack: '' }],
  experience: [],
  certifications: [],
  achievements: [],
});

export const ResumePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'upload'>('builder');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResumeForm>(blankForm());
  const [newSkill, setNewSkill] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [viewResume, setViewResume] = useState<Resume | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; date: string; url: string }[]>([]);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = resumes.find(r => r.id === selectedId) || null;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const createResume = () => {
    if (!newTitle.trim()) return;
    const newResume: Resume = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      atsScore: 0,
      isDefault: resumes.length === 0,
    };
    setResumes(prev => [...prev, newResume]);
    setSelectedId(newResume.id);
    setFormData(blankForm());
    setShowNewModal(false);
    setNewTitle('');
    showToast(`Resume "${newResume.title}" created!`);
  };

  const deleteResume = (id: string) => {
    const resume = resumes.find(r => r.id === id);
    setResumes(prev => prev.filter(r => r.id !== id));
    if (selectedId === id) {
      const remaining = resumes.filter(r => r.id !== id);
      setSelectedId(remaining[0]?.id || null);
    }
    showToast(`Deleted "${resume?.title}"`, 'error');
  };

  const saveResume = async () => {
    if (!selectedId) { showToast('Select or create a resume first', 'error'); return; }
    if (!formData.summary.trim()) { showToast('Please add a summary', 'error'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const score = Math.min(
      100,
      20 +
        (formData.summary.length > 50 ? 15 : 0) +
        (formData.education[0]?.school ? 10 : 0) +
        formData.skills.length * 3 +
        formData.projects.length * 10 +
        formData.certifications.length * 5 +
        formData.experience.length * 10
    );
    setResumes(prev =>
      prev.map(r => r.id === selectedId ? { ...r, atsScore: score } : r)
    );
    setSaving(false);
    showToast('Resume saved! ATS score updated.');
  };

  const generateWithAI = async () => {
    if (!selectedId) { showToast('Select or create a resume first', 'error'); return; }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    setFormData(prev => ({
      ...prev,
      summary: prev.summary || 'Results-driven Computer Science student with strong foundations in full-stack development. Proficient in React, TypeScript, and Node.js. Passionate about building scalable web applications and contributing to open-source projects. Seeking an internship to apply academic knowledge to real-world engineering challenges.',
      skills: prev.skills.length ? prev.skills : ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Git', 'CSS', 'REST APIs'],
      projects: prev.projects[0]?.title ? prev.projects : [
        { title: 'E-Commerce Platform', description: 'Built a full-stack e-commerce app with cart, auth, and payment integration.', techStack: 'MERN Stack' },
        { title: 'Portfolio Website', description: 'Responsive personal portfolio with dark mode and animations.', techStack: 'React, Tailwind CSS' },
      ],
    }));
    setGenerating(false);
    showToast('AI content generated! Review and edit as needed.');
  };

  const downloadPDF = () => {
    if (!selected) { showToast('Select a resume first', 'error'); return; }
    const content = `
RESUME: ${selected.title}
Generated on: ${new Date().toLocaleDateString()}

SUMMARY:
${formData.summary || 'No summary added.'}

EDUCATION:
${formData.education.map(e => `${e.degree} - ${e.school} (${e.year}) | CGPA: ${e.cgpa}`).join('\n')}

SKILLS:
${formData.skills.join(', ') || 'None added.'}

PROJECTS:
${formData.projects.map(p => `${p.title}: ${p.description} [${p.techStack}]`).join('\n')}

CERTIFICATIONS:
${formData.certifications.join(', ') || 'None.'}

ACHIEVEMENTS:
${formData.achievements.join(', ') || 'None.'}

ATS Score: ${selected.atsScore}/100
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.title.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Resume downloaded!');
  };

  const shareResume = () => {
    if (!selected) { showToast('Select a resume first', 'error'); return; }
    const link = `https://stunivoz.app/resume/share/${selected.id}`;
    setShareLink(link);
    navigator.clipboard.writeText(link).catch(() => {});
    showToast('Share link copied to clipboard!');
  };


  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (formData.skills.includes(newSkill.trim())) { showToast('Skill already added', 'error'); return; }
    setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addEducation = () => {
    setFormData(prev => ({ ...prev, education: [...prev.education, { school: '', degree: '', year: '', cgpa: '' }] }));
  };

  const addProject = () => {
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { title: '', description: '', techStack: '' }] }));
  };

  const addExperience = () => {
    setFormData(prev => ({ ...prev, experience: [...prev.experience, { company: '', role: '', duration: '', description: '' }] }));
  };

  const atsColor = (score: number) => score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* New Resume Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Create New Resume</h3>
              <button onClick={() => { setShowNewModal(false); setNewTitle(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Input
              label="Resume Title"
              placeholder="e.g. Frontend Developer Resume"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createResume()}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowNewModal(false); setNewTitle(''); }}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={createResume} disabled={!newTitle.trim()}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Resume Modal */}
      {viewResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{viewResume.title}</h3>
              <button onClick={() => setViewResume(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-1">Summary</p>
                <p className="text-gray-700">{formData.summary || 'No summary added.'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-1">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length ? formData.skills.map(s => (
                    <span key={s} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">{s}</span>
                  )) : <span className="text-gray-400">None added.</span>}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-1">Education</p>
                {formData.education.map((e, i) => (
                  <p key={i} className="text-gray-700">{e.degree} — {e.school} ({e.year}) | CGPA: {e.cgpa}</p>
                ))}
              </div>
              <div>
                <p className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-1">Projects</p>
                {formData.projects.map((p, i) => (
                  <div key={i} className="mb-2">
                    <p className="font-medium text-gray-900">{p.title} <span className="font-normal text-gray-500">— {p.techStack}</span></p>
                    <p className="text-gray-600">{p.description}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-gray-500">ATS Score</span>
                <span className="font-bold text-lg" style={{ color: atsColor(viewResume.atsScore) }}>{viewResume.atsScore}/100</span>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setViewResume(null); setSelectedId(viewResume.id); }}>
                <Edit className="w-4 h-4" /> Edit
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => { setViewResume(null); downloadPDF(); }}>
                <Download className="w-4 h-4" /> Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      {shareLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Share Resume</h3>
              <button onClick={() => setShareLink(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Anyone with this link can view your resume:</p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-600 flex-1 break-all">{shareLink}</span>
              <button onClick={() => { navigator.clipboard.writeText(shareLink); showToast('Copied!'); }} className="text-primary-600 hover:text-primary-700 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
            <Button variant="primary" className="w-full mt-4" onClick={() => setShareLink(null)}>Done</Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-500">Create and manage your professional resumes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setActiveTab('upload'); }}>
            <Upload className="w-4 h-4" /> Upload Resume
          </Button>
          <Button variant="primary" onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4" /> New Resume
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['builder', 'upload'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'builder' ? 'Resume Builder' : 'Uploaded Resumes'}
          </button>
        ))}
      </div>

      {activeTab === 'builder' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Builder Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Saved Resumes */}
            <Card padding="none">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">My Resumes</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowNewModal(true)}>
                  <Plus className="w-4 h-4" /> New
                </Button>
              </div>
              {resumes.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No resumes yet.</p>
                  <Button variant="primary" size="sm" className="mt-3" onClick={() => setShowNewModal(true)}>
                    <Plus className="w-4 h-4" /> Create your first resume
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => setSelectedId(resume.id)}
                      className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${selectedId === resume.id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingId === resume.id ? (
                          <input
                            className="border border-primary-300 rounded px-2 py-1 text-sm font-medium w-full focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                if (editTitle.trim()) setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, title: editTitle.trim() } : r));
                                setEditingId(null);
                              }
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 truncate">{resume.title}</h4>
                            {resume.isDefault && <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded shrink-0">Default</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-sm text-gray-500">{resume.createdAt}</p>
                          <span className="text-xs font-semibold" style={{ color: atsColor(resume.atsScore) }}>
                            ATS: {resume.atsScore}/100
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => setViewResume(resume)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingId(resume.id); setEditTitle(resume.title); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteResume(resume.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {selectedId ? (
              <>
                {/* Professional Summary */}
                <Card>
                  <CardHeader title="Professional Summary" />
                  <CardContent>
                    <Textarea
                      value={formData.summary}
                      onChange={e => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Write a brief professional summary (2–4 lines)..."
                      rows={4}
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.summary.length} characters</p>
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader
                    title="Education"
                    action={<Button variant="ghost" size="sm" onClick={addEducation}><Plus className="w-4 h-4" /> Add</Button>}
                  />
                  <CardContent>
                    <div className="space-y-4">
                      {formData.education.map((edu, index) => (
                        <div key={index} className="grid md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                          <Input placeholder="School/University" value={edu.school}
                            onChange={e => setFormData(prev => ({ ...prev, education: prev.education.map((ed, i) => i === index ? { ...ed, school: e.target.value } : ed) }))} />
                          <Input placeholder="Degree (B.Tech)" value={edu.degree}
                            onChange={e => setFormData(prev => ({ ...prev, education: prev.education.map((ed, i) => i === index ? { ...ed, degree: e.target.value } : ed) }))} />
                          <Input placeholder="Year (2025)" value={edu.year}
                            onChange={e => setFormData(prev => ({ ...prev, education: prev.education.map((ed, i) => i === index ? { ...ed, year: e.target.value } : ed) }))} />
                          <Input placeholder="CGPA (8.5)" value={edu.cgpa}
                            onChange={e => setFormData(prev => ({ ...prev, education: prev.education.map((ed, i) => i === index ? { ...ed, cgpa: e.target.value } : ed) }))} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader title="Skills" subtitle="Add your technical skills" />
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full flex items-center gap-1.5 text-sm">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="hover:text-primary-900"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill (e.g. React)"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addSkill()}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={addSkill} disabled={!newSkill.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Projects */}
                <Card>
                  <CardHeader
                    title="Projects"
                    action={<Button variant="ghost" size="sm" onClick={addProject}><Plus className="w-4 h-4" /> Add</Button>}
                  />
                  <CardContent>
                    <div className="space-y-4">
                      {formData.projects.map((project, index) => (
                        <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <Input placeholder="Project Title" value={project.title}
                            onChange={e => setFormData(prev => ({ ...prev, projects: prev.projects.map((p, i) => i === index ? { ...p, title: e.target.value } : p) }))} />
                          <Textarea placeholder="Brief description of what you built" value={project.description} rows={2}
                            onChange={e => setFormData(prev => ({ ...prev, projects: prev.projects.map((p, i) => i === index ? { ...p, description: e.target.value } : p) }))} />
                          <Input placeholder="Tech Stack (e.g. React, Node.js, MongoDB)" value={project.techStack}
                            onChange={e => setFormData(prev => ({ ...prev, projects: prev.projects.map((p, i) => i === index ? { ...p, techStack: e.target.value } : p) }))} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card>
                  <CardHeader
                    title="Work Experience"
                    action={<Button variant="ghost" size="sm" onClick={addExperience}><Plus className="w-4 h-4" /> Add</Button>}
                  />
                  <CardContent>
                    {formData.experience.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No experience added yet. Click + Add to add.</p>
                    ) : (
                      <div className="space-y-4">
                        {formData.experience.map((exp, index) => (
                          <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                            <div className="grid md:grid-cols-3 gap-2">
                              <Input placeholder="Company" value={exp.company}
                                onChange={e => setFormData(prev => ({ ...prev, experience: prev.experience.map((ex, i) => i === index ? { ...ex, company: e.target.value } : ex) }))} />
                              <Input placeholder="Role / Position" value={exp.role}
                                onChange={e => setFormData(prev => ({ ...prev, experience: prev.experience.map((ex, i) => i === index ? { ...ex, role: e.target.value } : ex) }))} />
                              <Input placeholder="Duration (e.g. Jun–Aug 2025)" value={exp.duration}
                                onChange={e => setFormData(prev => ({ ...prev, experience: prev.experience.map((ex, i) => i === index ? { ...ex, duration: e.target.value } : ex) }))} />
                            </div>
                            <Textarea placeholder="Key responsibilities and achievements..." value={exp.description} rows={2}
                              onChange={e => setFormData(prev => ({ ...prev, experience: prev.experience.map((ex, i) => i === index ? { ...ex, description: e.target.value } : ex) }))} />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={saveResume} loading={saving}>
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Save Resume'}
                  </Button>
                  <Button variant="primary" onClick={generateWithAI} loading={generating}>
                    <Sparkles className="w-4 h-4" />
                    {generating ? 'Generating…' : 'Generate with AI'}
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Select a resume from above or create a new one to start editing.</p>
                    <Button variant="primary" className="mt-4" onClick={() => setShowNewModal(true)}>
                      <Plus className="w-4 h-4" /> Create Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-4">
            {/* ATS Score */}
            <Card>
              <CardHeader title="ATS Score" subtitle="Resume optimization" />
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                      <circle
                        cx="64" cy="64" r="56"
                        stroke={selected ? atsColor(selected.atsScore) : '#e5e7eb'}
                        strokeWidth="8" fill="none"
                        strokeDasharray="351.86"
                        strokeDashoffset={351.86 - (351.86 * (selected?.atsScore || 0)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{selected?.atsScore || 0}</div>
                        <div className="text-xs text-gray-500">/ 100</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {formData.summary.length > 50 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    <span className="text-gray-600">Professional summary</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {formData.skills.length >= 5 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    <span className="text-gray-600">{formData.skills.length < 5 ? `Add ${5 - formData.skills.length} more skills` : 'Good skill coverage'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {formData.projects.some(p => p.title) ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    <span className="text-gray-600">Projects section</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {formData.experience.length > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    <span className="text-gray-600">Work experience</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={saveResume} loading={saving}>
                  Recalculate Score
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader title="Quick Actions" />
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={downloadPDF} disabled={!selected}>
                    <FileDown className="w-4 h-4" /> Download Resume
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={shareResume} disabled={!selected}>
                    <Share className="w-4 h-4" /> Share Link
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => selected && setViewResume(selected)} disabled={!selected}>
                    <Eye className="w-4 h-4" /> Preview Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Upload Area */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader title="Upload Your Resume" subtitle="Securely stored on Cloudinary — images and PDFs supported" />
              <CardContent>
                <FileUpload
                  folder="stunivoz/resumes"
                  accept="application/pdf,image/jpeg,image/png"
                  label="Upload Resume (PDF or Image)"
                  onSuccess={(result: UploadResult) => {
                    const kb = (result.bytes / 1024).toFixed(0);
                    setUploadedFiles(prev => [{
                      name: result.public_id.split('/').pop() || 'resume',
                      size: `${kb} KB`,
                      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                      url: result.secure_url,
                    }, ...prev]);
                    showToast('Resume uploaded to Cloudinary!');
                  }}
                  onError={(err) => showToast(err, 'error')}
                />
              </CardContent>
            </Card>
          </div>

          {/* Uploaded Resumes */}
          <div className="space-y-4">
            <Card padding="none">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Uploaded Resumes</h3>
              </div>
              {uploadedFiles.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">No uploads yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="p-4 flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{file.name}</h4>
                        <p className="text-xs text-gray-500">{file.size} · {file.date}</p>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
