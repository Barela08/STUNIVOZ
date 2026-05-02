import React from 'react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';
import { Save, Send, Calendar } from 'lucide-react';

export const PostEventPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Host New Event</h1>
          <p className="text-gray-500">Engage with students through webinars and hackathons</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Save className="w-4 h-4 mr-2"/> Save Draft</Button>
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700"><Send className="w-4 h-4 mr-2"/> Publish Event</Button>
        </div>
      </div>

      <Card>
        <CardHeader title="Event Details" />
        <CardContent className="space-y-6">
          <Input label="Event Title" placeholder="e.g. AWS Cloud Masterclass" required />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white">
                <option value="webinar">Webinar</option>
                <option value="hackathon">Hackathon</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Format</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white">
                <option value="virtual">Virtual / Online</option>
                <option value="in_person">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Date & Time" type="datetime-local" required />
            <Input label="Registration Link / Meeting URL" type="url" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
            <textarea 
              rows={4} 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
              placeholder="What will students learn? Who are the speakers?"
            ></textarea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
