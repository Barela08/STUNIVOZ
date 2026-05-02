import React, { useState } from 'react';
import { CheckCircle, Clock, BookOpen, Code, Brain, Palette, LineChart, Shield, MessageCircle, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../../components/common';

const careerPaths = [
  {
    id: 'web-dev',
    title: 'Web Development',
    icon: Code,
    color: 'bg-blue-500',
    steps: 8,
    duration: '6 months',
    difficulty: 'beginner',
    description: 'Master HTML, CSS, JavaScript and modern frameworks like React and Node.js',
  },
  {
    id: 'data-science',
    title: 'Data Science',
    icon: Brain,
    color: 'bg-purple-500',
    steps: 10,
    duration: '8 months',
    difficulty: 'intermediate',
    description: 'Learn Python, Machine Learning, and Data Analysis with real-world projects',
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    icon: Palette,
    color: 'bg-pink-500',
    steps: 6,
    duration: '4 months',
    difficulty: 'beginner',
    description: 'Master Figma, understand user research and create stunning designs',
  },
  {
    id: 'product',
    title: 'Product Management',
    icon: LineChart,
    color: 'bg-green-500',
    steps: 7,
    duration: '5 months',
    difficulty: 'intermediate',
    description: 'Learn to build products users love, from ideation to launch',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    icon: Shield,
    color: 'bg-red-500',
    steps: 8,
    duration: '6 months',
    difficulty: 'advanced',
    description: 'Learn ethical hacking, network security and best practices',
  },
];

const mockRoadmap = {
  'web-dev': [
    { title: 'HTML & CSS Fundamentals', completed: true, duration: '2 weeks' },
    { title: 'JavaScript Basics', completed: true, duration: '3 weeks' },
    { title: 'DOM Manipulation', completed: false, duration: '2 weeks' },
    { title: 'React.js Introduction', completed: false, duration: '4 weeks' },
    { title: 'React Hooks & Context', completed: false, duration: '3 weeks' },
    { title: 'Node.js & Express', completed: false, duration: '4 weeks' },
    { title: 'MongoDB Database', completed: false, duration: '2 weeks' },
    { title: 'Build Full Stack Project', completed: false, duration: '3 weeks' },
  ],
};

export const CareerPage: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>('web-dev');
  const [showChatbot, setShowChatbot] = useState(false);

  const currentRoadmap = selectedPath ? mockRoadmap[selectedPath as keyof typeof mockRoadmap] || [] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Career Guidance
          </h1>
          <p className="text-gray-500">
            Choose your path and follow the roadmap to your dream career
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowChatbot(true)}>
          <MessageCircle className="w-4 h-4" />
          AI Career Advisor
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Career Paths */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg text-gray-900">Choose Your Path</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {careerPaths.map((path) => {
              const Icon = path.icon;
              return (
                <Card 
                  key={path.id} 
                  hover 
                  className={`cursor-pointer ${selectedPath === path.id ? 'ring-2 ring-primary-500' : ''}`}
                  onClick={() => setSelectedPath(path.id)}
                >
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${path.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{path.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{path.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {path.steps} steps
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {path.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Roadmap */}
          {selectedPath && (
            <Card>
              <CardHeader 
                title="Your Roadmap" 
                subtitle={`Follow these steps to become a ${careerPaths.find(p => p.id === selectedPath)?.title}`}
              />
              <CardContent>
                <div className="space-y-3">
                  {currentRoadmap.map((step, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        step.completed ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${step.completed ? 'text-green-700' : 'text-gray-900'}`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-500">{step.duration}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress */}
          <Card>
            <CardHeader title="Your Progress" />
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-primary-600">25%</div>
                <div className="text-sm text-gray-500 mt-2">Complete</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
                <p className="text-sm text-gray-500 mt-2">2 of 8 steps completed</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader title="Quick Tips" />
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 text-sm font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-600">Focus on one technology at a time</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 text-sm font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-600">Build projects as you learn</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 text-sm font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-600">Join communities for help</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Chatbot Modal */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">AI Career Advisor</h3>
              <Button variant="ghost" onClick={() => setShowChatbot(false)}>×</Button>
            </div>
            <CardContent className="h-96">
              <div className="space-y-4 mb-4">
                <div className="bg-primary-50 p-3 rounded-lg rounded-tl-none">
                  <p className="text-sm text-gray-700">Hi! I'm your AI Career Advisor. How can I help you today?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <Button variant="primary">Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
