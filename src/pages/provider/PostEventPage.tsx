import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';
import { Save, Send, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { addDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

export const PostEventPage: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    eventType: 'webinar',
    locationFormat: 'virtual',
    datetime: '',
    registrationLink: '',
    description: '',
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!form.title.trim()) {
      setStatus('error');
      return;
    }
    isDraft ? setDraftLoading(true) : setLoading(true);
    setStatus('idle');

    const result = await addDocument('events', {
      ...form,
      status: isDraft ? 'draft' : 'published',
      postedBy: user?.uid || 'unknown',
      registrations: 0,
    });

    isDraft ? setDraftLoading(false) : setLoading(false);

    if (result.success) {
      setStatus('success');
      if (!isDraft) {
        setForm({ title: '', eventType: 'webinar', locationFormat: 'virtual', datetime: '', registrationLink: '', description: '' });
      }
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Host New Event</h1>
          <p className="text-gray-500">Engage with students through webinars and hackathons</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSubmit(true)} loading={draftLoading}>
            <Save className="w-4 h-4 mr-2" />Save Draft
          </Button>
          <Button variant="primary" onClick={() => handleSubmit(false)} loading={loading}>
            <Send className="w-4 h-4 mr-2" />Publish Event
          </Button>
        </div>
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Event published successfully!</p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">Event title is required. Please fill in the required fields.</p>
        </div>
      )}

      <Card>
        <CardHeader title="Event Details" />
        <CardContent className="space-y-6">
          <Input
            label="Event Title *"
            name="title"
            placeholder="e.g. AWS Cloud Masterclass"
            value={form.title}
            onChange={handleChange}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                name="eventType"
                value={form.eventType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 bg-white"
              >
                <option value="webinar">Webinar</option>
                <option value="hackathon">Hackathon</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Format</label>
              <select
                name="locationFormat"
                value={form.locationFormat}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 bg-white"
              >
                <option value="virtual">Virtual / Online</option>
                <option value="in_person">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Date & Time"
              name="datetime"
              type="datetime-local"
              value={form.datetime}
              onChange={handleChange}
              icon={<Calendar className="w-5 h-5" />}
            />
            <Input
              label="Registration Link / Meeting URL"
              name="registrationLink"
              type="url"
              placeholder="https://..."
              value={form.registrationLink}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 text-sm"
              placeholder="What will students learn? Who are the speakers?"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
