import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';
import { Save, Send } from 'lucide-react';

export const PostInternshipPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'internship',
    workplace: 'remote',
    stipend: '',
    duration: '',
    description: '',
    skills: '',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Post New Internship</h1>
          <p className="text-gray-500">Create a listing to find top student talent</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Save className="w-4 h-4 mr-2"/> Save Draft</Button>
          <Button variant="primary"><Send className="w-4 h-4 mr-2"/> Publish Listing</Button>
        </div>
      </div>

      <Card>
        <CardHeader title="Job Details" />
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Internship Title" placeholder="e.g. Frontend Developer Intern" required />
            <Input label="Location" placeholder="e.g. Bangalore, India" required />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workplace Type</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white">
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white">
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="1">1 Month</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Stipend (per month)" placeholder="e.g. ₹15,000" />
            <Input label="Required Skills (comma separated)" placeholder="e.g. React, Node.js, TypeScript" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description & Requirements</label>
            <textarea 
              rows={6} 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
              placeholder="Detail the responsibilities, requirements, and what the intern will learn..."
            ></textarea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
