import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Clock, BookOpen, Code, Brain, Palette, LineChart, Shield, MessageCircle, ChevronRight, Send, X, Bot, User, Loader, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../../components/common';
import { careerChatReply } from '../../services/aiService';

const careerPaths = [
  { id: 'web-dev', title: 'Web Development', icon: Code, color: 'bg-blue-500', steps: 8, duration: '6 months', difficulty: 'Beginner', description: 'Master HTML, CSS, JavaScript and modern frameworks like React and Node.js' },
  { id: 'data-science', title: 'Data Science', icon: Brain, color: 'bg-purple-500', steps: 10, duration: '8 months', difficulty: 'Intermediate', description: 'Learn Python, Machine Learning, and Data Analysis with real-world projects' },
  { id: 'ui-ux', title: 'UI/UX Design', icon: Palette, color: 'bg-pink-500', steps: 6, duration: '4 months', difficulty: 'Beginner', description: 'Master Figma, understand user research and create stunning designs' },
  { id: 'product', title: 'Product Management', icon: LineChart, color: 'bg-green-500', steps: 7, duration: '5 months', difficulty: 'Intermediate', description: 'Learn to build products users love, from ideation to launch' },
  { id: 'cybersecurity', title: 'Cybersecurity', icon: Shield, color: 'bg-red-500', steps: 8, duration: '6 months', difficulty: 'Advanced', description: 'Learn ethical hacking, network security and best practices' },
];

const roadmaps: Record<string, { title: string; completed: boolean; duration: string }[]> = {
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
  'data-science': [
    { title: 'Python Fundamentals', completed: true, duration: '3 weeks' },
    { title: 'NumPy & Pandas', completed: false, duration: '2 weeks' },
    { title: 'Data Visualisation (Matplotlib, Seaborn)', completed: false, duration: '2 weeks' },
    { title: 'Statistics & Probability', completed: false, duration: '3 weeks' },
    { title: 'Machine Learning Basics (Sklearn)', completed: false, duration: '4 weeks' },
    { title: 'Deep Learning (TensorFlow/Keras)', completed: false, duration: '4 weeks' },
    { title: 'SQL & Database Fundamentals', completed: false, duration: '2 weeks' },
    { title: 'End-to-End ML Project', completed: false, duration: '4 weeks' },
    { title: 'Model Deployment (Flask/FastAPI)', completed: false, duration: '2 weeks' },
    { title: 'Capstone Project', completed: false, duration: '4 weeks' },
  ],
  'ui-ux': [
    { title: 'Design Principles & Color Theory', completed: false, duration: '1 week' },
    { title: 'Figma Fundamentals', completed: false, duration: '2 weeks' },
    { title: 'User Research & Personas', completed: false, duration: '2 weeks' },
    { title: 'Wireframing & Prototyping', completed: false, duration: '3 weeks' },
    { title: 'Usability Testing', completed: false, duration: '2 weeks' },
    { title: 'Portfolio Project', completed: false, duration: '4 weeks' },
  ],
  'product': [
    { title: 'Product Thinking & Strategy', completed: false, duration: '2 weeks' },
    { title: 'User Research Techniques', completed: false, duration: '2 weeks' },
    { title: 'Product Roadmapping', completed: false, duration: '1 week' },
    { title: 'Agile & Scrum Methodologies', completed: false, duration: '2 weeks' },
    { title: 'Data-driven Decision Making', completed: false, duration: '2 weeks' },
    { title: 'GTM Strategy & Launch', completed: false, duration: '3 weeks' },
    { title: 'Capstone — Build a PRD', completed: false, duration: '4 weeks' },
  ],
  'cybersecurity': [
    { title: 'Networking Fundamentals (TCP/IP)', completed: false, duration: '2 weeks' },
    { title: 'Linux Command Line', completed: false, duration: '2 weeks' },
    { title: 'Ethical Hacking Basics', completed: false, duration: '3 weeks' },
    { title: 'Web Application Security (OWASP)', completed: false, duration: '3 weeks' },
    { title: 'Penetration Testing Tools (Kali Linux)', completed: false, duration: '4 weeks' },
    { title: 'Cryptography & PKI', completed: false, duration: '2 weeks' },
    { title: 'Incident Response & Forensics', completed: false, duration: '2 weeks' },
    { title: 'CTF Challenge Project', completed: false, duration: '4 weeks' },
  ],
};

type Message = { role: 'bot' | 'user'; text: string };

const FALLBACK_RESPONSES: Record<string, string> = {
  internship: "Here are tips to land your first internship:\n\n1. **Update your resume** with all projects and skills\n2. **Apply to 5–10 companies per week** — consistency matters\n3. **Use LinkedIn actively** — connect with recruiters\n4. **Practise DSA** on LeetCode (aim for Easy/Medium)\n5. **Build 2–3 solid projects** to showcase on GitHub\n\nStart applying to smaller startups first — they hire more interns and give more responsibility!",
  resume: "Here's how to write an ATS-optimized resume:\n\n• **Use keywords** from the job description\n• **Quantify achievements** — 'Improved performance by 40%' beats 'Improved performance'\n• **Keep it to 1 page** if you have less than 3 years of experience\n• **Use standard section headers** — Summary, Education, Skills, Projects, Experience\n• **Avoid tables/columns** — many ATS systems can't parse them",
  interview: "Here's how to prepare for tech interviews:\n\n**DSA (60% of interviews):**\n• LeetCode: Solve 50 Easy + 30 Medium problems\n• Focus: Arrays, Strings, Hashmaps, Trees, DP\n\n**Behavioural (HR round):**\n• Prepare STAR stories for leadership, conflict, failure\n\n**On the day:**\n• Think out loud — interviewers want to see your process\n• Ask clarifying questions before coding",
};

function getFallbackReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('internship') || lower.includes('apply') || lower.includes('job')) return FALLBACK_RESPONSES.internship;
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) return FALLBACK_RESPONSES.resume;
  if (lower.includes('interview') || lower.includes('dsa') || lower.includes('coding')) return FALLBACK_RESPONSES.interview;
  return "Focus on these 3 things right now:\n\n1. **Build real projects** that solve real problems\n2. **Apply consistently** — 5+ applications per week\n3. **Learn DSA basics** to pass screening rounds\n\nWould you like specific advice on internship hunting, resume writing, or interview prep?";
}

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1" />;
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-gray-800 dark:text-gray-200 mt-2 mb-0.5">{line.slice(2, -2)}</p>;
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part);
    if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
      return <p key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><span className="shrink-0 text-primary-500 mt-0.5">•</span><span>{rendered.slice(1)}</span></p>;
    }
    if (/^\d+\./.test(line)) return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{rendered}</p>;
    return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{rendered}</p>;
  });
}

export const CareerPage: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('web-dev');
  const [currentRoadmap, setCurrentRoadmap] = useState(roadmaps['web-dev']);
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hi! I'm your AI Career Advisor 👋\n\nI can help you with:\n• Internship hunting tips\n• Resume and ATS advice\n• Interview preparation\n• Skills to learn in 2026\n• Salary and stipend benchmarks\n\nWhat would you like to know?" },
  ]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [aiError, setAiError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handlePathSelect = (pathId: string) => {
    setSelectedPath(pathId);
    setCurrentRoadmap(roadmaps[pathId] || []);
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || typing) return;
    setInputText('');
    setAiError('');
    const newHistory = [...messages, { role: 'user' as const, text }];
    setMessages(newHistory);
    setTyping(true);

    try {
      const reply = await careerChatReply(text, messages);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      const isNoKey = err?.message?.includes('No API key');
      if (isNoKey) {
        const fallback = getFallbackReply(text);
        setMessages(prev => [...prev, { role: 'bot', text: fallback }]);
        setAiError('Using built-in responses. Configure AI API key in Admin → AI Settings for smarter answers.');
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: getFallbackReply(text) }]);
        setAiError(`AI unavailable: ${err?.message || 'Unknown error'}. Using fallback responses.`);
      }
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const selectedPathData = careerPaths.find(p => p.id === selectedPath);
  const completedCount = currentRoadmap.filter(s => s.completed).length;
  const progress = currentRoadmap.length > 0 ? Math.round((completedCount / currentRoadmap.length) * 100) : 0;

  const toggleStep = (index: number) => {
    setCurrentRoadmap(prev => prev.map((s, i) => i === index ? { ...s, completed: !s.completed } : s));
  };

  const quickQuestions = [
    'How do I get my first internship?',
    'How to write an ATS resume?',
    'How to prepare for coding interviews?',
    'Best skills to learn in 2026?',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Career Guidance</h1>
          <p className="text-gray-500 dark:text-gray-400">Choose your path and follow the roadmap to your dream career</p>
        </div>
        <Button variant="primary" onClick={() => setShowChatbot(true)}>
          <MessageCircle className="w-4 h-4" /> AI Career Advisor
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Career Paths */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Choose Your Path</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {careerPaths.map((path) => {
              const Icon = path.icon;
              return (
                <Card
                  key={path.id} hover
                  className={`cursor-pointer transition-all ${selectedPath === path.id ? 'ring-2 ring-primary-500 shadow-md' : ''}`}
                  onClick={() => handlePathSelect(path.id)}
                >
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <div className={`${path.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{path.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{path.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{path.duration}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><BookOpen className="w-3 h-3" />{path.steps} steps</span>
                        </div>
                      </div>
                      {selectedPath === path.id && (
                        <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Your Progress</h2>
          <Card>
            <CardContent>
              {selectedPathData && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${selectedPathData.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                      <selectedPathData.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{selectedPathData.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{completedCount}/{currentRoadmap.length} steps done</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-primary-500">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                {currentRoadmap.map((step, index) => (
                  <div
                    key={index}
                    onClick={() => toggleStep(index)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${step.completed ? 'opacity-70' : ''}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${step.completed ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-gray-600'}`}>
                      {step.completed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${step.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>{step.title}</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{step.duration}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Chatbot Modal */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: '85vh', maxHeight: '700px' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">AI Career Advisor</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setShowChatbot(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* AI error notice */}
            {aiError && (
              <div className="mx-4 mt-3 flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">{aiError}</p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {msg.role === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'bot' ? 'bg-gray-50 dark:bg-gray-800 rounded-tl-none' : 'bg-primary-500 text-white rounded-tr-none'}`}>
                    {msg.role === 'bot' ? (
                      <div className="space-y-0.5">{formatMessage(msg.text)}</div>
                    ) : (
                      <p className="text-sm text-white">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                    <Loader className="w-4 h-4 text-primary-500 animate-spin" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex-shrink-0">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInputText(q); }}
                      className="text-xs px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex gap-3 items-end">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your career..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-800 bg-gray-50 dark:text-white text-gray-900 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || typing}
                  className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-primary-500/25 flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
