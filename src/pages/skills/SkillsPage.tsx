import React, { useState } from 'react';
import { Plus, Search, Zap, Target, AlertCircle, CheckCircle, ChevronRight, Edit, Trash2, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';

const mockSkills = [
  { name: 'React', level: 'intermediate', progress: 65, lastUpdated: '2024-12-01' },
  { name: 'TypeScript', level: 'beginner', progress: 30, lastUpdated: '2024-12-05' },
  { name: 'Node.js', level: 'intermediate', progress: 50, lastUpdated: '2024-11-20' },
  { name: 'Python', level: 'advanced', progress: 85, lastUpdated: '2024-10-15' },
  { name: 'MongoDB', level: 'intermediate', progress: 45, lastUpdated: '2024-11-10' },
  { name: 'AWS', level: 'beginner', progress: 20, lastUpdated: '2024-12-10' },
];

const levelColors = {
  beginner: 'bg-yellow-100 text-yellow-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-green-100 text-green-700',
};

export const SkillsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [skills, setSkills] = useState(mockSkills);
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState('beginner');

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([
        ...skills,
        { name: newSkill, level: newLevel as keyof typeof levelColors, progress: 0, lastUpdated: new Date().toISOString() }
      ]);
      setNewSkill('');
    }
  };

  const deleteSkill = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  const totalProgress = skills.reduce((acc, s) => acc + s.progress, 0) / skills.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Skills Analysis
          </h1>
          <p className="text-gray-500">
            Track and improve your technical skills
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <FileText className="w-4 h-4" />
            Auto-detect from Resume
          </Button>
          <Button variant="primary">
            <Plus className="w-4 h-4" />
            Add Skill
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skills Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-5 h-5" />}
                  />
                </div>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Add Skill Form */}
          <Card>
            <CardHeader title="Add New Skill" />
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Skill name"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <Button variant="primary" onClick={addSkill}>Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Skills List */}
          <div className="space-y-4">
            {skills
              .filter(skill => 
                skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (levelFilter === '' || skill.level === levelFilter)
              )
              .map((skill) => (
                <Card key={skill.name} hover>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[skill.level as keyof typeof levelColors]}`}>
                          {skill.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-500 h-2 rounded-full transition-all" 
                            style={{ width: `${skill.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{skill.progress}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(skill.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteSkill(skill.name)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Overall Progress */}
          <Card>
            <CardHeader title="Overall Progress" />
            <CardContent>
              <div className="text-center py-4">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#0ea5e9"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="351.86"
                      strokeDashoffset={351.86 - (351.86 * totalProgress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-600">{Math.round(totalProgress)}%</div>
                      <div className="text-xs text-gray-500">Average</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Gap Analysis */}
          <Card>
            <CardHeader title="Skill Gap Analysis" subtitle="Compare with job requirements" />
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-700">AWS</span>
                  </div>
                  <span className="text-xs text-red-600">High demand</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-gray-700">Docker</span>
                  </div>
                  <span className="text-xs text-yellow-600">Medium demand</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">React</span>
                  </div>
                  <span className="text-xs text-green-600">Skilled</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Analysis
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
