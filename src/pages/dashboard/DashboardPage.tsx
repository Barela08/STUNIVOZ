import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Calendar, BookOpen, FileText, TrendingUp,
  Sparkles, ArrowRight, Clock, CheckCircle, Star, Users, Award, Zap,
  MessageCircle, Send, Bot, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent, Button, ProgressBar } from '../../components/common';

type Message = { role: 'bot' | 'user'; text: string };

const AI_RESPONSES: Record<string, string> = {
  internship: "Great question! Here are tips to land your first internship:\n\n1. **Update your resume** with all projects and skills\n2. **Apply to 5–10 companies per week** — consistency matters\n3. **Use LinkedIn actively** — connect with recruiters\n4. **Practice DSA** on LeetCode (aim for Easy/Medium)\n5. **Build 2–3 solid projects** to showcase on GitHub\n\nStart applying to smaller startups first — they hire more interns and give more responsibility!",
  resume: "Here's how to write an ATS-optimized resume:\n\n• **Use keywords** from the job description\n• **Quantify achievements** — 'Improved performance by 40%' beats 'Improved performance'\n• **Keep it to 1 page** if you have less than 3 years of experience\n• **Use standard section headers** — Summary, Education, Skills, Projects, Experience\n• **Avoid tables/columns** — many ATS systems can't parse them\n\nUse the Resume Builder on STUNIVOZ to check your ATS score!",
  interview: "Here's how to prepare for tech interviews:\n\n**DSA (60% of interviews):**\n• LeetCode: Solve 50 Easy + 30 Medium problems\n• Focus: Arrays, Strings, Hashmaps, Trees, DP\n\n**System Design (for SDE-1+):**\n• Study URL shortener, Instagram feed, WhatsApp design\n\n**Behavioural (HR round):**\n• Prepare STAR stories for leadership, conflict, failure\n\n**On the day:**\n• Think out loud — interviewers want to see your process\n• Ask clarifying questions before coding",
  salary: "Typical internship stipends in India (2026):\n\n• **FAANG / Big Tech** — ₹80,000–₹1,50,000/month\n• **Product companies** (Zomato, Swiggy, CRED) — ₹40,000–₹80,000/month\n• **Series A–B startups** — ₹20,000–₹50,000/month\n• **Service companies** (TCS, Wipro) — ₹10,000–₹20,000/month\n\nStipend isn't everything — learning quality and brand name matter more at this stage!",
  skills: "Most in-demand skills for students in 2026:\n\n**Web Dev:** React, TypeScript, Node.js, Next.js, PostgreSQL\n**Data Science:** Python, Pandas, TensorFlow, SQL, Power BI\n**AI/ML:** PyTorch, LangChain, RAG, Vector DBs, FastAPI\n**DevOps:** Docker, Kubernetes, GitHub Actions, AWS/GCP\n**Mobile:** React Native, Flutter\n\nPick ONE stack and go deep — breadth comes later!",
  college: "Making the most of college for your career:\n\n1. **Start building projects in 1st year** — don't wait for placements\n2. **Contribute to open source** — great for visibility\n3. **Join technical clubs and hackathons**\n4. **Do at least 1 internship before final year**\n5. **Maintain a GitHub profile** — green squares matter to recruiters\n\nYour CGPA matters for shortlisting at big companies — aim for 7.5+",
};

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('internship') || lower.includes('apply') || lower.includes('job')) return AI_RESPONSES.internship;
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) return AI_RESPONSES.resume;
  if (lower.includes('interview') || lower.includes('dsa') || lower.includes('coding')) return AI_RESPONSES.interview;
  if (lower.includes('salary') || lower.includes('stipend') || lower.includes('pay')) return AI_RESPONSES.salary;
  if (lower.includes('skill') || lower.includes('learn') || lower.includes('technology')) return AI_RESPONSES.skills;
  if (lower.includes('college') || lower.includes('campus') || lower.includes('student')) return AI_RESPONSES.college;
  return "That's a great question! Here's my advice:\n\n**Focus on these 3 things right now:**\n1. Build real projects that solve real problems\n2. Apply consistently — 5+ applications per week\n3. Learn DSA basics to pass screening rounds\n\nWould you like specific advice on internship hunting, resume writing, or interview prep? Just ask!";
}

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-1" />;
    if (line.startsWith('• ') || line.startsWith('* ')) {
      const content = line.slice(2);
      const parts = content.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="shrink-0 text-primary-500">•</span>
          <span>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</span>
        </p>
      );
    }
    if (/^\d+\./.test(line)) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
  });
}

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Applications', value: 0, icon: FileText, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30', to: '/internships' },
    { label: 'Interviews', value: 0, icon: Calendar, color: 'text-accent-500', bg: 'bg-accent-100 dark:bg-accent-900/30', to: '/planner' },
    { label: 'Saved', value: 0, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', to: '/internships' },
    { label: 'Points', value: 0, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', to: '/gamification' },
  ];

  const recommendedInternships = [
    { id: '1', company: 'Google', role: 'Frontend Developer Intern', location: 'Bangalore', stipend: '₹50,000/month', skills: ['React', 'TypeScript', 'CSS'], posted: '2 days ago' },
    { id: '2', company: 'Microsoft', role: 'Full Stack Developer', location: 'Hyderabad', stipend: '₹45,000/month', skills: ['Node.js', 'React', 'SQL'], posted: '3 days ago' },
    { id: '3', company: 'Amazon', role: 'SDE Intern', location: 'Bangalore', stipend: '₹40,000/month', skills: ['Python', 'AWS', 'DSA'], posted: '5 days ago' },
  ];

  const upcomingEvents = [
    { id: '1', title: 'Google Cloud Hackathon', date: 'May 15, 2026', type: 'Hackathon' },
    { id: '2', title: 'AWS Career Workshop', date: 'May 18, 2026', type: 'Webinar' },
  ];

  const recommendedCourses = [
    { id: '1', title: 'Complete Web Development Bootcamp', platform: 'Udemy', rating: 4.8, duration: '48 hours' },
    { id: '2', title: 'React - The Complete Guide', platform: 'Udemy', rating: 4.7, duration: '52 hours' },
  ];

  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hi! I'm your AI Career Advisor 👋\n\nI can help you with:\n• Internship hunting tips\n• Resume and ATS advice\n• Interview preparation\n• Skills to learn in 2026\n• Salary and stipend benchmarks\n\nWhat would you like to know?" },
  ]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
    setMessages(prev => [...prev, { role: 'bot', text: getBotReply(text) }]);
    setTyping(false);
  };

  const quickPrompts = ['Internship tips', 'Resume help', 'Interview prep', 'Top skills 2026'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Ready to boost your career? Let's check your progress and find new opportunities.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="bg-white text-primary-600 hover:bg-primary-50"
              onClick={() => navigate('/career')}
            >
              <Sparkles className="w-5 h-5" />
              Career Roadmaps
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.to}>
            <Card className="!p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recommended Internships */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardHeader
                    title="Recommended Internships"
                    subtitle="Based on your profile and skills"
                  />
                </div>
                <Link to="/internships">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recommendedInternships.map((internship) => (
                <div key={internship.id} className="p-4 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{internship.role}</h3>
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">Active</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{internship.company}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{internship.location}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" />{internship.stipend}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{internship.posted}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {internship.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg">{skill}</span>
                      ))}
                    </div>
                    <Button variant="primary" size="sm" onClick={() => navigate('/internships')}>
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resume Score */}
          <Card>
            <CardHeader title="Resume Score" subtitle="Upload your resume to get a score" />
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none"
                      strokeDasharray="351.86" strokeDashoffset="351.86" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">—</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/resume')}>
                Build Resume <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card padding="none">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <CardHeader title="Upcoming Events" />
                <Link to="/events">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer" onClick={() => navigate('/events')}>
                  <div className="w-10 h-10 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{event.date}</div>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg">{event.type}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Courses */}
          <Card padding="none">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <CardHeader title="Recommended Courses" />
                <Link to="/courses">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer" onClick={() => navigate('/courses')}>
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{course.platform} · {course.duration}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />{course.rating}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Inline AI Career Chat */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <button
          onClick={() => setChatOpen(o => !o)}
          className="w-full flex items-center justify-between p-4 lg:p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">AI Career Advisor</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ask anything about internships, resume, interviews &amp; more</p>
            </div>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" /> Online
            </span>
          </div>
          {chatOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {chatOpen && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            {/* Messages area */}
            <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.role === 'user'
                      ? <p className="text-sm">{msg.text}</p>
                      : <div className="space-y-0.5">{formatMessage(msg.text)}</div>
                    }
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                    <div className="flex gap-1 items-center h-5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              {quickPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => { setInputText(p); }}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-full transition-colors font-medium"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2 items-center border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about internships, resume, interviews..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || typing}
                className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Career Path Progress */}
      <Card>
        <CardHeader
          title="Your Career Path"
          subtitle="Start exploring career roadmaps"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/career')}>
              View Roadmap <ArrowRight className="w-4 h-4" />
            </Button>
          }
        />
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">0</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">—</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
            </div>
          </div>
          <ProgressBar value={0} color="primary" />
        </CardContent>
      </Card>

      {/* Badges & Achievements */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Recent Badges"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/gamification')}>View All</Button>}
          />
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {[
                { icon: Award, label: 'First Apply', bg: 'bg-yellow-50 dark:bg-yellow-900/20', color: 'text-yellow-500', locked: true },
                { icon: CheckCircle, label: 'Profile', bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-500', locked: true },
                { icon: Users, label: 'Community', bg: 'bg-primary-50 dark:bg-primary-900/20', color: 'text-primary-500', locked: true },
                { icon: Zap, label: 'Locked', bg: 'bg-gray-100 dark:bg-gray-800', color: 'text-gray-400', locked: true },
              ].map((badge, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 ${badge.bg} rounded-xl opacity-40 cursor-default`}
                >
                  <badge.icon className={`w-8 h-8 ${badge.color}`} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{badge.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">Complete activities to unlock badges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Leaderboard"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/gamification')}>View All</Button>}
          />
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No leaderboard data yet.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Earn points to appear here!</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/gamification')}>
                Start Earning Points
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
