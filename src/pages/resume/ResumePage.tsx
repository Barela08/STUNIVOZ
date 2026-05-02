import React, { useState } from 'react';
import { FileText, Upload, Plus, Download, Share, Eye, Edit, Trash2, CheckCircle, AlertCircle, Zap, Sparkles, FileDown, FileInput } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Textarea } from '../../components/common';

const mockResumes = [
  {
    id: '1',
    title: 'Software Developer Resume',
    createdAt: 'Dec 1, 2024',
    atsScore: 85,
    isDefault: true,
  },
  {
    id: '2',
    title: 'Frontend Developer',
    createdAt: 'Nov 15, 2024',
    atsScore: 72,
    isDefault: false,
  },
];

export const ResumePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'upload'>('builder');
  const [selectedResume, setSelectedResume] = useState(mockResumes[0]);
  const [editMode, setEditMode] = useState(false);

  const resumeForm = {
    summary: 'Passionate web developer with experience in React, TypeScript, and modern frontend technologies.',
    education: [
      { school: 'MIT', degree: 'B.Tech', year: '2025', cgpa: '8.5' }
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'CSS'],
    projects: [
      { title: 'E-commerce App', description: 'Full-stack e-commerce platform', techStack: 'MERN Stack' }
    ],
    experience: [],
    certifications: ['AWS Certified'],
    achievements: ['Hackathon Winner 2024'],
  };

  const [formData, setFormData] = useState(resumeForm);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Resume Builder
          </h1>
          <p className="text-gray-500">
            Create and manage your professional resumes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4" />
            Upload Resume
          </Button>
          <Button variant="primary">
            <Plus className="w-4 h-4" />
            New Resume
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'builder'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Resume Builder
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Uploaded Resumes
        </button>
      </div>

      {activeTab === 'builder' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Builder Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Resumes */}
            <Card padding="none">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">My Resumes</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {mockResumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => setSelectedResume(resume)}
                    className={`p-4 flex items-center gap-4 cursor-pointer ${
                      selectedResume.id === resume.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{resume.title}</h4>
                        {resume.isDefault && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{resume.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Professional Summary */}
            <Card>
              <CardHeader title="Professional Summary" />
              <CardContent>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Write a brief summary about yourself..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader 
                title="Education"
                action={
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                }
              />
              <CardContent>
                <div className="space-y-4">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="grid md:grid-cols-4 gap-4">
                      <Input placeholder="School/University" defaultValue={edu.school} />
                      <Input placeholder="Degree" defaultValue={edu.degree} />
                      <Input placeholder="Year" defaultValue={edu.year} />
                      <Input placeholder="CGPA" defaultValue={edu.cgpa} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader title="Skills" subtitle="Add your technical skills" />
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full">
                      {skill}
                    </span>
                  ))}
                  <Input placeholder="Add skill" className="w-32" />
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader 
                title="Projects"
                action={
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                }
              />
              <CardContent>
                <div className="space-y-4">
                  {formData.projects.map((project, index) => (
                    <div key={index} className="space-y-2">
                      <Input placeholder="Project Title" defaultValue={project.title} />
                      <Textarea placeholder="Description" defaultValue={project.description} rows={2} />
                      <Input placeholder="Tech Stack" defaultValue={project.techStack} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-2">
              <Button variant="secondary">Save as Draft</Button>
              <Button variant="primary">
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
            </div>
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
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#0ea5e9"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="351.86"
                        strokeDashoffset={351.86 - (351.86 * selectedResume.atsScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{selectedResume.atsScore}</div>
                        <div className="text-xs text-gray-500">/ 100</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Good keyword density</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Proper formatting</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-600">Add more projects</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader title="Quick Actions" />
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileInput className="w-4 h-4" />
                    Download DOCX
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share className="w-4 h-4" />
                    Share Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Upload Area */}
          <div className="md:col-span-2">
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent>
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Upload your resume
                  </h3>
                  <p className="text-gray-500 mb-4">
                    PDF, DOC, or DOCX up to 10MB
                  </p>
                  <Button variant="primary">
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Uploaded Resumes */}
          <div className="space-y-4">
            <Card padding="none">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Uploaded Resumes</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {mockResumes.map((resume) => (
                  <div key={resume.id} className="p-4 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{resume.title}</h4>
                      <p className="text-sm text-gray-500">{resume.createdAt}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
