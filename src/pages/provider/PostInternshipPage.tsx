import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';
import { Save, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { addDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

export const PostInternshipPage: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    location: '',
    workplaceType: 'remote',
    duration: '6',
    stipend: '',
    skills: '',
    description: '',
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!form.title.trim() || !form.location.trim()) {
      setStatus('error');
      return;
    }
    isDraft ? setDraftLoading(true) : setLoading(true);
    setStatus('idle');

    const result = await addDocument('internships', {
      ...form,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      status: isDraft ? 'draft' : 'published',
      postedBy: user?.uid || 'unknown',
      applicants: 0,
    });

    isDraft ? setDraftLoading(false) : setLoading(false);

    if (result.success) {
      setStatus('success');
      if (!isDraft) {
        setForm({ title: '', location: '', workplaceType: 'remote', duration: '6', stipend: '', skills: '', description: '' });
      }
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Post New Internship</h1>
          <p className="text-gray-500">Create a listing to find top student talent</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSubmit(true)} loading={draftLoading}>
            <Save className="w-4 h-4 mr-2" />Save Draft
          </Button>
          <Button variant="primary" onClick={() => handleSubmit(false)} loading={loading}>
            <Send className="w-4 h-4 mr-2" />Publish Listing
          </Button>
        </div>
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Listing published successfully!</p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">Please fill in the required fields (Title and Location).</p>
        </div>
      )}

      <Card>
        <CardHeader title="Job Details" />
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Internship Title *"
              name="title"
              placeholder="e.g. Frontend Developer Intern"
              value={form.title}
              onChange={handleChange}
            />
            <Input
              label="Location *"
              name="location"
              placeholder="e.g. Bangalore, India"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workplace Type</label>
              <select
                name="workplaceType"
                value={form.workplaceType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 bg-white"
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 bg-white"
              >
                <option value="1">1 Month</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Stipend (per month)"
              name="stipend"
              placeholder="e.g. ₹15,000"
              value={form.stipend}
              onChange={handleChange}
            />
            <Input
              label="Required Skills (comma separated)"
              name="skills"
              placeholder="e.g. React, Node.js, TypeScript"
              value={form.skills}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description & Requirements</label>
            <textarea
              name="description"
              rows={6}
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 text-sm"
              placeholder="Detail the responsibilities, requirements, and what the intern will learn..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
