import React, { useState } from 'react';
import { Code, CheckCircle, Target, Play, ChevronRight, Search, BookOpen, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';

const mockQuestions = [
  { id: 1, title: 'Two Sum', difficulty: 'easy', category: 'Arrays', solved: true },
  { id: 2, title: 'Reverse Linked List', difficulty: 'easy', category: 'Linked Lists', solved: true },
  { id: 3, title: 'Valid Parentheses', difficulty: 'easy', category: 'Stacks', solved: false },
  { id: 4, title: 'Merge Two Sorted Lists', difficulty: 'medium', category: 'Linked Lists', solved: false },
  { id: 5, title: 'Longest Substring Without Repeating', difficulty: 'medium', category: 'Strings', solved: false },
  { id: 6, title: 'Binary Tree Level Order', difficulty: 'medium', category: 'Trees', solved: false },
  { id: 7, title: 'Median of Two Sorted Arrays', difficulty: 'hard', category: 'Arrays', solved: false },
  { id: 8, title: 'Trapping Rain Water', difficulty: 'hard', category: 'Arrays', solved: false },
];

const mockTests = [
  { id: 1, title: 'JavaScript Fundamentals', questions: 20, completed: true, score: 85 },
  { id: 2, title: 'React Basics', questions: 15, completed: true, score: 92 },
  { id: 3, title: 'Data Structures', questions: 25, completed: false, score: null },
];

const mockInterviews = [
  { id: 1, company: 'Google', role: 'SDE', difficulty: 'hard', questions: 5 },
  { id: 2, company: 'Amazon', role: 'SDE I', difficulty: 'medium', questions: 4 },
  { id: 3, company: 'Meta', role: 'Frontend', difficulty: 'medium', questions: 5 },
];

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export const PracticePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'coding' | 'mcq' | 'aptitude' | 'interview'>('coding');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const solvedCount = mockQuestions.filter(q => q.solved).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Practice & Tests
          </h1>
          <p className="text-gray-500">
            Sharpen your skills with coding questions and tests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'coding', label: 'Coding', icon: Code },
          { id: 'mcq', label: 'MCQ Tests', icon: BookOpen },
          { id: 'aptitude', label: 'Aptitude', icon: Target },
          { id: 'interview', label: 'Mock Interview', icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Coding Questions */}
      {activeTab === 'coding' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search problems..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<Search className="w-5 h-5" />}
                    />
                  </div>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white"
                  >
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {mockQuestions
                .filter(q => 
                  q.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (difficultyFilter === '' || q.difficulty === difficultyFilter)
                )
                .map((question) => (
                  <Card key={question.id} hover className="cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        question.solved ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {question.solved ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{question.title}</h3>
                        <p className="text-sm text-gray-500">{question.category}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[question.difficulty as keyof typeof difficultyColors]}`}>
                        {question.difficulty}
                      </span>
                      <Button variant="ghost">
                        Solve
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Progress" />
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-primary-600">{solvedCount}</div>
                  <div className="text-sm text-gray-500 mt-2">Solved</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(solvedCount / mockQuestions.length) * 100}%` }} />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{solvedCount} of {mockQuestions.length} problems</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Leaderboard" />
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'John Doe', solved: 45 },
                    { rank: 2, name: 'Jane Smith', solved: 42 },
                    { rank: 3, name: 'Mike Johnson', solved: 38 },
                  ].map((user) => (
                    <div key={user.rank} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                        {user.rank}
                      </span>
                      <span className="flex-1 text-sm text-gray-700">{user.name}</span>
                      <span className="text-sm text-gray-500">{user.solved} solved</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MCQ Tests */}
      {activeTab === 'mcq' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTests.map((test) => (
            <Card key={test.id} hover className="cursor-pointer">
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-2">{test.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{test.questions} questions</p>
                {test.completed ? (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">{test.score}%</span>
                    <Button variant="secondary" size="sm">Retake</Button>
                  </div>
                ) : (
                  <Button variant="primary" className="w-full">Start Test</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mock Interviews */}
      {activeTab === 'interview' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockInterviews.map((interview) => (
            <Card key={interview.id} hover className="cursor-pointer">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900">{interview.company}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[interview.difficulty as keyof typeof difficultyColors]}`}>
                    {interview.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{interview.role}</p>
                <p className="text-sm text-gray-500 mb-4">{interview.questions} questions</p>
                <Button variant="primary" className="w-full">Start Interview</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Aptitude */}
      {activeTab === 'aptitude' && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aptitude Tests</h3>
          <p className="text-gray-500 mb-4">Coming soon!</p>
          <Button variant="primary">Notify Me</Button>
        </div>
      )}
    </div>
  );
};
