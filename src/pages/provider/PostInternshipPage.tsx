import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, Input, Textarea } from '../../components/common';
import { Save, Send } from 'lucide-react';
import { addDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

export const PostInternshipPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    role: '',
    location: '',
    workplace: 'remote',
    duration: '3 Months',
    stipend: '',
    skills: '',
    description: '',
    requirements: '',
    applyLink: ''
  });

  const updateForm = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const saveListing = async (status: 'draft' | 'active') => {
    if (!user || !form.role.trim() || !form.location.trim() || !form.description.trim()) {
      setMessage('Title, location, and description are required.');
      return;
    }

    setSaving(true);
    const result = await addDocument('internships', {
      company_name: profile?.company_name || profile?.full_name || 'Company',
      role: form.role.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      location: form.location.trim(),
      stipend: Number(form.stipend) || 0,
      duration: form.duration,
      remote: form.workplace === 'remote',
      workplace: form.workplace,
      skills_required: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      apply_link: form.applyLink.trim(),
      posted_by: user.uid,
      status,
      created_at: new Date().toISOString()
    });
    setSaving(false);
    setMessage(result.success ? 'Listing saved.' : 'Unable to save listing.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Post New Internship</h1>
          <p className="text-gray-500">Create a real listing visible to students.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" loading={saving} onClick={() => saveListing('draft')}><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
          <Button variant="primary" loading={saving} onClick={() => saveListing('active')}><Send className="w-4 h-4 mr-2" /> Publish</Button>
        </div>
      </div>

      {message && <div className="p-3 rounded-lg bg-primary-50 text-primary-700 text-sm">{message}</div>}

      <Card>
        <CardHeader title="Job Details" />
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Internship Title" value={form.role} onChange={(event) => updateForm('role', event.target.value)} required />
            <Input label="Location" value={form.location} onChange={(event) => updateForm('location', event.target.value)} required />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workplace Type</label>
              <select value={form.workplace} onChange={(event) => updateForm('workplace', event.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white">
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select value={form.duration} onChange={(event) => updateForm('duration', event.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white">
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Stipend per month" type="number" value={form.stipend} onChange={(event) => updateForm('stipend', event.target.value)} />
            <Input label="Required Skills" placeholder="React, Node.js, TypeScript" value={form.skills} onChange={(event) => updateForm('skills', event.target.value)} />
          </div>
          <Input label="Apply Link" type="url" value={form.applyLink} onChange={(event) => updateForm('applyLink', event.target.value)} />
          <Textarea label="Description" rows={5} value={form.description} onChange={(event) => updateForm('description', event.target.value)} required />
          <Textarea label="Requirements" rows={4} value={form.requirements} onChange={(event) => updateForm('requirements', event.target.value)} />
        </CardContent>
      </Card>
    </div>
  );
};
