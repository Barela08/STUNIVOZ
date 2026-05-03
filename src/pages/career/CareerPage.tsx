import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Clock, BookOpen, Code, Brain, Palette, LineChart, Shield, MessageCircle, ChevronRight, Send, X, Bot, User } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../../components/common';

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

const aiResponses: Record<string, string> = {
  internship: "Great question! Here are tips to land your first internship:\n\n1. **Update your resume** with all projects and skills\n2. **Apply to 5-10 companies per week** — consistency matters\n3. **Use LinkedIn actively** — connect with recruiters\n4. **Practise DSA** on LeetCode (aim for Easy/Medium)\n5. **Build 2-3 solid projects** to showcase on GitHub\n\nStart applying to smaller startups first — they hire more interns and give more responsibility!",
  resume: "Here's how to write an ATS-optimized resume:\n\n• **Use keywords** from the job description — match their exact wording\n• **Quantify achievements** — 'Improved performance by 40%' beats 'Improved performance'\n• **Keep it to 1 page** if you have less than 3 years of experience\n• **Use standard section headers** — Summary, Education, Skills, Projects, Experience\n• **Avoid tables/columns** — many ATS systems can't parse them\n\nUse the Resume Builder on STUNIVOZ to check your ATS score!",
  interview: "Here's how to prepare for tech interviews:\n\n**DSA (60% of interviews):**\n• LeetCode: Solve 50 Easy + 30 Medium problems\n• Focus: Arrays, Strings, Hashmaps, Trees, Dynamic Programming\n\n**System Design (for SDE-1+):**\n• Study URL shortener, Instagram feed, WhatsApp design\n\n**Behavioural (HR round):**\n• Prepare STAR stories for leadership, conflict, failure\n• Research the company culture beforehand\n\n**On the day:**\n• Think out loud — interviewers want to see your process\n• Ask clarifying questions before coding",
  salary: "Here are typical internship stipends in India (2026):\n\n• **FAANG / Big Tech** — ₹80,000–₹1,50,000/month\n• **Product companies** (Zomato, Swiggy, CRED) — ₹40,000–₹80,000/month\n• **Series A–B startups** — ₹20,000–₹50,000/month\n• **Service companies** (TCS, Wipro) — ₹10,000–₹20,000/month\n• **Remote / smaller startups** — ₹5,000–₹25,000/month\n\nStipend isn't everything — learning quality and brand name matter more at this stage!",
  skills: "The most in-demand skills for students in 2026:\n\n**For Web Dev:** React, TypeScript, Node.js, Next.js, PostgreSQL\n**For Data Science:** Python, Pandas, TensorFlow, SQL, Power BI\n**For AI/ML:** PyTorch, LangChain, RAG, Vector Databases, FastAPI\n**For DevOps:** Docker, Kubernetes, GitHub Actions, AWS/GCP\n**For Mobile:** React Native, Flutter\n\n**Soft skills that matter:** Communication, problem-solving, git workflow, writing technical docs\n\nPick ONE stack and go deep — breadth comes later!",
  college: "Making the most of college for your career:\n\n1. **Start building projects in your 1st year** — don't wait for placements\n2. **Contribute to open source** — great for visibility and experience\n3. **Join technical clubs and hackathons** — network is everything\n4. **Do at least 1 internship before final year** — experience compounds\n5. **Maintain a GitHub profile** — green squares matter to recruiters\n6. **Attend college career fairs** — many companies hire directly from campus\n\nYour CGPA matters for shortlisting at big companies — aim for 7.5+",
};

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('internship') || lower.includes('apply') || lower.includes('job')) return aiResponses.internship;
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) return aiResponses.resume;
  if (lower.includes('interview') || lower.includes('dsa') || lower.includes('coding')) return aiResponses.interview;
  if (lower.includes('salary') || lower.includes('stipend') || lower.includes('pay')) return aiResponses.salary;
  if (lower.includes('skill') || lower.includes('learn') || lower.includes('technology')) return aiResponses.skills;
  if (lower.includes('college') || lower.includes('campus') || lower.includes('student')) return aiResponses.college;
  return `That's a great question! Here's my advice:\n\n**Focus on these 3 things right now:**\n1. Build real projects that solve real problems\n2. Apply consistently — 5+ applications per week\n3. Learn DSA basics to pass screening rounds\n\nWould you like specific advice on internship hunting, resume writing, or interview preparation? Just ask!`;
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
    if (!text) return;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const reply = getBotReply(text);
    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setTyping(false);
  };

  const selectedPathData = careerPaths.find(p => p.id === selectedPath);
  const completedCount = currentRoadmap.filter(s => s.completed).length;
  const progress = currentRoadmap.length > 0 ? Math.round((completedCount / currentRoadmap.length) * 100) : 0;

  const toggleStep = (index: number) => {
    setCurrentRoadmap(prev => prev.map((s, i) => i === index ? { ...s, completed: !s.completed } : s));
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-gray-800 mt-2">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('• ') || line.startsWith('* ')) {
        const content = line.slice(2);
        const parts = content.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="shrink-0 text-primary-500">•</span>
            <span>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</span>
          </p>
        );
      }
      if (/^\d+\./.test(line)) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return <p key={i} className="text-sm text-gray-700">{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
      }
      if (line.trim() === '') return <div key={i} className="h-1" />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return <p key={i} className="text-sm text-gray-700">{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Career Guidance</h1>
          <p className="text-gray-500">Choose your path and follow the roadmap to your dream career</p>
        </div>
        <Button variant="primary" onClick={() => setShowChatbot(true)}>
          <MessageCircle className="w-4 h-4" /> AI Career Advisor
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
                  className={`cursor-pointer transition-all ${selectedPath === path.id ? 'ring-2 ring-primary-500 shadow-md' : ''}`}
                  onClick={() => handlePathSelect(path.id)}
                >
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${path.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{path.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{path.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{path.steps} steps</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{path.duration}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            path.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                            path.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{path.difficulty}</span>
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
                title={`${selectedPathData?.title} Roadmap`}
                subtitle={`${completedCount} of ${currentRoadmap.length} steps completed · ${progress}% done`}
              />
              <CardContent>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
                  <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="space-y-3">
                  {currentRoadmap.map((step, index) => (
                    <div
                      key={index}
                      onClick={() => toggleStep(index)}
                      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${step.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {step.completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-medium">{index + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${step.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>{step.title}</h4>
                        <p className="text-sm text-gray-500">{step.duration}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">Click any step to mark it complete/incomplete</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Your Progress" subtitle={selectedPathData?.title} />
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-primary-600">{progress}%</div>
                <div className="text-sm text-gray-500 mt-2">Complete</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-gray-500 mt-2">{completedCount} of {currentRoadmap.length} steps</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Tips" />
            <CardContent>
              <div className="space-y-3">
                {[
                  'Focus on one technology at a time',
                  'Build projects as you learn',
                  'Join communities for help',
                  'Track your progress daily',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary-600 text-sm font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Need Help?" />
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">Ask the AI Career Advisor anything about your career path, resume, or internship hunting.</p>
              <Button variant="primary" className="w-full" onClick={() => setShowChatbot(true)}>
                <MessageCircle className="w-4 h-4" /> Open AI Advisor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Chatbot Modal */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">AI Career Advisor</h3>
                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Online
                </p>
              </div>
              <button onClick={() => setShowChatbot(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 300, maxHeight: 450 }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-primary-100' : 'bg-gray-200'}`}>
                    {msg.role === 'bot' ? <Bot className="w-4 h-4 text-primary-600" /> : <User className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl space-y-1 ${
                    msg.role === 'bot'
                      ? 'bg-gray-50 border border-gray-100 rounded-tl-none'
                      : 'bg-primary-500 text-white rounded-tr-none'
                  }`}>
                    {msg.role === 'bot' ? formatMessage(msg.text) : <p className="text-sm text-white">{msg.text}</p>}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {['Internship tips', 'Resume advice', 'Interview prep', 'Skills to learn'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setInputText(suggestion)}
                  className="shrink-0 px-3 py-1 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 text-gray-600 text-xs rounded-full transition-colors border border-gray-200 font-medium"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2 p-4 border-t border-gray-100">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about internships, resume, interviews…"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                disabled={typing}
              />
              <Button variant="primary" onClick={sendMessage} disabled={!inputText.trim() || typing}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
