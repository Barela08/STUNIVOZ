import React, { useMemo, useState } from 'react';
import { Code, Target, Search, BookOpen, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, EmptyState, Loading } from '../../components/common';
import { useCollection } from '../../hooks/useCollection';

type PracticeItem = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  type: 'coding' | 'mcq' | 'aptitude' | 'interview';
  question_count?: number;
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export const PracticePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PracticeItem['type']>('coding');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const practice = useCollection<PracticeItem>('practice_items');

  const visibleItems = useMemo(() => practice.data
    .filter((item) => item.type === activeTab)
    .filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((item) => !difficultyFilter || item.difficulty === difficultyFilter),
    [practice.data, activeTab, searchTerm, difficultyFilter]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Practice & Tests</h1>
        <p className="text-gray-500">Practice content is loaded from real admin-created records.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'coding', label: 'Coding', icon: Code },
          { id: 'mcq', label: 'MCQ Tests', icon: BookOpen },
          { id: 'aptitude', label: 'Aptitude', icon: Target },
          { id: 'interview', label: 'Interview', icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as PracticeItem['type'])}
            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input placeholder="Search practice..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} icon={<Search className="w-5 h-5" />} />
            <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white">
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {practice.loading ? (
        <Loading text="Loading practice..." />
      ) : visibleItems.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Code className="w-6 h-6" />}
            title="No practice items yet"
            description="Create practice_items documents to power coding, MCQ, aptitude, and interview practice."
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleItems.map((item) => (
            <Card key={item.id} hover>
              <CardContent>
                <CardHeader title={item.title} subtitle={item.category || item.type} />
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[item.difficulty]}`}>{item.difficulty}</span>
                  <Button size="sm">Start</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
