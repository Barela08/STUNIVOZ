import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, Input, Textarea } from '../../components/common';
import { Save, Send } from 'lucide-react';
import { addDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

export const PostEventPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    type: 'webinar',
    format: 'virtual',
    date: '',
    registrationLink: '',
    location: '',
    description: ''
  });

  const updateForm = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const publishEvent = async () => {
    if (!user || !form.title.trim() || !form.date || !form.description.trim()) {
      setMessage('Title, date, and description are required.');
      return;
    }

    setSaving(true);
    const result = await addDocument('events', {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      date: form.date,
      location: form.format === 'virtual' ? 'Virtual' : form.location.trim(),
      virtual: form.format === 'virtual',
      registration_link: form.registrationLink.trim(),
      organized_by: profile?.company_name || profile?.full_name || 'Company',
      posted_by: user.uid,
      created_at: new Date().toISOString()
    });
    setSaving(false);
    setMessage(result.success ? 'Event published.' : 'Unable to publish event.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Host New Event</h1>
          <p className="text-gray-500">Publish real webinars, workshops, and hiring events.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={saving}><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700" loading={saving} onClick={publishEvent}><Send className="w-4 h-4 mr-2" /> Publish</Button>
        </div>
      </div>

      {message && <div className="p-3 rounded-lg bg-primary-50 text-primary-700 text-sm">{message}</div>}

      <Card>
        <CardHeader title="Event Details" />
        <CardContent className="space-y-6">
          <Input label="Event Title" value={form.title} onChange={(event) => updateForm('title', event.target.value)} required />
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select value={form.type} onChange={(event) => updateForm('type', event.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white">
                <option value="webinar">Webinar</option>
                <option value="hackathon">Hackathon</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Format</label>
              <select value={form.format} onChange={(event) => updateForm('format', event.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white">
                <option value="virtual">Virtual / Online</option>
                <option value="in_person">In-Person</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Date & Time" type="datetime-local" value={form.date} onChange={(event) => updateForm('date', event.target.value)} required />
            <Input label="Registration Link / Meeting URL" type="url" value={form.registrationLink} onChange={(event) => updateForm('registrationLink', event.target.value)} />
          </div>
          {form.format !== 'virtual' && (
            <Input label="Venue" value={form.location} onChange={(event) => updateForm('location', event.target.value)} />
          )}
          <Textarea label="Event Description" rows={5} value={form.description} onChange={(event) => updateForm('description', event.target.value)} required />
        </CardContent>
      </Card>
    </div>
  );
};
