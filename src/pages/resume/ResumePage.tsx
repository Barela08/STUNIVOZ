import React, { useMemo, useState } from 'react';
import { FileText, Upload, Plus, Download, Trash2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Textarea, EmptyState, Loading } from '../../components/common';
import { addDocument, deleteDocument, uploadFile } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Resume } from '../../types';

export const ResumePage: React.FC = () => {
  const { user, profile } = useAuth();
  const resumes = useCollection<Resume>('resumes');
  const [activeTab, setActiveTab] = useState<'builder' | 'upload'>('builder');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const myResumes = useMemo(
    () => resumes.data.filter((resume) => resume.user_id === user?.uid),
    [resumes.data, user?.uid]
  );

  const saveResume = async () => {
    if (!user || !title.trim()) {
      setMessage('Resume title is required.');
      return;
    }
    setSaving(true);
    const result = await addDocument('resumes', {
      user_id: user.uid,
      title: title.trim(),
      ats_score: 0,
      is_default: myResumes.length === 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      summary,
      profile_snapshot: profile || null
    });
    setSaving(false);
    setMessage(result.success ? 'Resume saved.' : 'Unable to save resume.');
    if (result.success) {
      setTitle('');
      setSummary('');
      resumes.refresh();
    }
  };

  const uploadResume = async (file?: File) => {
    if (!user || !file) return;
    setSaving(true);
    const upload = await uploadFile(file, `resumes/${user.uid}/${Date.now()}-${file.name}`);
    if (upload.success && upload.url) {
      await addDocument('resumes', {
        user_id: user.uid,
        title: file.name,
        file_url: upload.url,
        file_type: file.type,
        ats_score: 0,
        is_default: myResumes.length === 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      resumes.refresh();
      setMessage('Resume uploaded.');
    } else {
      setMessage('Unable to upload resume.');
    }
    setSaving(false);
  };

  const removeResume = async (id: string) => {
    await deleteDocument('resumes', id);
    resumes.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-500">Create and manage real resumes tied to your account.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveTab('builder')} className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'builder' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>Builder</button>
        <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'upload' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>Uploads</button>
      </div>

      {message && <div className="p-3 rounded-lg bg-primary-50 text-primary-700 text-sm">{message}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'builder' ? (
            <Card>
              <CardHeader title="New Resume" />
              <CardContent className="space-y-4">
                <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
                <Textarea label="Professional Summary" rows={5} value={summary} onChange={(event) => setSummary(event.target.value)} />
                <Button loading={saving} onClick={saveResume}><Sparkles className="w-4 h-4" /> Save Resume</Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent>
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Upload your resume</h3>
                  <p className="text-gray-500 mb-4">PDF, DOC, or DOCX.</p>
                  <label className="inline-flex">
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(event) => uploadResume(event.target.files?.[0])} />
                    <span className="inline-flex items-center justify-center gap-2 font-medium rounded-lg px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 cursor-pointer">
                      Choose File
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader title="My Resumes" action={<Plus className="w-5 h-5 text-primary-500" />} />
          <CardContent>
            {resumes.loading ? (
              <Loading text="Loading resumes..." />
            ) : myResumes.length === 0 ? (
              <EmptyState title="No resumes yet" description="Create or upload your first resume." />
            ) : (
              <div className="space-y-3">
                {myResumes.map((resume) => (
                  <div key={resume.id} className="p-3 border border-gray-100 rounded-lg flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{resume.title}</h4>
                      <p className="text-xs text-gray-500">ATS score: {resume.ats_score || 0}</p>
                    </div>
                    {resume.file_url && (
                      <a href={resume.file_url} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                      </a>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => removeResume(resume.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
