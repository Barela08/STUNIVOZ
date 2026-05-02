import React, { useMemo, useState } from 'react';
import { Plus, Search, Zap, Trash2, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, EmptyState, Loading } from '../../components/common';
import { addDocument, deleteDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Skill } from '../../types';

const levelColors = {
  beginner: 'bg-yellow-100 text-yellow-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-green-100 text-green-700',
};

export const SkillsPage: React.FC = () => {
  const { user } = useAuth();
  const skills = useCollection<Skill>('skills');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const mySkills = useMemo(() => skills.data
    .filter((skill) => skill.user_id === user?.uid)
    .filter((skill) => skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((skill) => !levelFilter || skill.level === levelFilter),
    [skills.data, user?.uid, searchTerm, levelFilter]
  );

  const addSkill = async () => {
    if (!user || !newSkill.trim()) return;
    await addDocument('skills', {
      user_id: user.uid,
      skill_name: newSkill.trim(),
      level: newLevel,
      created_at: new Date().toISOString()
    });
    setNewSkill('');
    skills.refresh();
  };

  const deleteSkill = async (id: string) => {
    await deleteDocument('skills', id);
    skills.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Skills</h1>
          <p className="text-gray-500">Track real skills connected to your profile.</p>
        </div>
        <Button variant="secondary"><FileText className="w-4 h-4" /> Resume Detection</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Input placeholder="Search skills..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} icon={<Search className="w-5 h-5" />} />
                <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white">
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Add Skill" />
            <CardContent>
              <div className="flex gap-4">
                <Input placeholder="Skill name" value={newSkill} onChange={(event) => setNewSkill(event.target.value)} />
                <select value={newLevel} onChange={(event) => setNewLevel(event.target.value as typeof newLevel)} className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <Button onClick={addSkill}><Plus className="w-4 h-4" /> Add</Button>
              </div>
            </CardContent>
          </Card>

          {skills.loading ? (
            <Loading text="Loading skills..." />
          ) : mySkills.length === 0 ? (
            <Card><EmptyState title="No skills yet" description="Add skills manually or from a resume scan when resume parsing is configured." /></Card>
          ) : (
            <div className="space-y-4">
              {mySkills.map((skill) => (
                <Card key={skill.id}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{skill.skill_name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[skill.level]}`}>{skill.level}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{skill.created_at ? new Date(skill.created_at).toLocaleDateString() : ''}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteSkill(skill.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader title="Skill Coverage" />
          <CardContent>
            <div className="text-3xl font-bold text-primary-600">{mySkills.length}</div>
            <p className="text-sm text-gray-500 mt-1">skills in your profile</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
